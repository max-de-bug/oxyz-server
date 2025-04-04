import { Module } from '@nestjs/common';
import { LogosController } from './logos.controller';
import { LogosService } from './logos.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DrizzleModule, CloudinaryModule, AuthModule],
  controllers: [LogosController],
  providers: [LogosService],
  exports: [LogosService],
})
export class LogosModule {}
