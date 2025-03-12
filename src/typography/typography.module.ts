import { Module } from '@nestjs/common';

import { DrizzleModule } from '../drizzle/drizzle.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TypographyService } from './typography.service';
import { TypographyController } from './typography.controller';

@Module({
  imports: [DrizzleModule, CloudinaryModule],
  controllers: [TypographyController],
  providers: [TypographyService],
  exports: [TypographyService],
})
export class TypographyModule {}
