/**
 * @file post.schema.ts
 * @description Mongoose schema definition and types for campus-wide posts.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @interface IPost
 * @description Represents a campus-wide post.
 */
export interface IPost {
    _id: string;
    campusId: string;
    senderId: string;
    senderName?: string;
    content: string;
    hashtags: string[];  
    likes: string[]; // Array of user IDs who liked the post.
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * @class Post
 * @description Mongoose schema class for campus-wide posts.
 */
@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true })
    campusId!: string;

    @Prop({ required: true })
    senderId!: string;

    @Prop()
    senderName?: string;

    @Prop({ required: true })
    content!: string;

    @Prop({
        type: [String],
        default: [],
        validate: {
            validator: function (hashtags: string[]) {
                return hashtags.every(tag => typeof tag === 'string' && tag.length <= 32);
            },
            message: 'Each hashtag must be a string of 32 characters or fewer.',
        },
    })
    hashtags!: string[];

    @Prop({ type: [String], default: [] })
    likes!: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

/**
 * @typedef PostDocument
 * @description Mongoose document type for posts.
 */
export type PostDocument = Post & Document;
