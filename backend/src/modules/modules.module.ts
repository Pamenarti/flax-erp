import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { Module as ModuleEntity } from './entities/module.entity';
import { ModuleManager } from './module-manager';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity])],
  controllers: [ModulesController],
  providers: [ModulesService, ModuleManager],
  exports: [ModulesService, ModuleManager],
})
export class ModulesModule {
  static forRoot(): DynamicModule {
    return {
      module: ModulesModule,
      imports: [TypeOrmModule.forFeature([ModuleEntity])],
      controllers: [ModulesController], // Controller'ı burada da kaydedelim
      providers: [
        ModulesService,
        {
          provide: ModuleManager,
          useFactory: () => {
            const manager = new ModuleManager();
            return manager;
          },
        },
      ],
      exports: [ModulesService, ModuleManager],
      global: true, // Modülü global yapalım
    };
  }
}
