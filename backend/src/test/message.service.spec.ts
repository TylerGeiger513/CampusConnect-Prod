import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from '../../src/channels/message.service';
import { MessageRepository } from '../../src/channels/message.repository';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';

// Fake message interface for testing.
interface IMessage {
  _id?: string;
  channelId: string;
  senderId: string;
  content: string;
  edited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

describe('MessageService', () => {
  let messageService: MessageService;
  let messageRepository: Partial<MessageRepository>;

  const fakeMessage: IMessage = {
    _id: 'msg1',
    channelId: 'channelDM123',
    senderId: 'userA',
    content: 'Hello, userB!',
    edited: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    messageRepository = {
      sendMessage: jest.fn().mockImplementation(async (dto: Partial<IMessage>) => {
        if (!dto.content || dto.content.trim() === '') {
          throw new BadRequestException('Message content cannot be empty.');
        }
        if (!dto.channelId) {
          throw new BadRequestException('Channel ID is required.');
        }
        // Return a new message object with a fake _id.
        return { _id: 'msg-created', ...dto, createdAt: new Date(), edited: false };
      }),
      editMessage: jest.fn().mockImplementation(async (messageId: string, content: string, userId: string) => {
        // If messageId does not match, return null.
        if (messageId !== fakeMessage._id) {
          return null;
        }
        // If user is not the sender, throw unauthorized.
        if (userId !== fakeMessage.senderId) {
          throw new UnauthorizedException('Unauthorized');
        }
        return { ...fakeMessage, content, edited: true, updatedAt: new Date() };
      }),
      deleteMessage: jest.fn().mockImplementation(async (messageId: string, userId: string) => {
        if (messageId !== fakeMessage._id) {
          throw new NotFoundException('Message not found');
        }
        if (userId !== fakeMessage.senderId) {
          throw new UnauthorizedException('Unauthorized');
        }
        return;
      }),
      getMessages: jest.fn().mockResolvedValue([fakeMessage]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: MessageRepository, useValue: messageRepository },
      ],
    }).compile();

    messageService = module.get<MessageService>(MessageService);
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const dto = { channelId: 'channelDM123', senderId: 'userA', content: 'Hello, userB!' };
      const result = await messageService.sendMessage(dto);
      expect(result).toHaveProperty('_id', 'msg-created');
      expect(result.content).toEqual('Hello, userB!');
    });

    it('should throw error if message content is empty', async () => {
      const dto = { channelId: 'channelDM123', senderId: 'userA', content: '   ' };
      await expect(messageService.sendMessage(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error if channelId is missing', async () => {
      const dto = { channelId: '', senderId: 'userA', content: 'Hello' };
      await expect(messageService.sendMessage(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('editMessage', () => {
    it('should allow a user to edit their own message', async () => {
      const newContent = 'Edited message content';
      const updated = await messageService.editMessage(fakeMessage._id!, newContent, 'userA');
      expect(updated.edited).toBeTruthy();
      expect(updated.content).toEqual(newContent);
    });

    it('should throw NotFoundException if message does not exist', async () => {
      await expect(messageService.editMessage('nonexistent', 'new content', 'userA')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user did not send the message', async () => {
      await expect(messageService.editMessage(fakeMessage._id!, 'new content', 'userB')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteMessage', () => {
    it('should allow a user to delete their own message', async () => {
      await expect(messageService.deleteMessage(fakeMessage._id!, 'userA')).resolves.toBeUndefined();
      expect(messageRepository.deleteMessage).toHaveBeenCalledWith(fakeMessage._id!, 'userA');
    });

    it('should throw NotFoundException if message does not exist when deleting', async () => {
      (messageRepository.deleteMessage as jest.Mock).mockRejectedValueOnce(new NotFoundException('Message not found'));
      await expect(messageService.deleteMessage('nonexistent', 'userA')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user did not send the message', async () => {
      await expect(messageService.deleteMessage(fakeMessage._id!, 'userB')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages for a channel', async () => {
      const messages = await messageService.getMessages('channelDM123');
      expect(Array.isArray(messages)).toBe(true);
      expect(messageRepository.getMessages).toHaveBeenCalledWith('channelDM123');
    });
  });
});
