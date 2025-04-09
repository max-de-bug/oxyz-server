import { Controller, Get, Options } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/guards/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('test-cors')
  testCors() {
    return { message: 'CORS test successful' };
  }

  @Public()
  @Options('test-cors')
  testCorsOptions() {
    return { message: 'CORS preflight successful' };
  }
}
