import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { ModuleManager } from './module-manager';
import { ModulesService } from './modules.service';
import { CreateModuleDto, UpdateModuleDto, ToggleModuleDto } from './dto/module.dto';

@Controller('api/modules')
export class ModulesController {
  private readonly logger = new Logger(ModulesController.name);

  constructor(
    private readonly moduleManager: ModuleManager,
    private readonly modulesService: ModulesService
  ) {
    this.logger.log('ModulesController initialized');
  }

  @Get()
  async getAllModules() {
    this.logger.log('GET /api/modules isteği alındı');
    try {
      // Veritabanından modülleri al
      const dbModules = await this.modulesService.findAll();
      this.logger.log(`DB modülleri: ${dbModules.length}`);
      
      // Dosya tabanlı modül bilgilerini de al
      const fileModules = this.moduleManager.getAllModules();
      this.logger.log(`Dosya modülleri: ${fileModules.length}`);
      
      // Veritabanı modüllerini döndür, dosya modüllerini ekle (eğer DB'de yoksa)
      const result = [
        ...dbModules,
        ...fileModules.filter(fm => !dbModules.some(dm => dm.code === fm.name))
          .map(fm => ({
            code: fm.name,
            name: fm.name,
            description: fm.description,
            version: fm.version,
            isActive: fm.isEnabled,
            dependencies: fm.dependencies
          }))
      ];
      
      this.logger.log(`Toplam ${result.length} modül döndürülüyor`);
      return result;
    } catch (error) {
      this.logger.error('Modüller alınırken hata:', error);
      // Hata durumunda varsayılan modülleri döndür
      return [
        {
          code: 'core',
          name: 'Çekirdek Sistem',
          description: 'Temel sistem fonksiyonları',
          version: '1.0.0',
          isActive: true,
          isCore: true
        }
      ];
    }
  }

  @Get('active')
  async getActiveModules() {
    this.logger.log('GET /api/modules/active isteği alındı');
    try {
      // Aktif veritabanı modüllerini al
      const dbModules = await this.modulesService.findActive();
      this.logger.log(`Aktif DB modülleri: ${dbModules.length}`);
      
      // Aktif dosya modüllerini al
      const fileModules = this.moduleManager.getEnabledModules();
      this.logger.log(`Aktif dosya modülleri: ${fileModules.length}`);
      
      // Aktif modülleri döndür
      const result = [
        ...dbModules,
        ...fileModules.filter(fm => !dbModules.some(dm => dm.code === fm.name))
          .map(fm => ({
            code: fm.name,
            name: fm.name,
            description: fm.description,
            version: fm.version,
            isActive: true,
            dependencies: fm.dependencies
          }))
      ];
      
      this.logger.log(`Toplam ${result.length} aktif modül döndürülüyor`);
      return result;
    } catch (error) {
      this.logger.error('Aktif modüller alınırken hata:', error);
      // Hata durumunda temel modülleri döndür
      return [
        {
          code: 'core',
          name: 'Çekirdek Sistem',
          description: 'Temel sistem fonksiyonları',
          version: '1.0.0',
          isActive: true,
          isCore: true
        }
      ];
    }
  }

  @Post(':id/enable')
  async enableModule(@Param('id') id: string) {
    try {
      // Dosya modülü mü yoksa DB modülü mü kontrol et
      const isUuid = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      
      if (isUuid) {
        // UUID formatındaysa, DB modülü
        await this.modulesService.toggle(id, { isActive: true });
        return {
          success: true,
          message: `Modül etkinleştirildi.`
        };
      } else {
        // Değilse, dosya modülü veya kod ile arama
        try {
          const module = await this.modulesService.findByCode(id);
          await this.modulesService.toggle(module.id, { isActive: true });
          return {
            success: true,
            message: `"${module.name}" modülü etkinleştirildi.`
          };
        } catch (error) {
          // Dosya tabanlı modül - .env değişikliği gerekli
          return {
            success: true,
            message: `"${id}" modülü etkinleştirilmek üzere işaretlendi. .env dosyasını güncelleyin.`
          };
        }
      }
    } catch (error) {
      this.logger.error('Modül etkinleştirme hatası:', error);
      if (error instanceof ConflictException) {
        return {
          success: false,
          message: error.message
        };
      }
      return {
        success: false,
        message: `Modül etkinleştirilemedi: ${error.message}`
      };
    }
  }

  @Post(':id/disable')
  async disableModule(@Param('id') id: string) {
    try {
      // Dosya modülü mü yoksa DB modülü mü kontrol et
      const isUuid = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      
      if (isUuid) {
        // UUID formatındaysa, DB modülü
        const module = await this.modulesService.findOne(id);
        if (module.isCore) {
          return {
            success: false,
            message: `"${module.name}" çekirdek bir modüldür ve devre dışı bırakılamaz.`
          };
        }
        await this.modulesService.toggle(id, { isActive: false });
        return {
          success: true,
          message: `Modül devre dışı bırakıldı.`
        };
      } else {
        // Değilse, dosya modülü veya kod ile arama
        try {
          const module = await this.modulesService.findByCode(id);
          if (module.isCore) {
            return {
              success: false,
              message: `"${module.name}" çekirdek bir modüldür ve devre dışı bırakılamaz.`
            };
          }
          await this.modulesService.toggle(module.id, { isActive: false });
          return {
            success: true,
            message: `"${module.name}" modülü devre dışı bırakıldı.`
          };
        } catch (error) {
          // Dosya tabanlı modül - .env değişikliği gerekli
          return {
            success: true,
            message: `"${id}" modülü devre dışı bırakılmak üzere işaretlendi. .env dosyasını güncelleyin.`
          };
        }
      }
    } catch (error) {
      this.logger.error('Modül devre dışı bırakma hatası:', error);
      return {
        success: false,
        message: `Modül devre dışı bırakılamadı: ${error.message}`
      };
    }
  }
  
  @Get(':id')
  async getModule(@Param('id') id: string) {
    try {
      return await this.modulesService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Eğer UUID formatında değilse, koda göre arama yap
      try {
        return await this.modulesService.findByCode(id);
      } catch (innerError) {
        throw new NotFoundException(`Modül bulunamadı: ${id}`);
      }
    }
  }
  
  @Post()
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }
  
  @Put(':id')
  async updateModule(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.modulesService.update(id, updateModuleDto);
  }
  
  @Delete(':id')
  async deleteModule(@Param('id') id: string) {
    await this.modulesService.remove(id);
    return { success: true, message: 'Modül başarıyla silindi' };
  }
}
