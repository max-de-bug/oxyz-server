import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [DrizzleModule, CloudinaryModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
