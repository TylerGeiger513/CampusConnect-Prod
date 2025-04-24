import { Injectable, Logger } from '@nestjs/common';
import { ChannelsRepository } from './channels.repository';
import { IChannel } from './channel.schema';
import { UsersRepository } from '../users/users.repository';
import { MessageRepository } from './message.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChannelsService {
    private readonly logger = new Logger(ChannelsService.name);

    constructor(
        private readonly channelsRepository: ChannelsRepository,
        private readonly usersRepository: UsersRepository,
        private readonly messageRepository: MessageRepository,
        private readonly eventEmitter: EventEmitter2,
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

    /**
     * Retrieves a channel by its ID.
     */
    async getChannelById(channelId: string): Promise<IChannel | null> {
        return this.channelsRepository.findChannelById(channelId);
    }

    async getChannelsMeta(userId: string) {
        // query channels, lookup last message & unread count per channel
        const channels = await this.channelsRepository.findChannelsForUser(userId);
        return Promise.all(channels.map(async ch => {
            const channelId = ch._id!;  // assert non‑null
            const lastMsg = await this.messageRepository.findLast(channelId);
            const unread = await this.messageRepository.countUnread(channelId, userId);
            // if dm then pass dmwith as other user name
            if (ch.type === 'DM') {
                const otherUser = ch.participants.find(p => p !== userId);
                if (otherUser) {
                    const user = await this.usersRepository.findByIdentifier({ id: otherUser });
                    return {
                        channelId: ch._id,
                        name: ch.name,
                        participants: ch.participants,
                        lastMessage: lastMsg?.content,
                        lastTs: lastMsg?.createdAt,
                        unreadCount: unread,
                        isDM: true,
                        dmWith: user?.username
                    };
                }
            } else {
                return {
                    channelId: ch._id,
                    name: ch.name,
                    participants: ch.participants,
                    lastMessage: lastMsg?.content,
                    lastTs: lastMsg?.createdAt,
                    unreadCount: unread,
                    isDM: false,
                }
            }
           
        }));
    }

    async searchChannels(userId: string, query: string) {
        const meta = await this.getChannelsMeta(userId);
        // simple weight-based filter
        return meta
            .map(m => {
                let score = 0;
                if (m && m.name?.toLowerCase().includes(query)) score += 100;
                if (m && m.participants.some(p => /* lookup username/fullname */ false)) score += 50;
                // lastly match the query for any message in the channel
                if (m && m.lastMessage?.toLowerCase().includes(query)) score += 10;
                return { ...m, score };
            })
            .filter(m => m.score > 0)
            .sort((a,b) => b.score - a.score);
    }

    async createChannel(participantIds: string[]) {
        return this.channelsRepository.createChannel({
            name: '', // generate or leave blank
            type: 'DM',
            participants: participantIds,
        });
    }

    async markRead(channelId: string, userId: string) {
        // mark all messages as read for this user
        await this.messageRepository.markRead(channelId, userId);
        // emit via EventEmitter2
        this.eventEmitter.emit('channel.read', { channelId, userId });
    }
}
