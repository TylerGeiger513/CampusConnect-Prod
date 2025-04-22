/**
 * @file post.repository.ts
 * @description Repository layer for managing post data.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPost, PostDocument, Post } from './post.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostRepository {
    private readonly logger = new Logger(PostRepository.name);

    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        private readonly usersService: UsersService,
    ) { }

    /**
     * Creates a new post.
     * @param dto Partial post data.
     * @param senderUsername The sender's username.
     * @param senderMajor The sender's major.
     * @returns The created post as a plain object.
     */
    async createPost(dto: Partial<IPost>, senderUsername: string, senderMajor?: string): Promise<IPost> {
        const created = new this.postModel({
            ...dto,
            senderName: senderUsername,
            senderMajor: senderMajor, // Save sender's major
        });
        const saved = await created.save();
        const plain = saved.toObject() as IPost;
        if (plain._id) {
            plain._id = plain._id.toString();
        }
        return plain;
    }

    /**
     * Retrieves all posts associated with a campus.
     * @param campusId The campus identifier.
     * @returns Array of posts sorted by newest first.
     */
    async getPostsByCampus(campusId: string): Promise<IPost[]> {
        const posts = await this.postModel.find({ campusId }).sort({ createdAt: -1 }).lean().exec();
        return Promise.all(posts.map(async post => {
            const user = await this.usersService.findUserByIdentifier({ id: post.senderId });
            const postIsLiked = post.likes.includes(post.senderId); // Note: This logic seems incorrect, should check against the *requesting* user's ID, not senderId
            // Ensure senderMajor is included, falling back if user or major is missing
            const senderMajor = user?.major || undefined;
            return { ...post, _id: post._id.toString(), liked: postIsLiked, senderMajor: senderMajor };
        }));
    }

    /**
     * Toggles a like for a given post.
     * @param postId - The identifier of the post.
     * @param userId - The identifier of the user toggling the like.
     * @returns The updated post document, or null if not found.
     */
    async toggleLike(postId: string, userId: string): Promise<IPost | null> {
        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            return null;
        }
        const alreadyLiked = post.likes.includes(userId);
        let updatedPost;
        if (alreadyLiked) {
            updatedPost = await this.postModel.findByIdAndUpdate(
                postId,
                { $pull: { likes: userId } },
                { new: true }
            ).lean().exec();
        } else {
            updatedPost = await this.postModel.findByIdAndUpdate(
                postId,
                { $push: { likes: userId } },
                { new: true }
            ).lean().exec();
        }
        if (updatedPost && updatedPost._id) {
            updatedPost._id = updatedPost._id.toString();
        }
        return updatedPost as IPost | null;
    }

    getLikeStatus(postId: string, userId: string): Promise<boolean> {
        return this.postModel.findById(postId).then(post => {
            if (!post) {
                return false;
            }
            return post.likes.includes(userId);
        });
    }

    getPostById(postId: string): Promise<IPost | null> {
        return this.postModel.findById(postId).then(post => {
            if (!post) {
                return null;
            }
            const plainPost = post.toObject() as IPost;
            if (plainPost._id) {
                plainPost._id = plainPost._id.toString();
            }
            return plainPost;
        });
    }
}
