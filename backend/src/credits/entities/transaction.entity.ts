import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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
    enum: ['credit_purchase', 'module_purchase'],
  })
  type: 'credit_purchase' | 'module_purchase';

  @Column({ nullable: true })
  module_id: string;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
