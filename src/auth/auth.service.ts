import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  /**
   * Validate a user by email
   */
  async validateUser(email: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      return user;
    }
    return null;
  }

  /**
   * Generate a JWT token for a user
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
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

    // Generate JWT token
    return this.login(user);
  }
}
