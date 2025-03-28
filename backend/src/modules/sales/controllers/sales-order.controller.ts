import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalesOrderService } from '../services/sales-order.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../dto/sales-order.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('api/sales/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Post()
  @Roles('admin', 'sales')
  create(@Body() createSalesOrderDto: CreateSalesOrderDto) {
    return this.salesOrderService.create(createSalesOrderDto);
  }

  @Get()
  @Roles('admin', 'sales', 'inventory')
  findAll() {
    return this.salesOrderService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'sales', 'inventory')
  findOne(@Param('id') id: string) {
    return this.salesOrderService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'sales')
  update(@Param('id') id: string, @Body() updateSalesOrderDto: UpdateSalesOrderDto) {
    return this.salesOrderService.update(id, updateSalesOrderDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.salesOrderService.remove(id);
  }
}
