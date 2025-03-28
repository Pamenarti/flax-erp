import { Controller, Get, Post, Param, Logger } from '@nestjs/common';

@Controller('api/temp-modules')
export class TempModulesController {
  private readonly logger = new Logger(TempModulesController.name);

  constructor() {
    this.logger.log('TempModulesController initialized');
  }

  @Get()
  getAllModules() {
    this.logger.log('GET /api/temp-modules isteği alındı');
    return [
      {
        code: 'core',
        name: 'Çekirdek Sistem',
        description: 'Temel sistem bileşenleri ve gösterge paneli',
        isActive: true,
        isCore: true,
        version: '1.0.0',
        dependencies: []
      },
      {
        code: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcı hesapları ve yetkilendirme',
        isActive: true,
        isCore: true,
        version: '1.0.0',
        dependencies: ['core']
      },
      {
        code: 'inventory',
        name: 'Stok Yönetimi',
        description: 'Envanter takibi ve stok hareketleri',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        dependencies: ['core']
      }
    ];
  }

  @Get('active')
  getActiveModules() {
    this.logger.log('GET /api/temp-modules/active isteği alındı');
    return [
      {
        code: 'core',
        name: 'Çekirdek Sistem',
        description: 'Temel sistem bileşenleri ve gösterge paneli',
        isActive: true,
        isCore: true,
        version: '1.0.0',
        dependencies: []
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

  @Post(':id/enable')
  enableModule(@Param('id') id: string) {
    this.logger.log(`POST /api/temp-modules/${id}/enable isteği alındı`);
    return {
      success: true,
      message: `"${id}" modülü etkinleştirilmek üzere işaretlendi. .env dosyasını güncelleyin.`
    };
  }

  @Post(':id/disable')
  disableModule(@Param('id') id: string) {
    this.logger.log(`POST /api/temp-modules/${id}/disable isteği alındı`);
    return {
      success: true,
      message: `"${id}" modülü devre dışı bırakılmak üzere işaretlendi. .env dosyasını güncelleyin.`
    };
  }
}
