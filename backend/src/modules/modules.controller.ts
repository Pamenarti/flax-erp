import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ModulesService } from './modules.service';
import { Module } from './entities/module.entity';
import { CreateModuleDto, UpdateModuleDto, ToggleModuleDto } from './dto/module.dto';

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @Roles('admin', 'user')
  findAll(): Promise<Module[]> {
    return this.modulesService.findAll();
  }

  @Get('active')
  @Roles('admin', 'user')
  findActive(): Promise<Module[]> {
    return this.modulesService.findActive();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string): Promise<Module> {
    return this.modulesService.findOne(id);
  }

  @Get('code/:code')
  @Roles('admin')
  findByCode(@Param('code') code: string): Promise<Module> {
    return this.modulesService.findByCode(code);
  }

  @Post()
  @Roles('admin')
  create(@Body() createModuleDto: CreateModuleDto): Promise<Module> {
    return this.modulesService.create(createModuleDto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto): Promise<Module> {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.modulesService.remove(id);
  }

  @Put(':id/toggle')
  @Roles('admin')
  toggle(@Param('id') id: string, @Body() toggleDto: ToggleModuleDto): Promise<Module> {
    return this.modulesService.toggle(id, toggleDto);
  }
}
