import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';

@Entity('stock_levels')
export class StockLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.stockLevels)
  product: Product;

  @ManyToOne(() => Warehouse, warehouse => warehouse.stockLevels)
  warehouse: Warehouse;

  @Column({ default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
  availableQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
