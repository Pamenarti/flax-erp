import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SalesOrder, OrderStatus } from '../entities/sales-order.entity';
import { SalesOrderItem } from '../entities/sales-order-item.entity';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../dto/sales-order.dto';
import { CustomerService } from './customer.service';
import { ProductService } from '../../inventory/services/product.service';
import { StockMovementService } from '../../inventory/services/stock-movement.service';

@Injectable()
export class SalesOrderService {
  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private salesOrderItemRepository: Repository<SalesOrderItem>,
    private customerService: CustomerService,
    private productService: ProductService,
    private stockMovementService: StockMovementService,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<SalesOrder[]> {
    return this.salesOrderRepository.find({
      relations: ['customer', 'items'],
      order: {
        orderDate: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<SalesOrder> {
    const order = await this.salesOrderRepository.findOne({ 
      where: { id },
      relations: ['customer', 'items', 'items.product', 'invoices']
    });
    
    if (!order) {
      throw new NotFoundException(`Sipariş #${id} bulunamadı`);
    }
    
    return order;
  }

  async create(createSalesOrderDto: CreateSalesOrderDto): Promise<SalesOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Müşteriyi kontrol et
      const customer = await this.customerService.findOne(createSalesOrderDto.customerId);
      
      // Sipariş numarası oluştur
      const orderNumber = await this.generateOrderNumber();
      
      // Sipariş oluştur
      const order = this.salesOrderRepository.create({
        orderNumber,
        orderDate: new Date(createSalesOrderDto.orderDate),
        deliveryDate: createSalesOrderDto.deliveryDate ? new Date(createSalesOrderDto.deliveryDate) : null,
        customerId: customer.id,
        status: createSalesOrderDto.status || OrderStatus.DRAFT,
        notes: createSalesOrderDto.notes
      });
      
      // Siparişi kaydet
      const savedOrder = await this.salesOrderRepository.save(order);
      
      // Sipariş kalemlerini işle
      let subtotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;
      
      for (const itemDto of createSalesOrderDto.items) {
        const product = await this.productService.findOne(itemDto.productId);
        
        // Birim fiyat, vergi oranı ve indirim oranı kontrolü
        const unitPrice = itemDto.unitPrice || product.salePrice;
        const taxRate = itemDto.taxRate !== undefined ? itemDto.taxRate : product.taxRate;
        const discountRate = itemDto.discountRate || 0;
        
        // Hesaplamalar
        const itemSubtotal = unitPrice * itemDto.quantity;
        const itemDiscount = (itemSubtotal * discountRate) / 100;
        const itemTax = ((itemSubtotal - itemDiscount) * taxRate) / 100;
        const itemTotal = itemSubtotal - itemDiscount + itemTax;
        
        // Sipariş kalemi oluştur
        const orderItem = this.salesOrderItemRepository.create({
          orderId: savedOrder.id,
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: itemDto.quantity,
          taxRate,
          discountRate,
          subtotal: itemSubtotal,
          total: itemTotal
        });
        
        await this.salesOrderItemRepository.save(orderItem);
        
        // Toplam değerleri güncelle
        subtotal += itemSubtotal;
        taxAmount += itemTax;
        discountAmount += itemDiscount;
      }
      
      // Sipariş toplamlarını güncelle
      const totalAmount = subtotal - discountAmount + taxAmount;
      
      await this.salesOrderRepository.update(savedOrder.id, {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount
      });
      
      await queryRunner.commitTransaction();
      
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateSalesOrderDto: UpdateSalesOrderDto): Promise<SalesOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(id);
      
      // Durumu "taslak" olmayan siparişlerin kalemlerini düzenlemeye izin verme
      if (updateSalesOrderDto.items && order.status !== OrderStatus.DRAFT) {
        throw new BadRequestException('Taslak olmayan siparişlerin kalemleri düzenlenemez');
      }
      
      // Temel alanları güncelle
      if (updateSalesOrderDto.customerId) {
        await this.customerService.findOne(updateSalesOrderDto.customerId);
        order.customerId = updateSalesOrderDto.customerId;
      }
      
      if (updateSalesOrderDto.orderDate) {
        order.orderDate = new Date(updateSalesOrderDto.orderDate);
      }
      
      if (updateSalesOrderDto.deliveryDate) {
        order.deliveryDate = new Date(updateSalesOrderDto.deliveryDate);
      }
      
      if (updateSalesOrderDto.notes !== undefined) {
        order.notes = updateSalesOrderDto.notes;
      }
      
      if (updateSalesOrderDto.status) {
        order.status = updateSalesOrderDto.status;
        
        // Sipariş durumu onaylandıysa, stok hareketlerini oluştur
        if (updateSalesOrderDto.status === OrderStatus.CONFIRMED && order.status !== OrderStatus.CONFIRMED) {
          for (const item of order.items) {
            await this.stockMovementService.createStockReservation(
              item.productId,
              item.quantity,
              `Sipariş #${order.orderNumber} için rezervasyon`,
              order.id
            );
          }
        }
      }
      
      // Kalemleri güncelle
      if (updateSalesOrderDto.items) {
        // Mevcut kalemleri sil
        await this.salesOrderItemRepository.delete({ orderId: order.id });
        
        // Yeni kalemleri ekle
        let subtotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;
        
        for (const itemDto of updateSalesOrderDto.items) {
          const product = await this.productService.findOne(itemDto.productId);
          
          const unitPrice = itemDto.unitPrice || product.salePrice;
          const taxRate = itemDto.taxRate !== undefined ? itemDto.taxRate : product.taxRate;
          const discountRate = itemDto.discountRate || 0;
          
          const itemSubtotal = unitPrice * itemDto.quantity;
          const itemDiscount = (itemSubtotal * discountRate) / 100;
          const itemTax = ((itemSubtotal - itemDiscount) * taxRate) / 100;
          const itemTotal = itemSubtotal - itemDiscount + itemTax;
          
          const orderItem = this.salesOrderItemRepository.create({
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            unitPrice,
            quantity: itemDto.quantity,
            taxRate,
            discountRate,
            subtotal: itemSubtotal,
            total: itemTotal
          });
          
          await this.salesOrderItemRepository.save(orderItem);
          
          subtotal += itemSubtotal;
          taxAmount += itemTax;
          discountAmount += itemDiscount;
        }
        
        // Siparişi güncelle
        const totalAmount = subtotal - discountAmount + taxAmount;
        
        order.subtotal = subtotal;
        order.taxAmount = taxAmount;
        order.discountAmount = discountAmount;
        order.totalAmount = totalAmount;
      }
      
      const updatedOrder = await this.salesOrderRepository.save(order);
      
      await queryRunner.commitTransaction();
      
      return this.findOne(updatedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    
    if (order.status !== OrderStatus.DRAFT && order.status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('Sadece taslak veya iptal edilmiş siparişler silinebilir');
    }
    
    const result = await this.salesOrderRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Sipariş #${id} bulunamadı`);
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().substr(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SO${year}${month}`;
    
    // Son sipariş numarasını al
    const lastOrder = await this.salesOrderRepository.findOne({
      where: {
        orderNumber: Like(`${prefix}%`),
      },
      order: {
        orderNumber: 'DESC',
      },
    });
    
    let sequential = 1;
    
    if (lastOrder) {
      const lastSequential = parseInt(lastOrder.orderNumber.substr(-4), 10);
      sequential = lastSequential + 1;
    }
    
    return `${prefix}${String(sequential).padStart(4, '0')}`;
  }
}
