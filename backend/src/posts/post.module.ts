/**
 * @file posts.module.ts
 * @description Module encapsulating the posts functionality.
 */
import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { PostRepository } from './post.repository';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from '../users/users.module';
import { PostsGateway } from './post.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    EventEmitterModule.forRoot(),
    UsersModule,
  ],
  providers: [PostRepository, PostService, PostsGateway, Logger],
  controllers: [PostController],
  exports: [PostService],
})
export class PostsModule {}
