import { ChannelsGateway } from '../../src/channels/channels.gateway';
import { ConfigService } from '../../src/config/config.service';
import { SessionService } from '../../src/session/session.service';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';

describe('ChannelsGateway', () => {
  let gateway: ChannelsGateway;
  let configService: Partial<ConfigService>;
  let sessionService: Partial<SessionService>;

  // Helper to create a fake socket.
  const createFakeSocket = (handshakeCookie: string | undefined): Socket => {
    return {
      id: 'fake-socket-id',
      handshake: { headers: { cookie: handshakeCookie } },
      emit: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
      join: jest.fn(),
    } as unknown as Socket;
  };

  beforeEach(() => {
    configService = { sessionSecret: 'test-secret' };

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

    gateway = new ChannelsGateway(
      configService as ConfigService,
      sessionService as SessionService,
    );
    (gateway as any).clients = new Map();
  });

  describe('handleConnection', () => {
    it('should disconnect client if no cookie is present', async () => {
      const fakeSocket = createFakeSocket(undefined);
      await gateway.handleConnection(fakeSocket);
      expect(fakeSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if unsigning fails', async () => {
      const fakeCookie = cookie.serialize('connect.sid', 'badcookie');
      const fakeSocket = createFakeSocket(fakeCookie);
      jest.spyOn(signature, 'unsign').mockReturnValue(null);
      await gateway.handleConnection(fakeSocket);
      expect(fakeSocket.disconnect).toHaveBeenCalled();
      (signature.unsign as jest.Mock).mockRestore();
    });

    it('should disconnect client if cookie is empty', async () => {
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

    it('should disconnect if session object lacks userId', async () => {
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
      // First client (user123)
      const signedCookie1 = signature.sign('valid-session-id', configService.sessionSecret as string);
      const serialized1 = cookie.serialize('connect.sid', signedCookie1);
      const fakeSocket1 = createFakeSocket(serialized1);
      await gateway.handleConnection(fakeSocket1);
      expect((gateway as any).clients.get('user123')).toEqual(fakeSocket1);

      // Second client (simulate user456)
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

    it('should not throw if client is not in map', () => {
      const fakeSocket = createFakeSocket('dummy');
      expect(() => gateway.handleDisconnect(fakeSocket)).not.toThrow();
    });
  });

  describe('joinChannel event', () => {
    it('should have client join a room and return the socket', () => {
      const fakeSocket = createFakeSocket('dummy');
      fakeSocket.join = jest.fn().mockReturnValue(true);
      const channelId = 'channel1';
      const returned = gateway.handleJoinChannel(fakeSocket, channelId);
      expect(fakeSocket.join).toHaveBeenCalledWith(channelId);
      expect(returned).toEqual(fakeSocket);
    });
  });

  describe('sendChannelEvent', () => {
    it('should broadcast event to all clients in the room', () => {
      // Override server.to() to simulate room broadcasting.
      gateway.server = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as any;
      const event = 'newMessage';
      const payload = { text: 'Hello everyone' };
      gateway.sendChannelEvent('channel1', event, payload);
      expect(gateway.server.to).toHaveBeenCalledWith('channel1');
    });
  });

  describe('handleSendMessage', () => {
    it('should emit error if required fields are missing', async () => {
      const fakeSocket = createFakeSocket('dummy');
      fakeSocket.emit = jest.fn();
      await gateway.handleSendMessage(fakeSocket, { channelId: '', senderId: '', content: '' });
      expect(fakeSocket.emit).toHaveBeenCalledWith('error', 'Missing required fields in message payload');
    });

    it('should broadcast message if payload is valid', async () => {
      const fakeSocket = createFakeSocket('dummy');
      fakeSocket.emit = jest.fn();
      // Override server.to() to simulate broadcasting.
      gateway.server = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      } as any;
      const payload = { channelId: 'channel1', senderId: 'userA', content: 'Hello' };
      await gateway.handleSendMessage(fakeSocket, payload);
      expect(gateway.server.to).toHaveBeenCalledWith('channel1');
    });
  });
});
