import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './controllers/products.controller';
import { StockMovementsController } from './controllers/stock-movements.controller';
import { ProductsService } from './services/products.service';
import { StockMovementsService } from './services/stock-movements.service';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockMovement])],
  controllers: [ProductsController, StockMovementsController],
  providers: [ProductsService, StockMovementsService],
  exports: [ProductsService, StockMovementsService],
})
export class InventoryModule {}
