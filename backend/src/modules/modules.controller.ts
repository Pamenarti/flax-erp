import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, NotFoundException, ConflictException, Logger } from '@nestjs/common';common';
import { ModuleManager } from './module-manager';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateModuleDto, UpdateModuleDto, ToggleModuleDto } from './dto/module.dto';

// Guard'ları kaldırın - geliştirme sırasında sorunları gidermek için
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/modules')Logger(ModulesController.name);
export class ModulesController {
  constructor(
    private readonly moduleManager: ModuleManager,
    private readonly modulesService: ModulesServiceivate readonly modulesService: ModulesService
  ) {}  ) {
.logger.log('ModulesController initialized');
  // @Roles('admin') - bu decorator'ü de kaldırın veya yorumunu alın
  @Get()
  async getAllModules() {
    try {uard)
      // Veritabanından modülleri al
      const dbModules = await this.modulesService.findAll();
      // Dosya tabanlı modül bilgilerini de al
      const fileModules = this.moduleManager.getAllModules();y {
      
      // Veritabanı modüllerini döndür, dosya modüllerini ekle (eğer DB'de yoksa)Modules = await this.modulesService.findAll();
      return [(`DB modülleri: ${dbModules.length}`);
        ...dbModules,
        ...fileModules.filter(fm => !dbModules.some(dm => dm.code === fm.name))modül bilgilerini de al
          .map(fm => ({this.moduleManager.getAllModules();
            code: fm.name,ya modülleri: ${fileModules.length}`);
            name: fm.name,
            description: fm.description,döndür, dosya modüllerini ekle (eğer DB'de yoksa)
            version: fm.version,
            isActive: fm.isEnabled,
            dependencies: fm.dependenciesleModules.filter(fm => !dbModules.some(dm => dm.code === fm.name))
          }))  .map(fm => ({
      ];name,
    } catch (error) {
      console.error('Modüller alınırken hata:', error);,
      // Hata durumunda boş dizi döndürion: fm.version,
      return [];       isActive: fm.isEnabled,
    }         dependencies: fm.dependencies
  }          }))

  @Get('active')
  async getActiveModules() {s.logger.log(`Toplam ${result.length} modül döndürülüyor`);
    try {
      // Aktif veritabanı modüllerini al
      const dbModules = await this.modulesService.findActive();lınırken hata:', error);
      // Aktif dosya modüllerini al
      const fileModules = this.moduleManager.getEnabledModules();return [
      
      // Aktif modülleri döndür: 'core',
      return [rdek Sistem',
        ...dbModules,
        ...fileModules.filter(fm => !dbModules.some(dm => dm.code === fm.name)).0',
          .map(fm => ({
            code: fm.name,
            name: fm.name,
            description: fm.description,
            version: fm.version,
            isActive: true,
            dependencies: fm.dependencies
          }))active')
      ];les() {
    } catch (error) {
      console.error('Aktif modüller alınırken hata:', error);
      // Hata durumunda temel modülleri döndür veritabanı modüllerini al
      return [st dbModules = await this.modulesService.findActive();
        {Aktif DB modülleri: ${dbModules.length}`);
          code: 'core',
          name: 'Çekirdek Sistem',
          description: 'Temel sistem fonksiyonları',his.moduleManager.getEnabledModules();
          version: '1.0.0',tif dosya modülleri: ${fileModules.length}`);
          isActive: true,
          isCore: trueAktif modülleri döndür
        }nst result = [
      ];   ...dbModules,
    }     ...fileModules.filter(fm => !dbModules.some(dm => dm.code === fm.name))
  }          .map(fm => ({
name,
  @Post(':id/enable') fm.name,
  async enableModule(@Param('id') id: string) {
    try {   version: fm.version,
      // Dosya modülü mü yoksa DB modülü mü kontrol et
      const isUuid = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
          }))
      if (isUuid) {
        // UUID formatındaysa, DB modülü
        await this.modulesService.toggle(id, { isActive: true });ülüyor`);
        return {ult;
          success: true,
          message: `Modül etkinleştirildi.`nırken hata:', error);
        };ata durumunda temel modülleri döndür
      } else {
        // Değilse, dosya modülü veya kod ile arama
        try {e: 'core',
          const module = await this.modulesService.findByCode(id);
          await this.modulesService.toggle(module.id, { isActive: true });
          return { '1.0.0',
            success: true,
            message: `"${module.name}" modülü etkinleştirildi.`
          };
        } catch (error) {
          // Dosya tabanlı modül - .env değişikliği gerekli
          return {
            success: true,
            message: `"${id}" modülü etkinleştirilmek üzere işaretlendi. .env dosyasını güncelleyin.`
          };min')
        }nableModule(@Param('id') id: string) {
      } {
    } catch (error) { mü yoksa DB modülü mü kontrol et
      console.error('Modül etkinleştirme hatası:', error);-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      if (error instanceof ConflictException) {
        return {) {
          success: false,aysa, DB modülü
          message: error.messagee.toggle(id, { isActive: true });
        };turn {
      }   success: true,
      return {age: `Modül etkinleştirildi.`
        success: false,
        message: `Modül etkinleştirilemedi: ${error.message}`
      };// Değilse, dosya modülü veya kod ile arama
    }   try {
  }       const module = await this.modulesService.findByCode(id);
          await this.modulesService.toggle(module.id, { isActive: true });
  @Post(':id/disable')
  async disableModule(@Param('id') id: string) {ss: true,
    try {kinleştirildi.`
      // Dosya modülü mü yoksa DB modülü mü kontrol et };
      const isUuid = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      
      if (isUuid) {    return {
        // UUID formatındaysa, DB modülü: true,
        const module = await this.modulesService.findOne(id);inleştirilmek üzere işaretlendi. .env dosyasını güncelleyin.`
        if (module.isCore) {
          return {
            success: false,
            message: `"${module.name}" çekirdek bir modüldür ve devre dışı bırakılamaz.`
          };
        }ror instanceof ConflictException) {
        await this.modulesService.toggle(id, { isActive: false });eturn {
        return {
          success: true,e: error.message
          message: `Modül devre dışı bırakıldı.`
        };
      } else {rn {
        // Değilse, dosya modülü veya kod ile aramas: false,
        try {.message}`
          const module = await this.modulesService.findByCode(id);
          if (module.isCore) {
            return {
              success: false,
              message: `"${module.name}" çekirdek bir modüldür ve devre dışı bırakılamaz.`
            };
          }eModule(@Param('id') id: string) {
          await this.modulesService.toggle(module.id, { isActive: false });
          return {
            success: true, = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
            message: `"${module.name}" modülü devre dışı bırakıldı.`
          };
        } catch (error) {UID formatındaysa, DB modülü
          // Dosya tabanlı modül - .env değişikliği gerekliait this.modulesService.findOne(id);
          return {
            success: true,
            message: `"${id}" modülü devre dışı bırakılmak üzere işaretlendi. .env dosyasını güncelleyin.`,
          };
        }
      }
    } catch (error) { await this.modulesService.toggle(id, { isActive: false });
      console.error('Modül devre dışı bırakma hatası:', error);
      return {
        success: false,age: `Modül devre dışı bırakıldı.`
        message: `Modül devre dışı bırakılamadı: ${error.message}`
      };
    }// Değilse, dosya modülü veya kod ile arama
  }   try {
         const module = await this.modulesService.findByCode(id);
  @Get(':id')        if (module.isCore) {
  async getModule(@Param('id') id: string) {eturn {
    try {cess: false,
      return await this.modulesService.findOne(id);irdek bir modüldür ve devre dışı bırakılamaz.`
    } catch (error) {   };
      if (error instanceof NotFoundException) {
        throw error;modulesService.toggle(module.id, { isActive: false });
      }
      // Eğer UUID formatında değilse, koda göre arama yap true,
      try {     message: `"${module.name}" modülü devre dışı bırakıldı.`
        return await this.modulesService.findByCode(id);
      } catch (innerError) {atch (error) {
        throw new NotFoundException(`Modül bulunamadı: ${id}`);kli
      }
    }
  }     message: `"${id}" modülü devre dışı bırakılmak üzere işaretlendi. .env dosyasını güncelleyin.`
       };
  @Post()     }
  async createModule(@Body() createModuleDto: CreateModuleDto) {    }
    return this.modulesService.create(createModuleDto);ch (error) {
  }or('Modül devre dışı bırakma hatası:', error);
  
  @Put(':id')
  async updateModule(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {     message: `Modül devre dışı bırakılamadı: ${error.message}`
    return this.modulesService.update(id, updateModuleDto);    };
  }
  
  @Delete(':id')
  async deleteModule(@Param('id') id: string) {
    await this.modulesService.remove(id);Roles('admin')
    return { success: true, message: 'Modül başarıyla silindi' };async getModule(@Param('id') id: string) {
  }
}t this.modulesService.findOne(id);
        return await this.modulesService.findByCode(id);
      } catch (innerError) {
        throw new NotFoundException(`Modül bulunamadı: ${id}`);
      }
    }
  }
  
  @Post()
  @Roles('admin')
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }
  
  @Put(':id')
  @Roles('admin')
  async updateModule(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.modulesService.update(id, updateModuleDto);
  }
  
  @Delete(':id')
  @Roles('admin')
  async deleteModule(@Param('id') id: string) {
    await this.modulesService.remove(id);
    return { success: true, message: 'Modül başarıyla silindi' };
  }
}
