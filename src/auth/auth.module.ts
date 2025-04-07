import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { SupabaseAuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'supabase' }),
    UsersModule,
    DrizzleModule,
  ],
  controllers: [],
  providers: [
    SupabaseStrategy,
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
  exports: [],
})
export class AuthModule {}
