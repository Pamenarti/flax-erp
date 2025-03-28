import { Controller, Get, Logger, All, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('Anasayfa istendi');
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

  @Get('api/modules')
  getAllModules() {
    this.logger.log('GET /api/modules isteği controller dışından alındı');
    return [
      {
        code: 'core',
        name: 'Çekirdek Sistem',
        description: 'Temel sistem bileşenleri ve gösterge paneli',
        version: '1.0.0',
        isActive: true,
        isCore: true,
        dependencies: []
      },
      {
        code: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcı hesapları ve yetkilendirme',
        version: '1.0.0',
        isActive: true,
        isCore: true,
        dependencies: ['core']
      },
      {
        code: 'inventory',
        name: 'Stok Yönetimi',
        description: 'Envanter takibi ve stok hareketleri',
        version: '1.0.0',
        isActive: false,
        isCore: false,
        dependencies: ['core']
      }
    ];
  }

  @Get('api/modules/active')
  getActiveModules() {
    this.logger.log('GET /api/modules/active isteği controller dışından alındı');
    return [
      {
        code: 'core',
        name: 'Çekirdek Sistem',
        description: 'Temel sistem bileşenleri ve gösterge paneli',
        version: '1.0.0',
        isActive: true,
        isCore: true,
        dependencies: []
      },
      {
        code: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcı hesapları ve yetkilendirme',
        version: '1.0.0',
        isActive: true,
        isCore: true,
        dependencies: ['core']
      }
    ];
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

  @Post('api/modules/:id/enable')
  enableModule(@Param('id') id: string) {
    this.logger.log(`POST /api/modules/${id}/enable isteği controller dışından alındı`);
    return {
      success: true,
      message: `"${id}" modülü etkinleştirilmek üzere işaretlendi. .env dosyasını güncelleyin.`
    };
  }

  @Post('api/modules/:id/disable')
  disableModule(@Param('id') id: string) {
    this.logger.log(`POST /api/modules/${id}/disable isteği controller dışından alındı`);
    return {
      success: true,
      message: `"${id}" modülü devre dışı bırakılmak üzere işaretlendi. .env dosyasını güncelleyin.`
    };
  }
}
