import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });

    // Debug logging
    console.log(
      'JWT Strategy initialized with secret:',
      configService.get<string>('JWT_SECRET')
        ? '[SECRET HIDDEN]'
        : 'your-secret-key',
    );
  }

  async validate(payload: any) {
    // Debug logging
    console.log('JWT Strategy - Validating payload:', payload);

    try {
      // Find the user by ID from the JWT payload
      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        console.log('JWT Strategy - User not found for email:', payload.email);
        throw new UnauthorizedException('User not found');
      }

      console.log('JWT Strategy - User found:', user.id);

      // Return the user object, which will be added to the request
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      console.error('JWT Strategy - Error validating token:', error);
      throw error;
    }
  }
}
