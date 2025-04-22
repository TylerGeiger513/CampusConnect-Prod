import { Controller, Get, Post, Body, UseGuards, Param, BadRequestException, ForbiddenException, Query } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Logger } from '@nestjs/common';
import { MessageService } from './message.service';
import { ChannelsGuard } from './channels.guard';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('channels')
@UseGuards(ChannelsGuard)
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService,
        private readonly messageService: MessageService,
        private readonly usersService: UsersService,
        private readonly logger: Logger,
    ) { }

    /**
     * Retrieves all channels for the authenticated user.
     */
    @Get()
    async getChannels(@CurrentUser() userId: string) {
        if (!userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.channelsService.getChannelsForUser(userId);
    }

    /**
     * Sends a message in a channel.
     */
    @Post('message')
    async sendMessage(@Body() dto: CreateMessageDto, @CurrentUser() userId: string) {
        if (!userId) {
            throw new ForbiddenException('User not authenticated.');
        }

        const sender = await this.usersService.findUserByIdentifier({ id: userId });
        if (!sender) {
            throw new BadRequestException('Sender not found.');
        }
        if (!dto.content || dto.content.trim() === '') {
            throw new BadRequestException('Message content is required.');
        }
        if (!dto['channelId']) {
            throw new BadRequestException('Channel identifier is required.');
        }
        return this.messageService.sendMessage({ ...dto, senderId: userId }, sender.username);
    }

    /**
     * Retrieves messages for a channel.
     */
    @Get(':channelId/messages')
    async getMessages(@Param('channelId') channelId: string, @CurrentUser() userId: string) {
        if (!channelId) {
            throw new BadRequestException('Channel identifier is required.');
        }
        this.logger.log(`Fetching messages for channel: ${channelId}`);
        // Validate channel existence before proceeding.
        const userChannels = await this.channelsService.getChannelsForUser(userId);
        const trimmedId = channelId.trim();
        const channel = userChannels.find(c => c._id?.toString() === trimmedId);
        if (!channel) {
            throw new ForbiddenException('Channel not found.');
        }
        return { messages: await this.messageService.getMessages(channelId) };
    }

    /**
     * Edits an existing message and validates that the user is the sender.
     */
    @Post('message/:messageId/edit')
    async editMessage(
        @Param('messageId') messageId: string,
        @Body('content') content: string,
        @CurrentUser() userId: string,
    ) {
        if (!content || content.trim() === '') {
            throw new BadRequestException('Content is required.');
        }
        if (!messageId) {
            throw new BadRequestException('Message identifier is required.');
        }
        if (!userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.messageService.editMessage(messageId, content, userId);
    }

    /**
     * Deletes a message.
     */
    @Post('message/:messageId/delete')
    async deleteMessage(@Param('messageId') messageId: string, @CurrentUser() userId: string) {
        messageId = messageId.trim();
        this.logger.log(`UserID: ${userId}`)
        if (!messageId) {
            throw new BadRequestException('Message identifier is required.');
        }
        if (!userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.messageService.deleteMessage(messageId, userId);
    }

    /**
     * Retrieves or creates a DM channel between the authenticated user and the target user.
     */
    @Post('channel/getDMChannel')
    async getDMChannel(@Body() dto: { userId: string }, @CurrentUser() userId: string) {
        
        if (!userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.channelsService.getOrCreateDMChannel(userId, dto.userId);
    }

    @Get('meta')
    async getMeta(@CurrentUser() userId: string) {
        // returns [{ channelId, name, participants, lastMessage, lastTs, unreadCount }, …]
        return this.channelsService.getChannelsMeta(userId);
    }

    @Get('search')
    async search(
        @Query('query') q: string,
        @CurrentUser() userId: string,
    ) {
        return this.channelsService.searchChannels(userId, q);
    }

    @Post('create')
    async createChannel(
        @Body('participantIds') parts: string[],
        @CurrentUser() userId: string,
    ) {
        // include current user
        return this.channelsService.createChannel([userId, ...parts]);
    }

    @Post('markRead')
    async markRead(
        @Body('channelId') channelId: string,
        @CurrentUser() userId: string,
    ) {
        await this.channelsService.markRead(channelId, userId);
        return { success: true };
    }
}
