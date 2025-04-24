import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { IMessage } from './message.schema';
import { EventEmitter2 } from '@nestjs/event-emitter'; // <-- Import EventEmitter2

@Injectable()
export class MessageService {
    private readonly logger = new Logger(MessageService.name);
 
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly eventEmitter: EventEmitter2, // <-- Inject EventEmitter2
    ) { }

    /**
     * Retrieves messages for a given channel. Optionally, a limit can be provided.
     * @param channelId - The channel ID.
     * @param limit - The maximum amount of messages to retrieve.
     */
    async getMessages(channelId: string): Promise<IMessage[]> {
        return this.messageRepository.getMessages(channelId);
    }

    /**
     * Sends a new message in a channel.
     * @param dto - Object containing channelId, senderId, and content.
     */
    async sendMessage(dto: { channelId: string; senderId: string; content: string}, senderUsername: string ): Promise<IMessage> {
        const message = await this.messageRepository.sendMessage(dto, senderUsername);
        // Emit the event so that other parts (like the gateway) can broadcast it.
        this.eventEmitter.emit('message.sent', message);
        return message;
    }

    /**
     * Edits an existing message.
     * @param messageId - The message identifier.
     * @param content - The new message content.
     * @param userId - The user identifier.
     * @returns The updated message.
     */
    async editMessage(messageId: string, content: string, userId: string): Promise<IMessage> {
        const message = await this.messageRepository.editMessage(messageId, content, userId);
        if (!message) {
            throw new NotFoundException('Message not found.');
        }
        return message;
    }

    /**
     * Deletes a message.
     * @param messageId - The message identifier.
     * @param userId - The user identifier.
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        if (!messageId) {
            throw new Error('Message identifier is required.');
        }
        await this.messageRepository.deleteMessage(messageId, userId);
    }

    async queryMessages(channelId: string, query: string, limit: number): Promise<IMessage[]> {
        if (!channelId) {
            throw new Error('Channel identifier is required.');
        }
        if (!query) {
            throw new Error('Query string is required.');
        }
        return this.messageRepository.queryMessages(channelId, query, limit);
    }
    
}
