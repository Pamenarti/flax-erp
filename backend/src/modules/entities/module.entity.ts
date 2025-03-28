import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: '1.0.0' })
  version: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isCore: boolean;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'varchar', nullable: true })
  route: string;

  @Column({ type: 'int', default: 100 })
  order: number;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  dependencies: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
