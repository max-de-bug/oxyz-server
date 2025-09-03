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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/user.interface';
import { SupabaseAuthGuard, Public } from '../auth/guards/auth.guard';
import { Request } from 'express';
import { UpdateUsernameDto } from './dto/update-username.dto';

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
    @Body() body: UpdateUsernameDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(
      `Updating username for user: ${user.id} to ${body.username}`,
    );
    return this.usersService.updateUsername(user.id, body.username);
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
