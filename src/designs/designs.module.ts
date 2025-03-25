import { Module } from '@nestjs/common';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { ImagesModule } from '../images/images.module';
import { LogosModule } from '../logos/logos.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    DrizzleModule,
    ImagesModule,
    LogosModule,
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [DesignsController],
  providers: [DesignsService],
  exports: [DesignsService],
})
export class DesignsModule {}
