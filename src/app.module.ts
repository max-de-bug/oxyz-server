import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImagesModule } from './images/images.module';
import { LogosModule } from './logos/logos.module';
import { DesignsModule } from './designs/designs.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthModule } from './auth/auth.module';
import { PresetsModule } from './presets/presets.module';
import { TypographyModule } from './typography/typography.module';
import { UsersModule } from './users/users.module';
import { FiltersModule } from './filters/filters.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    CloudinaryModule,
    AuthModule,
    ImagesModule,
    LogosModule,
    DesignsModule,
    PresetsModule,
    TypographyModule,
    UsersModule,
    FiltersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
