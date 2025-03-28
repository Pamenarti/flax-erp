import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, product => product.stockMovements)
  product: Product;

  @ManyToOne(() => Warehouse, warehouse => warehouse.stockMovements)
  warehouse: Warehouse;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: StockMovementType,
    default: StockMovementType.IN
  })
  type: StockMovementType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  performedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
