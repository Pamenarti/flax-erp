import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalesInvoiceService } from '../services/sales-invoice.service';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../dto/sales-invoice.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('api/sales/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesInvoiceController {
  constructor(private readonly salesInvoiceService: SalesInvoiceService) {}

  @Post()
  @Roles('admin', 'sales')
  create(@Body() createSalesInvoiceDto: CreateSalesInvoiceDto) {
    return this.salesInvoiceService.create(createSalesInvoiceDto);
  }

  @Get()
  @Roles('admin', 'sales', 'finance')
  findAll() {
    return this.salesInvoiceService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'sales', 'finance')
  findOne(@Param('id') id: string) {
    return this.salesInvoiceService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'sales', 'finance')
  update(@Param('id') id: string, @Body() updateSalesInvoiceDto: UpdateSalesInvoiceDto) {
    return this.salesInvoiceService.update(id, updateSalesInvoiceDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.salesInvoiceService.remove(id);
  }
}
