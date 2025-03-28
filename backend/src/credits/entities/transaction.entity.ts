import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  CREDIT_PURCHASE = 'credit_purchase',
  MODULE_PURCHASE = 'module_purchase',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ nullable: true })
  module_id: string;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
