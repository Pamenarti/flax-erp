import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesOrderItem } from './entities/sales-order-item.entity';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesInvoiceItem } from './entities/sales-invoice-item.entity';
import { CustomerService } from './services/customer.service';
import { SalesOrderService } from './services/sales-order.service';
import { SalesInvoiceService } from './services/sales-invoice.service';
import { CustomerController } from './controllers/customer.controller';
import { SalesOrderController } from './controllers/sales-order.controller';
import { SalesInvoiceController } from './controllers/sales-invoice.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      SalesOrder,
      SalesOrderItem,
      SalesInvoice,
      SalesInvoiceItem
    ]),
    InventoryModule
  ],
  controllers: [
    CustomerController,
    SalesOrderController,
    SalesInvoiceController
  ],
  providers: [
    CustomerService,
    SalesOrderService,
    SalesInvoiceService
  ],
  exports: [
    CustomerService,
    SalesOrderService,
    SalesInvoiceService
  ]
})
export class SalesModule {}
