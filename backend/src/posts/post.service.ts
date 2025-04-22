/**
 * @file post.service.ts
 * @description Service layer for business logic related to campus-wide posts.
 */
import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { IPost } from './post.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostService {
    private readonly logger = new Logger(PostService.name);

    constructor(
        private readonly postRepository: PostRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly usersService: UsersService,
    ) { }

    /**
     * Creates a new post after validating the user's campus.
     * @param dto Object containing campusId, senderId, content, and optionally hashtags.
     * @returns The created post.
     */
    async createPost(dto: { campusId: string; senderId: string; content: string; hashtags?: string[] }): Promise<IPost> {
        const user = await this.usersService.findUserByIdentifier({ id: dto.senderId });
        if (!user) {
            throw new ForbiddenException('Sender not found.');
        }
        this.logger.log(`User ${user._id} is creating a post in campus ${dto.campusId}: ${JSON.stringify(user.campus)}`);

        const userCampusId = typeof user.campus === 'object' && 'id' in user.campus
            ? (user.campus as { id: string }).id
            : typeof user.campus === 'object' && '_id' in user.campus
                ? (user.campus as { _id: string })._id
                : user.campus;

        if (userCampusId.toString() !== dto.campusId.trim()) {
            throw new ForbiddenException('You can only post within your campus.');
        }

        // Pass user's major to the repository
        const post = await this.postRepository.createPost(dto, user.username, user.major);
        this.eventEmitter.emit('post.created', post);
        return post;
    }

    /**
     * Retrieves posts for a specific campus.
     * @param campusId The campus identifier.
     * @returns An array of posts.
     */
    async getPostsForCampus(campusId: string): Promise<IPost[]> {
        return this.postRepository.getPostsByCampus(campusId);
    }

    /**
     * Adds a like to a post from a given user.
     * @param postId The identifier of the post.
     * @param userId The identifier of the user liking the post.
     * @returns The updated post.
     */
    async likePost(postId: string, userId: string): Promise<IPost> {
        const post = await this.postRepository.toggleLike(postId, userId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        this.eventEmitter.emit('post.liked', post);
        return post;
    }

    async getLikeStatus(postId: string, userId: string): Promise<boolean> {
        const post = await this.postRepository.getPostById(postId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post.likes.includes(userId);
    }
}
