import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @interface IUser
 * @description Represents a user.
 */
export interface IUser {
    _id?: string;
    email: string;
    username: string;
    password: string; // Hashed password.
    campus: string;
    friendRequests?: string[];         // Incoming friend request user IDs.
    sentFriendRequests?: string[];       // Outgoing friend request user IDs.
    friends?: string[];                  // Confirmed friend user IDs.
    blockedUsers?: string[];             // Blocked user IDs.
    createdAt?: Date;
    updatedAt?: Date;
}

export type UserDocument = User & Document;

/**
 * @class User
 * @description Mongoose schema for the User collection.
 */
@Schema({ timestamps: true })
export class User implements IUser {
    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true, unique: true })
    username!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ required: true })
    campus!: string;

    @Prop({ type: [String], default: [] })
    friendRequests!: string[];

    @Prop({ type: [String], default: [] })
    sentFriendRequests!: string[];

    @Prop({ type: [String], default: [] })
    friends!: string[];

    @Prop({ type: [String], default: [] })
    blockedUsers!: string[];

}

export const UserSchema = SchemaFactory.createForClass(User);
