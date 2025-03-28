import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Module } from './module.entity';

export enum UserModuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
}

@Entity('user_modules')
export class UserModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.user_modules)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Module, module => module.user_modules)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ type: 'timestamp' })
  activated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({
    type: 'enum',
    enum: UserModuleStatus,
    default: UserModuleStatus.ACTIVE,
  })
  status: UserModuleStatus;

  @CreateDateColumn()
  created_at: Date;
}
