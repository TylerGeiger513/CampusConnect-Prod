import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { SessionService } from '../session/session.service';
import { Request } from 'express';
import { UpdateUserDto } from './dtos/update.dto';

/**
 * @class AuthService
 * @description Provides authentication logic including signup, login, and logout.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Signs up a new user.
   * @param dto - Signup data.
   * @returns Confirmation message and created user.
   */
  async signup(dto: SignupDto, req: Request): Promise<any> {
    const user = await this.usersService.registerUser(dto);

    if (!user || !user._id) {
      throw new Error('Failed to create user.');
    }

    await this.sessionService.saveSession(req, user._id);
    return { message: 'Signup successful', user };
  }

  /**
   * Logs in a user by validating credentials.
   * @param dto - Login data.
   * @returns Confirmation message and authenticated user.
   */
  async login(dto: LoginDto, req: Request): Promise<any> {
    const user = await this.usersService.validateUserCredentials(dto);
    if (!user || !user._id) {
      throw new Error('Failed to create user.');
    }
    
    await this.sessionService.saveSession(req, user._id);
    return { message: 'Login successful', user };
  }

  /**
   * Logs out a user by invalidating the session.
   * @param sessionId - The session identifier.
   * @returns A logout confirmation message.
   */
  async logout(sessionId: string): Promise<any> {
    await this.sessionService.destroySession(sessionId);
    return { message: 'Logout successful' };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.usersService.findUserByIdentifier({ id: userId });
    if (!user) {
      throw new Error('User not found.');
    }
    return user;
  }

  async checkUserExists(dto: any): Promise<any> {
    const user = await this.usersService.findUserByIdentifier(dto);
    return user;
  }

  async updateUserProfile(userId: string, update: UpdateUserDto): Promise<any> {
    const user = await this.usersService.updateUser(userId, update);
    if (!user) {
      throw new Error('Failed to update user.');
    }
    return { message: 'Profile updated successfully', user };
  }

}
