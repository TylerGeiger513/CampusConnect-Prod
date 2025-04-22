import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = IMessage & Document;

/**
 * @interface IMessage
 * @description Represents a message within a channel.
 */
export interface IMessage {
    _id?: string;
    channelId: string;
    senderId: string;
    senderName?: string;
    content: string;
    edited?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    readBy?: string[];
}

/**
 * @class Message
 * @description Mongoose schema for messages.
 */
@Schema({ timestamps: true })
export class Message implements IMessage {
    @Prop({ required: true })
    channelId!: string;

    @Prop({ required: true })
    senderId!: string;

    @Prop({ required: false, type: String })
    senderName?: string;

    @Prop({ required: true })
    content!: string;

    @Prop({ default: false })
    edited?: boolean;

    @Prop({ type: [String], default: [] })
    readBy!: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
