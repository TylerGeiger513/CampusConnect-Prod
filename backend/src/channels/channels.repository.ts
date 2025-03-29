import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { IChannel, Channel } from './channel.schema';

@Injectable()
export class ChannelsRepository {
    private readonly logger = new Logger(ChannelsRepository.name);

    constructor(@InjectModel(Channel.name) private readonly channelModel: Model<IChannel & Document>) { }

    /**
     * Creates a new channel.
     * @param dto - Partial channel data.
     * @returns The created channel as a plain object.
     */
    async createChannel(dto: Partial<IChannel>): Promise<IChannel> {
        const created = new this.channelModel(dto);
        const saved = await created.save();
        const plain = saved.toObject();
        if (plain._id) {
            plain._id = plain._id.toString();
        }
        return plain;
    }

    /**
     * Finds a channel by its ID.
     */
    async findChannelById(id: string): Promise<IChannel | null> {
        const channel = await this.channelModel.findById(id).lean().exec();
        if (channel && channel._id) {
            channel._id = channel._id.toString();
        }
        return channel;
    }

    /**
     * Finds all channels that include a given user.
     */
    async findChannelsForUser(userId: string): Promise<IChannel[]> {
        const channels = await this.channelModel.find({ participants: userId }).lean().exec();
        return channels.map(c => ({ ...c, _id: c._id.toString() }));
    }

    /**
     * Finds a DM channel for two users.
     */
    async findDMChannel(userId1: string, userId2: string): Promise<IChannel | null> {
        const channel = await this.channelModel.findOne({
            type: 'DM',
            participants: { $all: [userId1, userId2], $size: 2 },
        }).lean().exec();
        if (channel && channel._id) {
            channel._id = channel._id.toString();
        }
        return channel;
    }
}
