import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @interface IChannel
 * @description Represents a communication channel.
 */
export interface IChannel {
    _id?: string;
    type: 'DM' | 'GROUP';
    name?: string;
    participants: string[]; // Array of user IDs.
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * @class Channel
 * @description Mongoose schema for channels.
 */
@Schema({ timestamps: true })
export class Channel implements IChannel {
    @Prop({ required: true, enum: ['DM', 'GROUP'] })
    type!: 'DM' | 'GROUP';

    @Prop()
    name?: string;

    @Prop({ type: [String], required: true, default: [] })
    participants!: string[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
