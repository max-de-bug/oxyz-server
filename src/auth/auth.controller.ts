import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string }) {
    console.log('Auth Controller - Login request:', loginDto);

    const user = await this.authService.validateUser(loginDto.email);
    if (!user) {
      console.log(
        'Auth Controller - User not found for email:',
        loginDto.email,
      );
      return { success: false, message: 'User not found' };
    }

    const result = await this.authService.login(user);
    console.log(
      'Auth Controller - Login successful, token generated for user:',
      user.id,
    );
    return result;
  }

  @Post('discord')
  async discordCallback(@Body() discordUser: any) {
    console.log('Auth Controller - Discord callback:', discordUser);
    return this.authService.handleDiscordCallback(discordUser);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    console.log('Auth Controller - Profile request for user:', req.user);
    return req.user;
  }
}
