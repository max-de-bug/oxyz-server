import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DrizzleService } from '../drizzle/drizzle.service';
import { eq } from 'drizzle-orm';
import { users, accounts } from '../drizzle/schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private drizzle: DrizzleService,
  ) {}

  /**
   * Validate a user by email
   */
  async validateUser(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      return user;
    }
    return null;
  }

  /**
   * Handle user login
   */
  async login(user: any) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    };
  }

  /**
   * Handle Discord OAuth callback
   */
  async handleDiscordCallback(discordUser: any) {
    // Create or update user from Discord data
    const user = await this.usersService.upsertFromDiscord(discordUser);
    return this.login(user);
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    try {
      const [user] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    } catch (error) {
      this.logger.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Validate a Discord access token and return the user
   */
  async validateDiscordToken(token: string) {
    try {
      // Find account with this access token
      const [account] = await this.drizzle.db
        .select()
        .from(accounts)
        .where(eq(accounts.access_token, token));

      if (!account) {
        this.logger.debug('No account found with this access token');
        return null;
      }

      // Check if token is expired (if expiresAt exists)
      const now = Math.floor(Date.now() / 1000);
      if (account.expires_at && now >= account.expires_at) {
        this.logger.debug('Discord token expired');
        return null;
      }

      // Find the user
      const [user] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, account.userId));

      if (!user) {
        this.logger.debug('No user found for account');
        return null;
      }

      this.logger.debug(
        'Successfully validated Discord token for user:',
        user.id,
      );
      return user;
    } catch (error) {
      this.logger.error('Error validating Discord token:', error);
      return null;
    }
  }

  /**
   * Handle user session validation
   */
  async validateSession(userId: string) {
    try {
      const [user] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    } catch (error) {
      this.logger.error('Error validating session:', error);
      return null;
    }
  }

  // Add any additional auth-related methods here
}
