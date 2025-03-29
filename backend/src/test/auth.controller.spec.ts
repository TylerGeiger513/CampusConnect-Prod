import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { SignupDto } from '../auth/dtos/signup.dto';
import { LoginDto } from '../auth/dtos/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;

  const fakeUser = { email: 'test@example.com', username: 'testuser', campus: 'Test Campus' };

  beforeEach(async () => {
    authService = {
      signup: jest.fn().mockResolvedValue({ message: 'Signup successful', user: fakeUser }),
      login: jest.fn().mockResolvedValue({ message: 'Login successful', user: fakeUser }),
      logout: jest.fn().mockResolvedValue({ message: 'Logout successful' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should signup a user', async () => {
    const dto: SignupDto = { email: 'new@example.com', username: 'newuser', password: 'pass', campus: 'Campus' };
    const result = await authController.signup(dto);
    expect(result).toEqual({ message: 'Signup successful', user: fakeUser });
    expect(authService.signup).toHaveBeenCalledWith(dto);
  });

  it('should login a user', async () => {
    const dto: LoginDto = { identifier: fakeUser.email, password: 'pass' };
    const result = await authController.login(dto);
    expect(result).toEqual({ message: 'Login successful', user: fakeUser });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should logout a user', async () => {
    const fakeRequest = { session: { id: 'session123', userId: 'user123' } } as any;
    const result = await authController.logout(fakeRequest);
    expect(result).toEqual({ message: 'Logout successful' });
    expect(authService.logout).toHaveBeenCalledWith('session123');
  });

  it('should return active session if userId is provided', async () => {
    const result = await authController.getSession('user123');
    expect(result).toEqual({ message: 'Active session found.', userId: 'user123' });
  });

  it('should return no active session if no userId is provided', async () => {
    const result = await authController.getSession('');
    expect(result).toEqual({ message: 'No active session.' });
  });
});
