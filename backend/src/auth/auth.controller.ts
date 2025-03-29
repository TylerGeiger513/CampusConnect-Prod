import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';
import { CurrentUser } from './current-user.decorator';
import { ExistsDto } from './dtos/exists.dto';


@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) { }

  private readonly logger = new Logger(AuthController.name);
  @Post('signup')
  async signup(@Body() dto: SignupDto, @Req() req: Request): Promise<any> {
    const user = await this.authService.signup(dto, req);
    return { message: 'Login successful', user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<any> {
    const user = await this.authService.login(dto, req);
    return { message: 'Login successful', user };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request): Promise<any> {
    const sessionId = req.session ? req.session.id : '';
    return this.authService.logout(sessionId);
  }

  @Get('session')
  async getSession(@CurrentUser() userId: string): Promise<any> {
    if (!userId) {
      return { message: 'No active session.' };
    }
    return { message: 'Active session found.', userId };
  }

  /**
   * 
   * @param dto 
   * @returns
   */
  @Post('exists')
  async checkUserExists(@Body() dto: ExistsDto): Promise<any> {
    const user = await this.authService.checkUserExists(dto);
    return { exists: !!user };
  }
  
  // Protected: Get current user profile
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() userId: string): Promise<any> {
    if (!userId) {
      return { message: 'No active session.' };
    } 
    return this.authService.getProfile(userId);
  }

}
