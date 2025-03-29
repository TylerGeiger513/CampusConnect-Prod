import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsController } from '../../src/channels/channels.controller';
import { MessageService } from '../../src/channels/message.service';
import { ChannelsService } from '../../src/channels/channels.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../../src/channels/dtos/create-message.dto';
import { Request } from 'express';

// A fake ChannelsGuard is assumed to already validate membership so we focus on controller logic.
interface SessionRequest extends Request {
    session: { userId: string };
}

describe('ChannelsController', () => {
    let channelsController: ChannelsController;
    let messageService: Partial<MessageService>;
    let channelsService: Partial<ChannelsService>;

    // Fake DM channel: a DM between userA and userB.
    const dmChannel = { _id: 'channelDM123', type: 'DM', participants: ['userA', 'userB'] };

    beforeEach(async () => {
        messageService = {
            sendMessage: jest.fn().mockImplementation(async (dto) => {
                // Simulate sending a message.
                if (!dto.content || dto.content.trim() === '') {
                    throw new BadRequestException('Message content cannot be empty.');
                }
                return { _id: 'msg1', channelId: dto.channelId, senderId: dto.senderId, content: dto.content };
            }),
            getMessages: jest.fn().mockResolvedValue([
                { _id: 'msg1', channelId: dmChannel._id, senderId: 'userA', content: 'Hello, userB!' },
            ]),
            editMessage: jest.fn().mockImplementation(async (messageId: string, content: string, userId: string) => {
                if (messageId !== 'msg1') {
                    return null;
                }
                if (userId !== 'userA') {
                    throw new ForbiddenException('Unauthorized');
                }
                return { _id: messageId, channelId: dmChannel._id, senderId: userId, content, edited: true };
            }),
            deleteMessage: jest.fn().mockImplementation(async (messageId: string, userId: string) => {
                if (messageId !== 'msg1') {
                    throw new NotFoundException('Message not found');
                }
                if (userId !== 'userA') {
                    throw new ForbiddenException('Unauthorized');
                }
                return;
            }),
        };

        channelsService = {
            getChannelsForUser: jest.fn().mockResolvedValue([dmChannel]),
            getChannelById: jest.fn().mockResolvedValue(dmChannel),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChannelsController],
            providers: [
                { provide: MessageService, useValue: messageService },
                { provide: ChannelsService, useValue: channelsService },
            ],
        }).compile();

        channelsController = module.get<ChannelsController>(ChannelsController);
    });

    describe('getChannels', () => {
        it('should return channels for authenticated user', async () => {
            const fakeReq: SessionRequest = { session: { userId: 'userA' } } as SessionRequest;
            const result = await channelsController.getChannels(fakeReq);
            expect(result).toEqual([dmChannel]);
            expect(channelsService.getChannelsForUser).toHaveBeenCalledWith('userA');
        });
    });

    describe('sendMessage', () => {
        it('should send a message successfully when valid data is provided', async () => {
            const dto: CreateMessageDto = { content: 'Hello, DM!', channelId: dmChannel._id! };
            const fakeReq: SessionRequest = { session: { userId: 'userA' } } as SessionRequest;
            const result = await channelsController.sendMessage(dto, fakeReq);
            expect(result).toHaveProperty('_id', 'msg1');
            expect(messageService.sendMessage).toHaveBeenCalledWith({
                channelId: dmChannel._id!,
                senderId: 'userA',
                content: dto.content,
            });
        });

        it('should throw BadRequestException if content is empty', async () => {
            (messageService.sendMessage as jest.Mock).mockRejectedValueOnce(new BadRequestException('Message content cannot be empty.'));
            const dto: CreateMessageDto = { content: ' ', channelId: dmChannel._id! };
            const fakeReq: SessionRequest = { session: { userId: 'userA' } } as SessionRequest;
            await expect(channelsController.sendMessage(dto, fakeReq)).rejects.toThrow(BadRequestException);
        });

        it('should throw ForbiddenException if session is missing (i.e. user not authenticated)', async () => {
            const dto: CreateMessageDto = { content: 'Hello, DM!', channelId: dmChannel._id! };
            // Simulate missing session by not including userId.
            const fakeReq = { session: {} } as SessionRequest;
            await expect(channelsController.sendMessage(dto, fakeReq)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('getMessages', () => {
        it('should retrieve messages when channel exists and user is a participant', async () => {
            const fakeReq: SessionRequest = { session: { userId: 'userA' }, params: { channelId: dmChannel._id } } as unknown as SessionRequest;
            const result = await channelsController.getMessages(fakeReq);
            expect(Array.isArray(result)).toBe(true);
            expect(messageService.getMessages).toHaveBeenCalledWith(dmChannel._id!);
        });

        it('should throw ForbiddenException if channel is not found', async () => {
            (channelsService.getChannelById as jest.Mock).mockResolvedValueOnce(null);
            const fakeReq: SessionRequest = { session: { userId: 'userA' }, params: { channelId: 'invalid' } } as unknown as SessionRequest;
            await expect(channelsController.getMessages(fakeReq)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('editMessage', () => {
        it('should edit a message when valid data is provided by the sender', async () => {
            // Simulate editing by userA (the sender).
            const fakeReq: SessionRequest = { session: { userId: 'userA' } } as SessionRequest;
            const newContent = 'Edited message content';
            const result = await channelsController.editMessage(`${newContent}`, { ...fakeReq, params: { messageId: 'msg1' } } as any);
            expect(result.edited).toBeTruthy();
            expect(result.content).toEqual(newContent);
            expect(messageService.editMessage).toHaveBeenCalledWith('msg1', newContent, 'userA');
        });

        it('should throw error if content is missing', async () => {
            const fakeReq: SessionRequest = { session: { userId: 'userA' }, params: { messageId: 'msg1' } } as any;
            await expect(channelsController.editMessage('', fakeReq)).rejects.toThrow(Error);
        });

        it('should throw error if messageId is missing', async () => {
            const fakeReq: SessionRequest = { session: { userId: 'userA' }, params: {} } as any;
            await expect(channelsController.editMessage('New content', fakeReq)).rejects.toThrow(Error);
        });
    });

    describe('deleteMessage', () => {
        it('should delete a message when requested by the sender', async () => {
            const fakeReq: SessionRequest = { session: { userId: 'userA' }, params: { messageId: 'msg1' } } as any;
            await expect(channelsController.deleteMessage(fakeReq)).resolves.toBeUndefined();
            expect(messageService.deleteMessage).toHaveBeenCalledWith('msg1', 'userA');
        });

        it('should throw error if messageId is missing', async () => {
            const fakeReq: SessionRequest = { session: { userId: 'userA' }, params: {} } as any;
            await expect(channelsController.deleteMessage(fakeReq)).rejects.toThrow(Error);
        });
    });
});
