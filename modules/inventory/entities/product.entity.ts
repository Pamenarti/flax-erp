import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category.entity';
import { StockMovement } from './stock-movement.entity';
import { StockLevel } from './stock-level.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salePrice: number;

  @Column({ default: 0 })
  minStockLevel: number;

  @Column({ default: 0 })
  maxStockLevel: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'json', nullable: true })
  attributes: Record<string, any>;

  @ManyToOne(() => Category, category => category.products, { nullable: true })
  category: Category;

  @OneToMany(() => StockMovement, stockMovement => stockMovement.product)
  stockMovements: StockMovement[];

  @OneToMany(() => StockLevel, stockLevel => stockLevel.product)
  stockLevels: StockLevel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
