import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('credits')
export class Credit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.credits)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;
}
