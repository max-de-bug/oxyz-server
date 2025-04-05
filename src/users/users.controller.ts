import {
  Controller,
  Get,
  UseGuards,
  Req,
  Logger,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard, Public } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {
    if (req.user && req.user['id']) {
      const userId = req.user['id'];
      this.logger.log(`Getting profile for user: ${userId}`);

      try {
        const userProfile = await this.usersService.getProfile(userId);
        return userProfile;
      } catch (error) {
        this.logger.error(
          `Error retrieving profile for user ${userId}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }

    this.logger.warn('Profile requested but no user found in request');
    return null;
  }

  @Patch('username')
  async updateUsername(
    @Req() req: Request,
    @Body() body: { username: string },
  ) {
    const userId = req.user ? req.user['id'] || 'unknown' : 'unknown';
    this.logger.log(
      `Updating username for user: ${userId} to ${body.username}`,
    );
    return this.usersService.updateUsername(userId, body.username);
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
