import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { Module as ModuleEntity } from './entities/module.entity';
import { UserModule } from './entities/user-module.entity';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleEntity, UserModule]),
    CreditsModule
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
