import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { IMessage, Message } from './message.schema';

@Injectable()
export class MessageRepository {
    private readonly logger = new Logger(MessageRepository.name);

    constructor(@InjectModel(Message.name) private readonly messageModel: Model<IMessage & Document>) { }

    /**
     * Retrieves all messages in a channel, sorted by creation time.
     */
    async getMessages(channelId: string): Promise<IMessage[]> {
        // Check if at least one message exists for the channel (or optionally check for channel existence in another way)
        const messageExists = await this.messageModel.exists({ channelId });
        // if (!messageExists) {
        //     throw new ForbiddenException('Channel not found.');
        // }
        // Retrieve all messages, sort them by createdAt, and lean() them to get plain JS objects.
        const messages = await this.messageModel.find({ channelId }).sort({ createdAt: 1 }).lean().exec();
        return messages.map(m => ({ ...m, _id: m._id.toString() }));
    }

    /**
     * Creates (sends) a new message.
     */
    async sendMessage(dto: Partial<IMessage>, senderUsername: string): Promise<IMessage> {
        const created = new this.messageModel({
            ...dto,
            senderName: senderUsername,
        });
        const saved = await created.save();
        let plain = saved.toObject();
        this.logger.log(`${plain}`)
        if (plain._id) {
            plain._id = plain._id.toString();
        }
        return plain;
    }

    /**
     * Edits an existing message.
     */
    async editMessage(messageId: string, content: string, userId: string): Promise<IMessage | null> {
        const message = await this.messageModel.findById(messageId).exec();
        if (!message) {
            return null;
        }
        if (userId !== message.senderId) {
            throw new Error('Unauthorized');
        }
        message.content = content;
        message.edited = true;
        await message.save();
        return message.toObject();
    }


    /**
     * Deletes a message.
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        const message = await this.messageModel.findById(messageId).exec();
        if (!message) {
            throw new Error('Message not found');
        }
        if (userId !== message.senderId) {
            throw new Error('Unauthorized');
        }
        await this.messageModel.findByIdAndDelete(messageId).exec();
    }

    /** Returns the most recent message in a channel */
    async findLast(channelId: string): Promise<IMessage | null> {
        const msg = await this.messageModel
            .findOne({ channelId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return msg && { ...msg, _id: msg._id.toString() };
    }

    /** Counts messages in channel not yet read by userId */
    async countUnread(channelId: string, userId: string): Promise<number> {
        return this.messageModel
            .countDocuments({ channelId, readBy: { $ne: userId } })
            .exec();
    }

    /** Marks all messages in channel as read by userId */
    async markRead(channelId: string, userId: string): Promise<void> {
        await this.messageModel
            .updateMany(
                { channelId, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } },
            )
            .exec();
    }

    /** Searches messages in a channel for a given query string */
    async queryMessages(channelId: string, query: string, limit: number): Promise<IMessage[]> {
        const regex = new RegExp(query, 'i'); // Case-insensitive search
        const messages = await this.messageModel
            .find({ channelId, content: regex })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        return messages.map(m => ({ ...m, _id: m._id.toString() }));
    }
}
