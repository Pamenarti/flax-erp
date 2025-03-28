import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { StockMovementsService } from '../services/stock-movements.service';
import { StockMovement } from '../entities/stock-movement.entity';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto';

@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  @Roles('admin', 'user')
  findAll(): Promise<StockMovement[]> {
    return this.stockMovementsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string): Promise<StockMovement> {
    return this.stockMovementsService.findOne(id);
  }

  @Get('product/:productId')
  @Roles('admin', 'user')
  findByProduct(@Param('productId') productId: string): Promise<StockMovement[]> {
    return this.stockMovementsService.findByProduct(productId);
  }

  @Get('product/:productId/batch-history')
  @Roles('admin', 'user')
  getBatchHistoryByProductId(@Param('productId') productId: string): Promise<any[]> {
    return this.stockMovementsService.getBatchHistoryByProductId(productId);
  }

  @Get('date-range')
  @Roles('admin', 'user')
  getMovementsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<StockMovement[]> {
    return this.stockMovementsService.getMovementsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Post()
  @Roles('admin')
  create(@Body() createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    return this.stockMovementsService.create(createStockMovementDto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateStockMovementDto: UpdateStockMovementDto): Promise<StockMovement> {
    return this.stockMovementsService.update(id, updateStockMovementDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.stockMovementsService.remove(id);
  }
}
