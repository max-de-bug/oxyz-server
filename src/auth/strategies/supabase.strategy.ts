import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private readonly logger = new Logger(SupabaseStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private drizzle: DrizzleService,
  ) {
    super();
  }

  async validate(request: any) {
    try {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        this.logger.warn('No token provided in request');
        throw new UnauthorizedException('No token provided');
      }

      // Decode the JWT to get the user information
      const payload = this.decodeToken(token);

      if (!payload || !payload.sub) {
        this.logger.warn('Invalid token payload');
        throw new UnauthorizedException('Invalid token payload');
      }

      // Log the payload for debugging
      this.logger.debug('Token payload:', payload);

      // Find or create user
      const user = await this.findOrCreateUser(payload);

      return user;
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      throw new UnauthorizedException('Invalid authentication credentials');
    }
  }

  private decodeToken(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      this.logger.error('Token decoding failed:', error);
      throw new Error('Invalid token format');
    }
  }

  private async findOrCreateUser(payload: any) {
    try {
      // Try to find existing user
      let [user] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub));

      if (!user) {
        // Create new user if not found
        const email = payload.email as string;
        [user] = await this.drizzle.db
          .insert(users)
          .values({
            id: payload.sub,
            email: email,
            name: email ? email.split('@')[0] : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        this.logger.log(`Created new user: ${user.id}`);
      }

      return user;
    } catch (error) {
      this.logger.error('Error finding/creating user:', error);
      throw new Error('Failed to process user');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
