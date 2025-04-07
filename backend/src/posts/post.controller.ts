/**
 * @file post.controller.ts
 * @description REST API endpoints for managing campus-wide posts.
 */
import { Controller, Get, Post as HttpPost, Body, Param, ForbiddenException, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostController {
    constructor(private readonly postService: PostService) { }

    /**
     * Creates a new post.
     * @param dto Object containing campusId, content, and optionally hashtags.
     * @param userId The authenticated user's ID.
     * @returns The created post.
     */
    @HttpPost()
    async createPost(
        @Body() dto: { campusId: string; content: string; hashtags?: string[] },
        @CurrentUser() userId: string,
    ) {
        if (!userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.postService.createPost({
            campusId: dto.campusId,
            senderId: userId,
            content: dto.content,
            hashtags: dto.hashtags || [],
        });
    }

    /**
     * Retrieves posts for a campus.
     * @param campusId The campus identifier.
     * @param userId The authenticated user's ID.
     * @returns An array of posts for the campus.
     */
    @Get(':campusId')
    async getPosts(@Param('campusId') campusId: string, @CurrentUser() userId: string) {
        // The user validation logic remains unchanged.
        const user = await this.postService['usersService'].findUserByIdentifier({ id: userId });
        if (!user) {
            throw new ForbiddenException('User not found.');
        }
        const userCampusId = typeof user.campus === 'object' && 'id' in user.campus
            ? (user.campus as { id: string }).id
            : typeof user.campus === 'object' && '_id' in user.campus
                ? (user.campus as { _id: string })._id
                : user.campus;
        if (userCampusId.toString() !== campusId.trim()) {
            throw new ForbiddenException('You do not have access to these posts.');
        }
        return this.postService.getPostsForCampus(campusId);
    }

    /**
     * Adds a like to a post.
     * @param postId The identifier of the post.
     * @param userId The authenticated user's ID.
     * @returns The updated post.
     */
    @HttpPost(':postId/like')
    async likePost(@Param('postId') postId: string, @CurrentUser() userId: string) {
        if (!userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.postService.likePost(postId, userId);
    }
}
