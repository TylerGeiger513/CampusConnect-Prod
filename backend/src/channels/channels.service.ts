import { Injectable, Logger } from '@nestjs/common';
import { ChannelsRepository } from './channels.repository';
import { IChannel } from './channel.schema';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class ChannelsService {
    private readonly logger = new Logger(ChannelsService.name);

    constructor(private readonly channelsRepository: ChannelsRepository,
        private readonly usersRepository: UsersRepository
    ) { }

    /**
     * Retrieves all channels that a user participates in.
     */
    async getChannelsForUser(userId: string): Promise<IChannel[]> {
        return this.channelsRepository.findChannelsForUser(userId);
    }

    /**
     * Gets an existing DM channel between two users or creates one if none exists.
     */
    async getOrCreateDMChannel(userId1: string, userId2: string): Promise<IChannel> {
        const existing = await this.channelsRepository.findDMChannel(userId1, userId2);
        this.logger.log(`Found existing DM channel: ${existing}`);
        if (existing) {
            return existing;
        }
        const user1 = await this.usersRepository.findByIdentifier({ id: userId1});
        const user2 = await this.usersRepository.findByIdentifier( { id: userId1});
        if (!user1 || !user2) {
            throw new Error('One or more users not found.');
        }
        this.logger.log(`Creating new DM channel between ${user1.username} and ${user2}.`);
        return this.channelsRepository.createChannel({
            name: `${user1.username} and ${user2.username}`,
            type: 'DM',
            participants: [userId1, userId2],
        });
    }

    // /**
    //  * Creates a new group channel.
    //  * @param name - The channel name.
    //  * @param participants - Array of user IDs.
    //  * Later this will be implemented as a separate feature.
    //  */ 
    // async createGroupChannel(name: string, participants: string[]): Promise<IChannel> {
    //     return this.channelsRepository.createChannel({
    //         type: 'GROUP',
    //         name,
    //         participants,
    //     });
    // }

    /**
     * Retrieves a channel by its ID.
     */
    async getChannelById(channelId: string): Promise<IChannel | null> {
        return this.channelsRepository.findChannelById(channelId);
    }
}
