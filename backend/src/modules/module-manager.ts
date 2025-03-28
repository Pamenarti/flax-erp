import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

interface Module {
  name: string;
  isEnabled: boolean;
  description: string;
  version: string;
  dependencies: string[];
}

@Injectable()
export class ModuleManager implements OnApplicationBootstrap {
  private modules: Map<string, Module> = new Map();
  private enabledModules: string[] = [];
  private readonly logger = new Logger(ModuleManager.name);

  constructor() {
    try {
      // Load enabled modules from .env
      dotenv.config();
      const enabledModulesList = process.env.ENABLED_MODULES || 'core';
      this.enabledModules = enabledModulesList.split(',').map(m => m.trim());
      this.logger.log(`Etkinleştirilmiş modüller: ${this.enabledModules.join(', ')}`);
    } catch (error) {
      this.logger.error('Etkinleştirilmiş modüller yüklenirken hata oluştu', error);
      // Varsayılan olarak sadece core modülünü etkinleştir
      this.enabledModules = ['core'];
    }
  }

  async onApplicationBootstrap() {
    try {
      await this.scanModules();
      this.validateDependencies();
    } catch (error) {
      this.logger.error('Modül taraması sırasında hata oluştu', error);
    }
  }

  private async scanModules() {
    try {
      // Scan the modules directory to find all available modules
      const modulesPath = path.join(__dirname, './');
      this.logger.log(`Modüller taranıyor: ${modulesPath}`);
      
      if (!fs.existsSync(modulesPath)) {
        this.logger.warn(`Modül dizini bulunamadı: ${modulesPath}`);
        return;
      }
      
      const files = fs.readdirSync(modulesPath);
      
      // En azından core modülünü oluştur
      this.modules.set('core', {
        name: 'core',
        description: 'Sistem çekirdek modülü',
        version: '1.0.0',
        dependencies: [],
        isEnabled: true
      });
      
      for (const file of files) {
        const fullPath = path.join(modulesPath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
          const moduleInfoPath = path.join(fullPath, 'module-info.json');
          
          if (fs.existsSync(moduleInfoPath)) {
            try {
              const moduleInfo = JSON.parse(
                fs.readFileSync(moduleInfoPath, 'utf8')
              );
              
              const module: Module = {
                name: moduleInfo.name,
                description: moduleInfo.description || `${moduleInfo.name} modülü`,
                version: moduleInfo.version || '1.0.0',
                dependencies: moduleInfo.dependencies || [],
                isEnabled: this.enabledModules.includes(moduleInfo.name)
              };
              
              this.modules.set(module.name, module);
              this.logger.log(`Modül bulundu: ${module.name} (${module.isEnabled ? 'Etkin' : 'Devre dışı'})`);
            } catch (error) {
              this.logger.error(`${moduleInfoPath} modülü yüklenirken hata: ${error.message}`);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Modüller taranırken hata: ${error.message}`);
      // En azından core modülünü oluştur
      this.modules.set('core', {
        name: 'core',
        description: 'Sistem çekirdek modülü',
        version: '1.0.0',
        dependencies: [],
        isEnabled: true
      });
    }
  }

  private validateDependencies() {
    // Check if all dependencies of enabled modules are also enabled
    for (const [name, module] of this.modules.entries()) {
      if (module.isEnabled) {
        for (const dependency of module.dependencies) {
          const dependencyModule = this.modules.get(dependency);
          if (!dependencyModule || !dependencyModule.isEnabled) {
            this.logger.warn(`"${name}" modülü "${dependency}" modülüne bağımlı, ancak bu modül etkin değil veya bulunamadı. "${name}" devre dışı bırakılıyor.`);
            module.isEnabled = false;
            break;
          }
        }
      }
    }
  }

  isModuleEnabled(moduleName: string): boolean {
    const module = this.modules.get(moduleName);
    return module ? module.isEnabled : false;
  }

  getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  getEnabledModules(): Module[] {
    return Array.from(this.modules.values()).filter(module => module.isEnabled);
  }
}
