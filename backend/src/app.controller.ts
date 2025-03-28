import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    // Daha kapsamlı bir sağlık kontrolü
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      serverIP: process.env.SERVER_IP || 'localhost',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '0.0.1'
    };
  }
}
