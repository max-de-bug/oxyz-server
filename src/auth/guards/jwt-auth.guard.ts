import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Debug logging
    const request = context.switchToHttp().getRequest();
    console.log('JWT Guard - Headers:', request.headers);
    console.log(
      'JWT Guard - Authorization header:',
      request.headers.authorization,
    );

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Debug logging
    console.log('JWT Guard - Error:', err);
    console.log('JWT Guard - User:', user);
    console.log('JWT Guard - Info:', info);

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
