import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'oxyz-server',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check endpoint' })
  detailedHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'oxyz-server',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.0.1',
    };
  }
}
