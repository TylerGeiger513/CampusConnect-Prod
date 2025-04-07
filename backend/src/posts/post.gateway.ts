// posts/post.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@WebSocketGateway({
  namespace: '/posts',
  path: '/posts/socket.io',
  cors: {
    origin: '*', // Adjust this for production.
    credentials: true,
  },
})
export class PostsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PostsGateway.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    // Broadcast new post events.
    this.eventEmitter.on('post.created', (post) => {
      if (post && post.campusId) {
        this.server.to(post.campusId).emit('postCreated', post);
        this.logger.log(`Broadcasted new post to campus ${post.campusId}`);
      }
    });

    // Broadcast post like updates.
    this.eventEmitter.on('post.liked', (post) => {
      if (post && post.campusId) {
        this.server.to(post.campusId).emit('postLiked', post);
        this.logger.log(`Broadcasted post like update to campus ${post.campusId}`);
      }
    });
  }

  handleConnection(client: Socket) {
    const campusId = client.handshake.query.campusId as string;
    if (campusId) {
      client.join(campusId);
      this.logger.log(`Client ${client.id} joined campus room ${campusId}`);
    } else {
      client.disconnect();
      this.logger.warn(`Client ${client.id} did not provide campusId and was disconnected`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinCampus')
  handleJoinCampus(client: Socket, campusId: string): void {
    client.join(campusId);
    this.logger.log(`Client ${client.id} joined campus room ${campusId}`);
  }
}
