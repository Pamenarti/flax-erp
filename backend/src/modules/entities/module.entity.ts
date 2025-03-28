import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserModule } from './user-module.entity';

export enum ModuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEVELOPMENT = 'development',
}

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({
    type: 'enum',
    enum: ModuleStatus,
    default: ModuleStatus.DEVELOPMENT,
  })
  status: ModuleStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserModule, userModule => userModule.module)
  user_modules: UserModule[];
}
