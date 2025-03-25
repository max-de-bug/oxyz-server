import { Module } from '@nestjs/common';

import { DrizzleModule } from '../drizzle/drizzle.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TypographyService } from './typography.service';
import { TypographyController } from './typography.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DrizzleModule, CloudinaryModule, AuthModule],
  controllers: [TypographyController],
  providers: [TypographyService],
  exports: [TypographyService],
})
export class TypographyModule {}
