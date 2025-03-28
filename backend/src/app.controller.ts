import { Controller, Get, Post, Put, Delete, Param, Body, Logger, All, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('Anasayfa isteği alındı');
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

  // Varsayılan modül verileri
  private readonly allModules = [
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

  private readonly activeModules = [
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

  // API endpoint için log ve response helper fonksiyonu
  private logAndRespond(req: Request, endpoint: string, data: any) {
    this.logger.log(`${req.method} ${endpoint} isteği alındı [URL: ${req.url}]`);
    return data;
  }

  // Tüm modüller
  @Get('modules')
  getAllModulesRoot(@Req() req: Request) {
    return this.logAndRespond(req, '/modules', this.allModules);
  }

  @Get('api/modules')
  getAllModules(@Req() req: Request) {
    return this.logAndRespond(req, '/api/modules', this.allModules);
  }

  // Aktif modüller
  @Get('modules/active')
  getActiveModulesRoot(@Req() req: Request) {
    return this.logAndRespond(req, '/modules/active', this.activeModules);
  }

  @Get('api/modules/active')
  getActiveModules(@Req() req: Request) {
    return this.logAndRespond(req, '/api/modules/active', this.activeModules);
  }

  // Fallback endpoint
  @All(['modules/fallback', 'api/modules/fallback'])
  moduleFallback(@Req() req: Request) {
    return this.logAndRespond(req, '/api/modules/fallback', this.allModules);
  }

  // Modül yönetimi endpointleri
  @Post(['modules/:id/enable', 'api/modules/:id/enable'])
  enableModule(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`POST /api/modules/${id}/enable isteği alındı [URL: ${req.url}]`);
    return {
      success: true,
      message: `"${id}" modülü etkinleştirilmek üzere işaretlendi. .env dosyasını güncelleyin.`
    };
  }

  @Post(['modules/:id/disable', 'api/modules/:id/disable'])
  disableModule(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`POST /api/modules/${id}/disable isteği alındı [URL: ${req.url}]`);
    return {
      success: true,
      message: `"${id}" modülü devre dışı bırakılmak üzere işaretlendi. .env dosyasını güncelleyin.`
    };
  }

  // Catch-all endpoint - debug için
  @All('*')
  catchAll(@Req() req: Request, @Res() res: Response) {
    const url = req.url;
    this.logger.warn(`Bilinmeyen istek: ${req.method} ${url}`);
    
    // Eğer modules ile ilgili bir istek ise ve bilinmeyen bir endpoint ise
    if (url.includes('modules')) {
      if (url.includes('active')) {
        return res.json(this.activeModules);
      }
      return res.json(this.allModules);
    }
    
    // Diğer bilinmeyen istekler için basit yanıt
    return res.status(404).json({
      status: 404,
      message: `Route not found: ${req.method} ${url}`,
      timestamp: new Date().toISOString()
    });
  }
}
