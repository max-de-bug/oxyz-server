import { Module } from '@nestjs/common';
import { PresetsService } from './presets.service';
import { PresetsController } from './presets.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [PresetsController],
  providers: [PresetsService],
})
export class PresetsModule {}
