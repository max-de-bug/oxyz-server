import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard, Public } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Req() req: Request) {
    if (req.user) {
      const userId = req.user['id'] || 'unknown';
      this.logger.log(`Getting profile for user: ${userId}`);
      return req.user;
    }
    this.logger.warn('Profile requested but no user found in request');
    return null;
  }

  @Public()
  @Get('public')
  getPublicData() {
    this.logger.log('Accessing public user data endpoint');
    return { message: 'This is public data' };
  }

  @Public()
  @Get('defaults/image')
  async getDefaultUserImage() {
    this.logger.log('Attempting to get default user image');
    try {
      const result = await this.usersService.getDefaultUserImage();
      this.logger.log(`Successfully fetched default image: ${result.publicId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get default user image: ${error.message}`,
        error.stack,
      );
      throw error; // Let NestJS handle the exception
    }
  }
}
