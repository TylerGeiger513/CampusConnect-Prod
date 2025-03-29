import { NotificationsGateway } from '../../src/notifications/notifications.gateway';
import { ConfigService } from '../../src/config/config.service';
import { SessionService } from '../../src/session/session.service';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let configService: Partial<ConfigService>;
  let sessionService: Partial<SessionService>;

  // Helper: Create a fake socket with minimal Socket.IO functionality.
  const createFakeSocket = (handshakeCookie: string | undefined): Socket => {
    return {
      id: 'fake-socket-id',
      handshake: {
        headers: { cookie: handshakeCookie },
      },
      emit: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(), // We'll override this later if needed.
    } as unknown as Socket;
  };

  beforeEach(() => {
    configService = {
      sessionSecret: 'test-secret',
    };

    // For testing, sessionService.getSession returns a valid session if given "valid-session-id",
    // returns an empty object if "no-user", and null otherwise.
    sessionService = {
      getSession: jest.fn().mockImplementation(async (sessionId: string) => {
        if (sessionId === 'valid-session-id') {
          return { userId: 'user123' };
        }
        if (sessionId === 'no-user') {
          return {};
        }
        return null;
      }),
    };

    gateway = new NotificationsGateway(
      configService as ConfigService,
      sessionService as SessionService,
    );
    // Reset the internal clients map between tests.
    (gateway as any).clients = new Map();
  });

  describe('handleConnection', () => {
    it('should disconnect client if no cookie is present', async () => {
      const fakeSocket = createFakeSocket(undefined);
      await gateway.handleConnection(fakeSocket);
      expect(fakeSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if cookie is present but unsigning fails', async () => {
      const fakeCookie = cookie.serialize('connect.sid', 'badcookie');
      const fakeSocket = createFakeSocket(fakeCookie);
      // Force unsign to fail.
      jest.spyOn(signature, 'unsign').mockReturnValue(null);
      await gateway.handleConnection(fakeSocket);
      expect(fakeSocket.disconnect).toHaveBeenCalled();
      (signature.unsign as jest.Mock).mockRestore();
    });

    it('should disconnect client if cookie parses to empty string', async () => {
      const fakeSocket = createFakeSocket('');
      await gateway.handleConnection(fakeSocket);
      expect(fakeSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if session retrieval returns null', async () => {
      const signedCookie = signature.sign('invalid-session-id', configService.sessionSecret as string);
      const serialized = cookie.serialize('connect.sid', signedCookie);
      (sessionService.getSession as jest.Mock).mockResolvedValueOnce(null);
      const fakeSocket = createFakeSocket(serialized);
      await gateway.handleConnection(fakeSocket);
      expect(fakeSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if session retrieval returns an object without userId', async () => {
      const signedCookie = signature.sign('no-user', configService.sessionSecret as string);
      const serialized = cookie.serialize('connect.sid', signedCookie);
      const fakeSocket = createFakeSocket(serialized);
      await gateway.handleConnection(fakeSocket);
      expect(fakeSocket.disconnect).toHaveBeenCalled();
    });

    it('should add client to map when authenticated', async () => {
      const signedCookie = signature.sign('valid-session-id', configService.sessionSecret as string);
      const serialized = cookie.serialize('connect.sid', signedCookie);
      const fakeSocket = createFakeSocket(serialized);
      await gateway.handleConnection(fakeSocket);
      expect((gateway as any).clients.get('user123')).toEqual(fakeSocket);
    });

    it('should allow multiple clients with different userIds', async () => {
      // First client with user123.
      const signedCookie1 = signature.sign('valid-session-id', configService.sessionSecret as string);
      const serialized1 = cookie.serialize('connect.sid', signedCookie1);
      const fakeSocket1 = createFakeSocket(serialized1);
      await gateway.handleConnection(fakeSocket1);
      expect((gateway as any).clients.get('user123')).toEqual(fakeSocket1);

      // Second client: simulate different session returning user456.
      (sessionService.getSession as jest.Mock).mockResolvedValueOnce({ userId: 'user456' });
      const signedCookie2 = signature.sign('valid-session-id', configService.sessionSecret as string);
      const serialized2 = cookie.serialize('connect.sid', signedCookie2);
      const fakeSocket2 = createFakeSocket(serialized2);
      await gateway.handleConnection(fakeSocket2);
      expect((gateway as any).clients.get('user456')).toEqual(fakeSocket2);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from map on disconnect', async () => {
      const signedCookie = signature.sign('valid-session-id', configService.sessionSecret as string);
      const serialized = cookie.serialize('connect.sid', signedCookie);
      const fakeSocket = createFakeSocket(serialized);
      await gateway.handleConnection(fakeSocket);
      expect((gateway as any).clients.get('user123')).toEqual(fakeSocket);
      gateway.handleDisconnect(fakeSocket);
      expect((gateway as any).clients.has('user123')).toBe(false);
    });

    it('should do nothing if disconnected client is not in the map', async () => {
      const fakeSocket = createFakeSocket('dummy');
      expect(() => gateway.handleDisconnect(fakeSocket)).not.toThrow();
    });
  });

  describe('sendNotification', () => {
    it('should emit notification to connected client', () => {
      const fakeSocket = createFakeSocket('dummy');
      (gateway as any).clients.set('user123', fakeSocket);
      const payload = { type: 'FRIEND_REQUEST', message: 'Test notification' };
      gateway.sendNotification('user123', payload);
      expect(fakeSocket.emit).toHaveBeenCalledWith('notification', payload);
    });

    it('should log warning if target client is not connected', () => {
      const spyWarn = jest.spyOn((gateway as any).logger, 'warn');
      gateway.sendNotification('user456', { type: 'FRIEND_REQUEST' });
      expect(spyWarn).toHaveBeenCalled();
    });

    it('should handle undefined payload gracefully', () => {
      const fakeSocket = createFakeSocket('dummy');
      (gateway as any).clients.set('user123', fakeSocket);
      expect(() => gateway.sendNotification('user123', undefined)).not.toThrow();
      expect(fakeSocket.emit).toHaveBeenCalledWith('notification', undefined);
    });

    it('should simulate client receiving notification via event listener', () => {
      const listeners: { [event: string]: Function[] } = {};
      const fakeSocket = createFakeSocket('dummy');

      // Override "on" to capture listeners and return the fake socket.
      fakeSocket.on = jest.fn((event: string, callback: (...args: any[]) => void): Socket => {
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event].push(callback);
        return fakeSocket;
      });
      // Override "emit" to call registered listeners.
      fakeSocket.emit = jest.fn((event: string, payload: any): boolean => {
        if (listeners[event]) {
          listeners[event].forEach((cb) => cb(payload));
        }
        return true;
      });

      (gateway as any).clients.set('user123', fakeSocket);
      const onNotification = jest.fn();
      // Register a listener for the 'notification' event.
      fakeSocket.on('notification', onNotification);
      const payload = { type: 'FRIEND_REQUEST', message: 'Test notification received' };
      gateway.sendNotification('user123', payload);
      expect(onNotification).toHaveBeenCalledWith(payload);
    });
  });
});
