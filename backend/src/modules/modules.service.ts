import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './entities/module.entity';
import { UserModule, UserModuleStatus } from './entities/user-module.entity';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(UserModule)
    private userModuleRepository: Repository<UserModule>,
    private creditsService: CreditsService
  ) {}

  async findAll(): Promise<Module[]> {
    return this.moduleRepository.find();
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  async purchaseModule(userId: string, moduleId: string): Promise<UserModule> {
    // Check if module exists
    const module = await this.findOne(moduleId);
    
    // Check if user already has this module
    const existingUserModule = await this.userModuleRepository.findOne({
      where: { 
        user: { id: userId }, 
        module: { id: moduleId } 
      }
    });
    
    if (existingUserModule) {
      throw new BadRequestException('You already own this module');
    }
    
    // Use credits to purchase the module
    await this.creditsService.useCredits(userId, {
      amount: module.price,
      moduleId: module.id,
      description: `${module.name} Modülü satın alma`
    });
    
    // Create user-module relationship
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Set expiration to 1 year from now
    
    const userModule = this.userModuleRepository.create({
      user: { id: userId },
      module: { id: moduleId },
      activated_at: now,
      expires_at: expiresAt,
      status: UserModuleStatus.ACTIVE
    });
    
    return await this.userModuleRepository.save(userModule);
  }

  async getUserModules(userId: string): Promise<UserModule[]> {
    return this.userModuleRepository.find({
      where: { user: { id: userId } },
      relations: ['module']
    });
  }
}
