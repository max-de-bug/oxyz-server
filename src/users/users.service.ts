import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { eq, and, not } from 'drizzle-orm';
import { users, accounts } from '../drizzle/schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { HttpException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private drizzle: DrizzleService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Get a user's profile by ID
   */
  async getProfile(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      // Fetch the user from the database
      const [user] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Format and return user profile data
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      this.logger.error(
        `Error getting profile for user ${userId}: ${error.message}`,
        error.stack,
      );

      // Rethrow specific exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise throw a general exception
      throw new InternalServerErrorException('Failed to get user profile');
    }
  }

  /**
   * Find a user by their Discord provider account
   */
  async findByDiscordId(discordId: string) {
    // First find the account with the Discord provider
    const [account] = await this.drizzle.db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, 'discord'),
          eq(accounts.providerAccountId, discordId),
        ),
      );

    if (!account) {
      return null;
    }

    // Then find the user associated with that account
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, account.userId));

    return user;
  }

  /**
   * Find a user by their email
   */
  async findByEmail(email: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  /**
   * Create or update a user from Discord OAuth data
   */
  async upsertFromDiscord(discordData: any) {
    const { id: discordId, email, username, avatar } = discordData;

    // Check if user already exists via Discord account
    let user = await this.findByDiscordId(discordId);

    // If not found by Discord ID, try email
    if (!user && email) {
      user = await this.findByEmail(email);
    }

    if (user) {
      // Update existing user
      const [updatedUser] = await this.drizzle.db
        .update(users)
        .set({
          name: username,
          image: avatar,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      // Ensure Discord account is linked
      await this.linkDiscordAccount(updatedUser.id, discordData);

      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await this.drizzle.db
        .insert(users)
        .values({
          email,
          name: username,
          image: avatar,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Link Discord account
      await this.linkDiscordAccount(newUser.id, discordData);

      return newUser;
    }
  }

  /**
   * Link a Discord account to a user
   */
  private async linkDiscordAccount(userId: string, discordData: any) {
    const {
      id: providerAccountId,
      access_token,
      refresh_token,
      expires_at,
      token_type,
    } = discordData;

    // Check if account already exists
    const [existingAccount] = await this.drizzle.db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, 'discord'),
          eq(accounts.providerAccountId, providerAccountId),
        ),
      );

    if (existingAccount) {
      // Update existing account
      await this.drizzle.db
        .update(accounts)
        .set({
          access_token,
          refresh_token,
          expires_at,
          token_type,
        })
        .where(
          and(
            eq(accounts.provider, 'discord'),
            eq(accounts.providerAccountId, providerAccountId),
          ),
        );
    } else {
      // Create new account
      await this.drizzle.db.insert(accounts).values({
        userId,
        type: 'oauth' as any, // Cast to any to avoid type error
        provider: 'discord',
        providerAccountId,
        access_token,
        refresh_token,
        expires_at,
        token_type,
      });
    }
  }

  async getDefaultUserImage() {
    this.logger.log('Attempting to fetch default user image');

    try {
      // First try to get from users/defaults folder
      this.logger.debug('Attempting to fetch from users/defaults folder');
      try {
        const result =
          await this.cloudinaryService.getResourcesByBaseFolder('users');
        this.logger.debug(
          `Result from users/defaults: ${JSON.stringify(result)}`,
        );

        if (result.resources && result.resources.length > 0) {
          const defaultImage = result.resources[0];
          this.logger.log(
            `Found default image in users/defaults: ${defaultImage.public_id}`,
          );
          return {
            url: defaultImage.secure_url,
            publicId: defaultImage.public_id,
            width: defaultImage.width,
            height: defaultImage.height,
          };
        } else {
          this.logger.warn('No resources found in users/defaults folder');
        }
      } catch (firstError) {
        this.logger.warn(
          `Error fetching from users/defaults: ${firstError.message}`,
          firstError.stack,
        );
      }

      // If no images found in users/defaults, try images/defaults folder
      this.logger.debug('Attempting to fetch from images/defaults folder');
      const result =
        await this.cloudinaryService.getResourcesByFolder('images/defaults');
      this.logger.debug(
        `Result from images/defaults: ${JSON.stringify(result)}`,
      );

      if (!result.resources || result.resources.length === 0) {
        this.logger.error('No default user image found in any defaults folder');
        throw new NotFoundException(
          'No default user image found in any defaults folder',
        );
      }

      // Get the first image from the defaults folder
      const defaultImage = result.resources[0];
      this.logger.log(
        `Found default image in images/defaults: ${defaultImage.public_id}`,
      );

      return {
        url: defaultImage.secure_url,
        publicId: defaultImage.public_id,
        width: defaultImage.width,
        height: defaultImage.height,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching default user image: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException('Default user image not found');
    }
  }

  async updateUsername(userId: string, username: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!username || typeof username !== 'string') {
      throw new BadRequestException('Valid username is required');
    }

    // Normalize and validate the username
    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }

    if (normalizedUsername.length > 30) {
      throw new BadRequestException('Username cannot exceed 30 characters');
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(normalizedUsername)) {
      throw new BadRequestException(
        'Username can only contain letters, numbers, periods, underscores, and hyphens',
      );
    }

    try {
      // Check if the username is already taken
      const existingUser = await this.drizzle.db
        .select()
        .from(users)
        .where(
          and(eq(users.name, normalizedUsername), not(eq(users.id, userId))),
        )
        .limit(1);

      if (existingUser.length > 0) {
        throw new ConflictException('Username is already taken');
      }

      // Update the username
      const [updatedUser] = await this.drizzle.db
        .update(users)
        .set({
          name: normalizedUsername,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      this.logger.log(
        `Username updated for user ${userId} to ${normalizedUsername}`,
      );

      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Error updating username for user ${userId}: ${error.message}`,
        error.stack,
      );

      // Rethrow specific exceptions (BadRequestException, ConflictException, etc.)
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise throw a general exception
      throw new InternalServerErrorException('Failed to update username');
    }
  }
}
