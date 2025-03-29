import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { UsersRepository } from '../../src/users/users.repository';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from '../../src/auth/dtos/signup.dto';
import { LoginDto } from '../../src/auth/dtos/login.dto';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Partial<UsersRepository>;

  // Fake user used for tests.
  const fakeUser = {
    _id: 'user123',
    email: 'test@example.com',
    username: 'testuser',
    password: '$2a$10$hashedpassword',
    campus: 'Test Campus',
    friendRequests: [],
    sentFriendRequests: [],
    friends: [],
    blockedUsers: [],
  };

  beforeEach(async () => {
    // Simulated repository with find and create methods.
    usersRepository = {
      findByEmail: jest.fn().mockImplementation(async (email: string) => {
        if (email === fakeUser.email) return fakeUser;
        return null;
      }),
      findByIdentifier: jest.fn().mockImplementation(async (identifier: any) => {
        if (
          identifier.email === fakeUser.email ||
          identifier.username === fakeUser.username ||
          identifier.id === fakeUser._id
        ) {
          return fakeUser;
        }
        return null;
      }),
      createUser: jest.fn().mockImplementation(
        async (email: string, username: string, hashedPassword: string, campus: string) => ({
          email,
          username,
          password: hashedPassword,
          campus,
          friendRequests: [],
          sentFriendRequests: [],
          friends: [],
          blockedUsers: [],
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepository },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('registerUser', () => {
    it('should register a new user when email and username are unique', async () => {
      const dto: SignupDto = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'plainpassword',
        campus: 'New Campus',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-new-password' as never);

      const result = await usersService.registerUser(dto);
      expect(result).toEqual({
        email: dto.email,
        username: dto.username,
        password: 'hashed-new-password',
        campus: dto.campus,
        friendRequests: [],
        sentFriendRequests: [],
        friends: [],
        blockedUsers: [],
      });
      expect(usersRepository.createUser).toHaveBeenCalledWith(
        dto.email,
        dto.username,
        'hashed-new-password',
        dto.campus,
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto: SignupDto = {
        email: fakeUser.email, // duplicate email
        username: 'uniqueusername',
        password: 'pass',
        campus: 'Campus',
      };
      await expect(usersService.registerUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate username', async () => {
      const dto: SignupDto = {
        email: 'unique@example.com',
        username: fakeUser.username, // duplicate username
        password: 'pass',
        campus: 'Campus',
      };
      await expect(usersService.registerUser(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUserCredentials', () => {
    it('should return user for valid credentials', async () => {
      const dto: LoginDto = {
        identifier: fakeUser.email,
        password: 'plainpassword',
      };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await usersService.validateUserCredentials(dto);
      expect(result).toEqual(fakeUser);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, fakeUser.password);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto: LoginDto = {
        identifier: 'nonexistent@example.com',
        password: 'pass',
      };
      await expect(usersService.validateUserCredentials(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const dto: LoginDto = {
        identifier: fakeUser.email,
        password: 'wrongpassword',
      };
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(usersService.validateUserCredentials(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
