import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard, Public } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Public()
  @Get('public')
  getPublicData() {
    return { message: 'This is public data' };
  }
}
