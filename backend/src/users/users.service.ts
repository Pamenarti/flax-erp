import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Kullanıcı #${id} bulunamadı`);
    }
    return user;
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = new User();
    user.email = userData.email;
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.roles = userData.roles || ['user'];
    user.isActive = userData.isActive ?? true;
    user.password = await bcrypt.hash(userData.password, 10);
    
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    // Sadece sağlanan alanları güncelle
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.firstName) user.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
    if (updateUserDto.roles) user.roles = updateUserDto.roles;
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;
    
    // Şifre sadece sağlanmışsa güncelle
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  
  async search(params: any): Promise<User[]> {
    // Gelişmiş arama için örnek bir metot
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    
    if (params.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${params.email}%` });
    }
    
    if (params.firstName) {
      queryBuilder.andWhere('user.firstName LIKE :firstName', { firstName: `%${params.firstName}%` });
    }
    
    if (params.lastName) {
      queryBuilder.andWhere('user.lastName LIKE :lastName', { lastName: `%${params.lastName}%` });
    }
    
    if (params.role) {
      queryBuilder.andWhere(':role = ANY(user.roles)', { role: params.role });
    }
    
    return queryBuilder.getMany();
  }

  async seedAdmin() {
    const adminExists = await this.findOne('admin@flaxerp.com');
    
    if (!adminExists) {
      return this.create({
        email: 'admin@flaxerp.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123',
        roles: ['admin'],
        isActive: true
      });
    }
    
    return adminExists;
  }
  
  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Kullanıcı #${id} bulunamadı`);
    }
  }
}
