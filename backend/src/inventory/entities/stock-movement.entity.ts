import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

export enum MovementType {
  PURCHASE = 'purchase',     // Satın alma
  SALE = 'sale',             // Satış
  ADJUST = 'adjust',         // Stok ayarlama
  RETURN = 'return',         // İade
  TRANSFER = 'transfer',     // Transfer
  INITIAL = 'initial',       // Açılış
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.stockMovements)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  productId: string;

  @Column('enum', { enum: MovementType })
  movementType: MovementType;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number; // Pozitif: giriş, Negatif: çıkış

  @Column({ nullable: true })
  documentNumber: string; // İrsaliye/fatura numarası gibi

  @Column({ nullable: true })
  notes: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @CreateDateColumn()
  date: Date;
}
