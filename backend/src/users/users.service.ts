import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Credit } from '../credits/entities/credit.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Credit)
    private creditsRepository: Repository<Credit>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({ 
      where: [
        { email: userData.email },
        { username: userData.username },
      ]
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createInitialCredit(userId: string, initialAmount: number = 50): Promise<void> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Create initial credit for new user
    const credit = this.creditsRepository.create({
      user,
      amount: initialAmount,
    });
    
    await this.creditsRepository.save(credit);
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Don't allow password updates through this method
    if (updateData.password_hash) {
      delete updateData.password_hash;
    }
    
    this.usersRepository.merge(user, updateData);
    return this.usersRepository.save(user);
  }

  async getUserModules(userId: string): Promise<any[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['user_modules', 'user_modules.module'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return user.user_modules.map(userModule => ({
      id: userModule.module.id,
      name: userModule.module.name,
      description: userModule.module.description,
      activatedAt: userModule.activated_at,
      expiresAt: userModule.expires_at,
      status: userModule.status,
    }));
  }
}
