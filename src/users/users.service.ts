import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { eq, and } from 'drizzle-orm';
import { users, accounts } from '../drizzle/schema';

@Injectable()
export class UsersService {
  constructor(private drizzle: DrizzleService) {}

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
}
