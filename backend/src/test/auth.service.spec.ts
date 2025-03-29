import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { SessionService } from '../../src/session/session.service';
import { SignupDto } from '../../src/auth/dtos/signup.dto';
import { LoginDto } from '../../src/auth/dtos/login.dto';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let sessionService: Partial<SessionService>;

  const fakeUser = {
    email: 'test@example.com',
    username: 'testuser',
    campus: 'Test Campus',
  };

  beforeEach(async () => {
    // Simulate a valid registration and credential validation.
    usersService = {
      registerUser: jest.fn().mockResolvedValue(fakeUser),
      validateUserCredentials: jest.fn().mockResolvedValue(fakeUser),
    };

    // Simulate a session service that returns a valid session for logout.
    sessionService = {
      getSession: jest.fn().mockResolvedValue(fakeUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: SessionService, useValue: sessionService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should signup a user and return a success message', async () => {
      const dto: SignupDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password',
        campus: 'Campus',
      };
      const result = await authService.signup(dto);
      expect(result).toEqual({ message: 'Signup successful', user: fakeUser });
      expect(usersService.registerUser).toHaveBeenCalledWith(dto);
    });

    it('should propagate error if registration fails', async () => {
      const error = new InternalServerErrorException('Registration failed');
      (usersService.registerUser as jest.Mock).mockRejectedValueOnce(error);
      const dto: SignupDto = {
        email: 'fail@example.com',
        username: 'failuser',
        password: 'password',
        campus: 'Campus',
      };
      await expect(authService.signup(dto)).rejects.toThrow(error);
    });

    it('should throw error if required fields are missing (empty dto)', async () => {
      // Simulate validation failure via UsersService.
      const error = new InternalServerErrorException('Missing fields');
      (usersService.registerUser as jest.Mock).mockRejectedValueOnce(error);
      const dto = {} as SignupDto;
      await expect(authService.signup(dto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const dto: LoginDto = {
        identifier: fakeUser.email,
        password: 'password',
      };
      const result = await authService.login(dto);
      expect(result).toEqual({ message: 'Login successful', user: fakeUser });
      expect(usersService.validateUserCredentials).toHaveBeenCalledWith(dto);
    });

    it('should login a user with username as identifier', async () => {
      const dto: LoginDto = {
        identifier: fakeUser.username,
        password: 'password',
      };
      const result = await authService.login(dto);
      expect(result).toEqual({ message: 'Login successful', user: fakeUser });
      expect(usersService.validateUserCredentials).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      (usersService.validateUserCredentials as jest.Mock).mockRejectedValueOnce(
        new UnauthorizedException('Invalid credentials'),
      );
      const dto: LoginDto = {
        identifier: fakeUser.email,
        password: 'wrong',
      };
      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if identifier is missing', async () => {
      const dto: LoginDto = {
        identifier: '',
        password: 'password',
      };
      (usersService.validateUserCredentials as jest.Mock).mockRejectedValueOnce(
        new UnauthorizedException('Invalid credentials'),
      );
      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if password is missing', async () => {
      const dto: LoginDto = {
        identifier: fakeUser.email,
        password: '',
      };
      (usersService.validateUserCredentials as jest.Mock).mockRejectedValueOnce(
        new UnauthorizedException('Invalid credentials'),
      );
      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout a user and return a confirmation message', async () => {
      const sessionId = 'session123';
      const result = await authService.logout(sessionId);
      expect(result).toEqual({ message: 'Logout successful' });
      expect(sessionService.getSession).toHaveBeenCalledWith(sessionId);
    });

    it('should throw error if session service fails', async () => {
      const sessionId = 'session123';
      const error = new InternalServerErrorException('Session error');
      (sessionService.getSession as jest.Mock).mockRejectedValueOnce(error);
      await expect(authService.logout(sessionId)).rejects.toThrow(error);
    });

    it('should handle empty sessionId gracefully', async () => {
      const result = await authService.logout('');
      expect(result).toEqual({ message: 'Logout successful' });
      // In this test, sessionService.getSession should be called with an empty string.
      expect(sessionService.getSession).toHaveBeenCalledWith('');
    });
  });
});
