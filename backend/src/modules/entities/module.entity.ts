import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isCore: boolean;

  @Column({ nullable: true })
  version: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  route: string;

  @Column({ default: 0 })
  order: number;

  @Column('simple-array', { nullable: true })
  dependencies: string[];

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
