import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './entities/module.entity';
import { CreateModuleDto, UpdateModuleDto, ToggleModuleDto } from './dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  async findAll(): Promise<Module[]> {
    return this.moduleRepository.find({
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findActive(): Promise<Module[]> {
    return this.moduleRepository.find({
      where: { isActive: true },
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Modül #${id} bulunamadı`);
    }
    return module;
  }

  async findByCode(code: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { code } });
    if (!module) {
      throw new NotFoundException(`${code} kodlu modül bulunamadı`);
    }
    return module;
  }

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    const existingModule = await this.moduleRepository.findOne({
      where: { code: createModuleDto.code },
    });
    
    if (existingModule) {
      throw new ConflictException(`${createModuleDto.code} kodlu modül zaten mevcut`);
    }
    
    const module = this.moduleRepository.create(createModuleDto);
    return this.moduleRepository.save(module);
  }

  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const module = await this.findOne(id);
    
    Object.assign(module, updateModuleDto);
    
    return this.moduleRepository.save(module);
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);
    
    if (module.isCore) {
      throw new ConflictException(`${module.name} bir çekirdek modüldür ve silinemez`);
    }
    
    const result = await this.moduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Modül #${id} bulunamadı`);
    }
  }

  async toggle(id: string, toggleDto: ToggleModuleDto): Promise<Module> {
    const module = await this.findOne(id);
    
    module.isActive = toggleDto.isActive;
    
    if (toggleDto.isActive && module.dependencies && module.dependencies.length > 0) {
      for (const dependencyCode of module.dependencies) {
        try {
          const dependency = await this.findByCode(dependencyCode);
          
          if (!dependency.isActive) {
            throw new ConflictException(
              `${module.name} modülünü etkinleştirmek için önce ${dependency.name} modülünü etkinleştirmelisiniz.`
            );
          }
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new ConflictException(
              `${module.name} modülünün bağımlı olduğu ${dependencyCode} modülü bulunamadı.`
            );
          }
          throw error;
        }
      }
    }
    
    return this.moduleRepository.save(module);
  }

  async enable(id: number): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new Error('Modül bulunamadı');
    }
    
    module.isActive = true;
    return this.moduleRepository.save(module);
  }

  async disable(id: number): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new Error('Modül bulunamadı');
    }
    
    module.isActive = false;
    return this.moduleRepository.save(module);
  }

  async seedDefaultModules(): Promise<void> {
    const defaultModules = [
      {
        code: 'core',
        name: 'Çekirdek Sistem',
        description: 'Temel sistem bileşenleri ve gösterge paneli',
        isActive: true,
        isCore: true,
        version: '1.0.0',
        icon: 'DashboardIcon',
        route: '/dashboard',
        order: 1,
        category: 'Sistem'
      },
      {
        code: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcı hesapları ve yetkilendirme',
        isActive: true,
        isCore: true,
        version: '1.0.0',
        icon: 'PeopleIcon',
        route: '/users',
        order: 2,
        category: 'Sistem',
        dependencies: ['core']
      },
      {
        code: 'inventory',
        name: 'Stok Yönetimi',
        description: 'Envanter takibi ve stok hareketleri',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        icon: 'InventoryIcon',
        route: '/inventory',
        order: 3,
        category: 'Operasyon',
        dependencies: ['core']
      },
      {
        code: 'sales',
        name: 'Satış Yönetimi',
        description: 'Siparişler, müşteriler ve faturalar',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        icon: 'ShoppingCartIcon',
        route: '/sales',
        order: 4,
        category: 'Operasyon',
        dependencies: ['core', 'inventory']
      },
      {
        code: 'purchasing',
        name: 'Satın Alma',
        description: 'Tedarikçiler, satın alma siparişleri ve satın alma faturaları',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        icon: 'ShoppingBasketIcon',
        route: '/purchasing',
        order: 5,
        category: 'Operasyon',
        dependencies: ['core', 'inventory']
      },
      {
        code: 'finance',
        name: 'Finans Yönetimi',
        description: 'Muhasebe, cari hesaplar ve nakit akışı',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        icon: 'AccountBalanceIcon',
        route: '/finance',
        order: 6,
        category: 'Finans',
        dependencies: ['core']
      },
      {
        code: 'reports',
        name: 'Raporlama',
        description: 'İstatistikler ve detaylı raporlar',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        icon: 'BarChartIcon',
        route: '/reports',
        order: 7,
        category: 'Analiz',
        dependencies: ['core']
      },
      {
        code: 'project',
        name: 'Proje Yönetimi',
        description: 'Projeler, görevler ve zaman takibi',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        icon: 'AssignmentIcon',
        route: '/projects',
        order: 8,
        category: 'Operasyon',
        dependencies: ['core']
      },
      {
        code: 'hr',
        name: 'İnsan Kaynakları',
        description: 'Personel, izin ve performans yönetimi',
        isActive: false,
        isCore: false,
        version: '1.0.0',
        icon: 'GroupWorkIcon',
        route: '/hr',
        order: 9,
        category: 'Yönetim',
        dependencies: ['core']
      },
      {
        code: 'settings',
        name: 'Sistem Ayarları',
        description: 'Uygulama yapılandırması ve tercihler',
        isActive: true,
        isCore: true,
        version: '1.0.0',
        icon: 'SettingsIcon',
        route: '/settings',
        order: 10,
        category: 'Sistem',
        dependencies: ['core']
      }
    ];

    for (const moduleData of defaultModules) {
      const existingModule = await this.moduleRepository.findOne({
        where: { code: moduleData.code },
      });
      
      if (!existingModule) {
        await this.moduleRepository.save(this.moduleRepository.create(moduleData));
      }
    }
  }
}
