import { Module } from '@nestjs/common';
import { PresetsService } from './presets.service';
import { PresetsController } from './presets.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CloudinaryModule, DrizzleModule, AuthModule],
  controllers: [PresetsController],
  providers: [PresetsService],
  exports: [PresetsService],
})
export class PresetsModule {}
