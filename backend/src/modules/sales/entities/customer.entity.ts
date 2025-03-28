import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SalesOrder } from './sales-order.entity';
import { SalesInvoice } from './sales-invoice.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true })
  taxNumber: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SalesOrder, order => order.customer)
  orders: SalesOrder[];

  @OneToMany(() => SalesInvoice, invoice => invoice.customer)
  invoices: SalesInvoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
