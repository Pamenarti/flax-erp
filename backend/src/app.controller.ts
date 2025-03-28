import { Controller, Get, Logger, All } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/health')
  healthCheck() {
    this.logger.log('Health check isteği alındı');
    return {
      status: 'ok',
      timestamp: new Date(),
      services: {
        api: 'up',
        database: 'up'
      }
    };
  }

  @All('api/modules/fallback')
  moduleFallback() {
    this.logger.log('Modül fallback isteği alındı');
    return [
      {
        code: 'core',
        name: 'Çekirdek Sistem',
        description: 'Temel sistem fonksiyonları',
        version: '1.0.0',
        isActive: true,
        isCore: true
      },
      {
        code: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcı hesapları ve yetkilendirme',
        isActive: true,
        isCore: true,
        version: '1.0.0',
        dependencies: ['core']
      }
    ];
  }
}
