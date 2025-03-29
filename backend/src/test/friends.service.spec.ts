import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from '../../src/friends/friends.service';
import { UsersRepository } from '../../src/users/users.repository';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FriendsService', () => {
  let friendsService: FriendsService;
  let usersRepository: Partial<UsersRepository>;
  let notificationsService: Partial<NotificationsService>;

  // Define a user interface for testing.
  interface User {
    _id: string;
    email: string;
    username: string;
    password: string;
    campus: string;
    friendRequests: string[];
    sentFriendRequests: string[];
    friends: string[];
    blockedUsers: string[];
  }

  // Use factory functions to get fresh objects for each test.
  const createUserA = (): User => ({
    _id: 'userA',
    email: 'userA@example.com',
    username: 'userA',
    password: 'hashedA',
    campus: 'Campus A',
    friendRequests: [],
    sentFriendRequests: [],
    friends: [],
    blockedUsers: [],
  });
  const createUserB = (): User => ({
    _id: 'userB',
    email: 'userB@example.com',
    username: 'userB',
    password: 'hashedB',
    campus: 'Campus B',
    friendRequests: [],
    sentFriendRequests: [],
    friends: [],
    blockedUsers: [],
  });

  let userA: User;
  let userB: User;

  beforeEach(async () => {
    // Reinitialize fresh users for each test.
    userA = createUserA();
    userB = createUserB();

    usersRepository = {
      findByIdentifier: jest.fn().mockImplementation(async (identifier) => {
        // Return userA or userB based on identifier matching.
        if (
          identifier.id === userA._id ||
          identifier.email === userA.email ||
          identifier.username === userA.username
        ) {
          return { ...userA };
        }
        if (
          identifier.id === userB._id ||
          identifier.email === userB.email ||
          identifier.username === userB.username
        ) {
          return { ...userB };
        }
        return null;
      }),
      updateUser: jest.fn().mockImplementation(async (userId, update) => {
        // Simulate update by merging update into userA or userB.
        if (userId === userA._id) {
          userA = { ...userA, ...update };
          return { ...userA };
        }
        if (userId === userB._id) {
          userB = { ...userB, ...update };
          return { ...userB };
        }
        throw new NotFoundException();
      }),
    };

    notificationsService = {
      notifyFriendRequest: jest.fn(),
      notifyFriendRequestAccepted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    friendsService = module.get<FriendsService>(FriendsService);
  });

  describe('sendFriendRequest', () => {
    it('should throw error if sending request to self', async () => {
      await expect(friendsService.sendFriendRequest('userA', 'userA')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if target user is not found', async () => {
      (usersRepository.findByIdentifier as jest.Mock).mockResolvedValueOnce(null);
      await expect(friendsService.sendFriendRequest('userA', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw error if users are already friends', async () => {
      // Set up users as already friends.
      userA.friends = ['userB'];
      await expect(friendsService.sendFriendRequest('userA', 'userB')).rejects.toThrow(BadRequestException);
    });

    it('should send friend request successfully', async () => {
      // Ensure arrays are empty.
      userA.friends = [];
      userA.sentFriendRequests = [];
      userB.friendRequests = [];
      await friendsService.sendFriendRequest('userA', 'userB');
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userB', expect.objectContaining({
        friendRequests: expect.arrayContaining(['userA']),
      }));
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userA', expect.objectContaining({
        sentFriendRequests: expect.arrayContaining(['userB']),
      }));
      expect(notificationsService.notifyFriendRequest).toHaveBeenCalledWith('userB', 'userA');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should throw error if no friend request exists', async () => {
      userA.friendRequests = [];
      await expect(friendsService.acceptFriendRequest('userA', 'userB')).rejects.toThrow(BadRequestException);
    });

    it('should accept friend request successfully', async () => {
      userA.friendRequests = ['userB'];
      userA.friends = [];
      userB.sentFriendRequests = ['userA'];
      userB.friends = [];
      await friendsService.acceptFriendRequest('userA', 'userB');
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userA', expect.objectContaining({
        friendRequests: [],
        friends: expect.arrayContaining(['userB']),
      }));
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userB', expect.objectContaining({
        sentFriendRequests: [],
        friends: expect.arrayContaining(['userA']),
      }));
      expect(notificationsService.notifyFriendRequestAccepted).toHaveBeenCalledWith('userB', 'userA');
    });
  });

  describe('denyFriendRequest', () => {
    it('should throw error if no friend request exists', async () => {
      userA.friendRequests = [];
      await expect(friendsService.denyFriendRequest('userA', 'userB')).rejects.toThrow(BadRequestException);
    });

    it('should deny friend request successfully', async () => {
      userA.friendRequests = ['userB'];
      await friendsService.denyFriendRequest('userA', 'userB');
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userA', { friendRequests: [] });
    });
  });

  describe('removeFriend', () => {
    it('should throw error if users are not friends', async () => {
      userA.friends = [];
      await expect(friendsService.removeFriend('userA', 'userB')).rejects.toThrow(BadRequestException);
    });

    it('should remove friends successfully', async () => {
      userA.friends = ['userB'];
      userB.friends = ['userA'];
      await friendsService.removeFriend('userA', 'userB');
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userA', { friends: [] });
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userB', { friends: [] });
    });
  });

  describe('cancelFriendRequest', () => {
    it('should cancel a sent friend request successfully', async () => {
      userA.sentFriendRequests = ['userB'];
      userB.friendRequests = ['userA'];
      await friendsService.cancelFriendRequest('userA', 'userB');
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userA', { sentFriendRequests: [] });
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userB', { friendRequests: [] });
    });
  });

  describe('blockUser', () => {
    it('should throw error if user is already blocked', async () => {
      userA.blockedUsers = ['userB'];
      await expect(friendsService.blockUser('userA', 'userB')).rejects.toThrow(BadRequestException);
    });

    it('should block a user successfully', async () => {
      // Set up relationships that should be removed.
      userA.friends = ['userB'];
      userA.friendRequests = ['userB'];
      userA.sentFriendRequests = ['userB'];
      await friendsService.blockUser('userA', 'userB');
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userA', expect.objectContaining({
        blockedUsers: expect.arrayContaining(['userB']),
        friends: expect.not.arrayContaining(['userB']),
        friendRequests: expect.not.arrayContaining(['userB']),
        sentFriendRequests: expect.not.arrayContaining(['userB']),
      }));
    });
  });

  describe('unblockUser', () => {
    it('should throw error if user is not blocked', async () => {
      userA.blockedUsers = [];
      await expect(friendsService.unblockUser('userA', 'userB')).rejects.toThrow(BadRequestException);
    });

    it('should unblock a user successfully', async () => {
      userA.blockedUsers = ['userB'];
      await friendsService.unblockUser('userA', 'userB');
      expect(usersRepository.updateUser).toHaveBeenCalledWith('userA', expect.objectContaining({
        blockedUsers: expect.not.arrayContaining(['userB']),
      }));
    });
  });
});
