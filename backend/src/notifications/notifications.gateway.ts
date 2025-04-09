import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { ConfigService } from '../config/config.service';
import { SessionService } from '../session/session.service';
import { Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * @class NotificationsGateway
 * @description Handles WebSocket connections and dispatches notifications.
 * Uses session-based authentication to map clients to user IDs.
 */
@WebSocketGateway({
    namespace: '/notifications',
    path: '/notifications/socket.io',
    cors: {
        origin: `http://${process.env.CORS_ORIGIN}`, 
        credentials: true,
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    // Map to store connected client sockets by user ID.
    private clients: Map<string, Socket> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly eventEmitter: EventEmitter2, 
    ) { }

    onModuleInit() {
        // Subscribe to notification events via EventEmitter2.
        this.eventEmitter.on('notification.sent', (notification) => {
            if (notification && notification.userId) {
                const client = this.clients.get(notification.userId);
                if (client) {
                    client.emit('notification', notification);
                    this.logger.log(`Notification sent to user ${notification.userId}: ${JSON.stringify(notification)}`);
                } else {
                    this.logger.warn(`Attempted to notify user ${notification.userId}, but they are not connected.`);
                }
            }
        });
    }

    async handleConnection(client: Socket) {
        try {
            const cookies = cookie.parse(client.handshake.headers.cookie || '');
            const rawCookie = cookies['connect.sid'];
            if (!rawCookie) {
                this.logger.error('No session cookie found. Disconnecting client.');
                client.disconnect();
                return;
            }
            this.logger.log(`Client connected: rawCookie=${rawCookie}`);

            const session = await this.sessionService.getSessionFromRawCookie(rawCookie);
            if (!session || !session.userId) {
                this.logger.error('Unauthenticated session. Disconnecting client.');
                client.disconnect();
                return;
            }
            // Map the socket by userId.
            this.clients.set(session.userId, client);
            this.logger.log(`Client connected: userId=${session.userId}`);
        } catch (error) {
            this.logger.error('Error during connection authentication:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Remove the disconnected client from the map.
        for (const [userId, socket] of this.clients.entries()) {
            if (socket.id === client.id) {
                this.clients.delete(userId);
                this.logger.log(`Client disconnected: userId=${userId}`);
                break;
            }
        }
    }

    /**
  * Sends a notification to a specific user.
  * This method is now available so that notifications.service.ts
  * can call it without error.
  * @param userId - The target user ID.
  * @param payload - The notification payload.
  */
    public sendNotification(userId: string, payload: any): void {
        const client = this.clients.get(userId);
        if (client) {
            client.emit('notification', payload);
            this.logger.log(`Notification sent to user ${userId}: ${JSON.stringify(payload)}`);
        } else {
            this.logger.warn(`Attempted to notify user ${userId}, but they are not connected.`);
        }
    }
    
    @SubscribeMessage('ping')
    handlePing(client: Socket, payload: any): void {
        client.emit('pong', payload);
    }
}
