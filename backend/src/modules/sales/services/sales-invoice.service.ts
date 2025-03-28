import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { SalesInvoice, InvoiceStatus } from '../entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../entities/sales-invoice-item.entity';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../dto/sales-invoice.dto';
import { CustomerService } from './customer.service';
import { ProductService } from '../../inventory/services/product.service';
import { SalesOrderService } from './sales-order.service';
import { StockMovementService } from '../../inventory/services/stock-movement.service';

@Injectable()
export class SalesInvoiceService {
  constructor(
    @InjectRepository(SalesInvoice)
    private salesInvoiceRepository: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceItem)
    private salesInvoiceItemRepository: Repository<SalesInvoiceItem>,
    private customerService: CustomerService,
    private productService: ProductService,
    private salesOrderService: SalesOrderService,
    private stockMovementService: StockMovementService,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<SalesInvoice[]> {
    return this.salesInvoiceRepository.find({
      relations: ['customer', 'order', 'items'],
      order: {
        issueDate: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<SalesInvoice> {
    const invoice = await this.salesInvoiceRepository.findOne({ 
      where: { id },
      relations: ['customer', 'order', 'items', 'items.product']
    });
    
    if (!invoice) {
      throw new NotFoundException(`Fatura #${id} bulunamadı`);
    }
    
    return invoice;
  }

  async create(createSalesInvoiceDto: CreateSalesInvoiceDto): Promise<SalesInvoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Müşteriyi kontrol et
      const customer = await this.customerService.findOne(createSalesInvoiceDto.customerId);
      
      // Fatura numarası oluştur
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Fatura oluştur
      const invoice = this.salesInvoiceRepository.create({
        invoiceNumber,
        issueDate: new Date(createSalesInvoiceDto.issueDate),
        dueDate: new Date(createSalesInvoiceDto.dueDate),
        customerId: customer.id,
        status: createSalesInvoiceDto.status || InvoiceStatus.DRAFT,
        notes: createSalesInvoiceDto.notes
      });
      
      // Eğer sipariş ID varsa, kontrol et ve ilişkilendir
      if (createSalesInvoiceDto.orderId) {
        const order = await this.salesOrderService.findOne(createSalesInvoiceDto.orderId);
        invoice.orderId = order.id;
      }
      
      // Faturayı kaydet
      const savedInvoice = await this.salesInvoiceRepository.save(invoice);
      
      // Fatura kalemlerini işle
      let subtotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;
      
      for (const itemDto of createSalesInvoiceDto.items) {
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
        
        // Fatura kalemi oluştur
        const invoiceItem = this.salesInvoiceItemRepository.create({
          invoiceId: savedInvoice.id,
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: itemDto.quantity,
          taxRate,
          discountRate,
          subtotal: itemSubtotal,
          total: itemTotal
        });
        
        await this.salesInvoiceItemRepository.save(invoiceItem);
        
        // Toplam değerleri güncelle
        subtotal += itemSubtotal;
        taxAmount += itemTax;
        discountAmount += itemDiscount;
      }
      
      // Fatura toplamlarını güncelle
      const totalAmount = subtotal - discountAmount + taxAmount;
      const dueAmount = totalAmount; // Başlangıçta toplam tutar ödenmemiş tutardır
      
      await this.salesInvoiceRepository.update(savedInvoice.id, {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        dueAmount
      });
      
      // Fatura durumu "kesildi" ise stok hareketleri oluştur
      if (invoice.status === InvoiceStatus.ISSUED) {
        for (const item of createSalesInvoiceDto.items) {
          await this.stockMovementService.createSalesMovement(
            item.productId,
            item.quantity,
            `Fatura #${invoice.invoiceNumber} için satış`,
            savedInvoice.id
          );
        }
      }
      
      await queryRunner.commitTransaction();
      
      return this.findOne(savedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateSalesInvoiceDto: UpdateSalesInvoiceDto): Promise<SalesInvoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoice = await this.findOne(id);
      
      // Durumu "taslak" olmayan faturaların kalemlerini düzenlemeye izin verme
      if (updateSalesInvoiceDto.items && invoice.status !== InvoiceStatus.DRAFT) {
        throw new BadRequestException('Taslak olmayan faturaların kalemleri düzenlenemez');
      }
      
      // Temel alanları güncelle
      if (updateSalesInvoiceDto.customerId) {
        await this.customerService.findOne(updateSalesInvoiceDto.customerId);
        invoice.customerId = updateSalesInvoiceDto.customerId;
      }
      
      if (updateSalesInvoiceDto.orderId) {
        await this.salesOrderService.findOne(updateSalesInvoiceDto.orderId);
        invoice.orderId = updateSalesInvoiceDto.orderId;
      }
      
      if (updateSalesInvoiceDto.issueDate) {
        invoice.issueDate = new Date(updateSalesInvoiceDto.issueDate);
      }
      
      if (updateSalesInvoiceDto.dueDate) {
        invoice.dueDate = new Date(updateSalesInvoiceDto.dueDate);
      }
      
      if (updateSalesInvoiceDto.notes !== undefined) {
        invoice.notes = updateSalesInvoiceDto.notes;
      }
      
      const oldStatus = invoice.status;
      
      if (updateSalesInvoiceDto.status) {
        invoice.status = updateSalesInvoiceDto.status;
        
        // Fatura durumu "kesildi" olarak değiştiyse, stok hareketleri oluştur
        if (updateSalesInvoiceDto.status === InvoiceStatus.ISSUED && oldStatus !== InvoiceStatus.ISSUED) {
          for (const item of invoice.items) {
            await this.stockMovementService.createSalesMovement(
              item.productId,
              item.quantity,
              `Fatura #${invoice.invoiceNumber} için satış`,
              invoice.id
            );
          }
        }
      }
      
      // Kalemleri güncelle
      if (updateSalesInvoiceDto.items) {
        // Mevcut kalemleri sil
        await this.salesInvoiceItemRepository.delete({ invoiceId: invoice.id });
        
        // Yeni kalemleri ekle
        let subtotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;
        
        for (const itemDto of updateSalesInvoiceDto.items) {
          const product = await this.productService.findOne(itemDto.productId);
          
          const unitPrice = itemDto.unitPrice || product.salePrice;
          const taxRate = itemDto.taxRate !== undefined ? itemDto.taxRate : product.taxRate;
          const discountRate = itemDto.discountRate || 0;
          
          const itemSubtotal = unitPrice * itemDto.quantity;
          const itemDiscount = (itemSubtotal * discountRate) / 100;
          const itemTax = ((itemSubtotal - itemDiscount) * taxRate) / 100;
          const itemTotal = itemSubtotal - itemDiscount + itemTax;
          
          const invoiceItem = this.salesInvoiceItemRepository.create({
            invoiceId: invoice.id,
            productId: product.id,
            productName: product.name,
            unitPrice,
            quantity: itemDto.quantity,
            taxRate,
            discountRate,
            subtotal: itemSubtotal,
            total: itemTotal
          });
          
          await this.salesInvoiceItemRepository.save(invoiceItem);
          
          subtotal += itemSubtotal;
          taxAmount += itemTax;
          discountAmount += itemDiscount;
        }
        
        // Faturayı güncelle
        const totalAmount = subtotal - discountAmount + taxAmount;
        
        invoice.subtotal = subtotal;
        invoice.taxAmount = taxAmount;
        invoice.discountAmount = discountAmount;
        invoice.totalAmount = totalAmount;
        invoice.dueAmount = totalAmount - invoice.paidAmount;
      }
      
      // Ödenen tutarı güncelle
      if (updateSalesInvoiceDto.paidAmount !== undefined) {
        invoice.paidAmount = updateSalesInvoiceDto.paidAmount;
        invoice.dueAmount = invoice.totalAmount - invoice.paidAmount;
        
        // Ödeme durumunu otomatik olarak güncelle
        if (invoice.paidAmount >= invoice.totalAmount) {
          invoice.status = InvoiceStatus.PAID;
        } else if (invoice.paidAmount > 0) {
          invoice.status = InvoiceStatus.PARTIALLY_PAID;
        }
      }
      
      const updatedInvoice = await this.salesInvoiceRepository.save(invoice);
      
      await queryRunner.commitTransaction();
      
      return this.findOne(updatedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    
    if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Sadece taslak veya iptal edilmiş faturalar silinebilir');
    }
    
    const result = await this.salesInvoiceRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Fatura #${id} bulunamadı`);
    }
  }

  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().substr(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `INV${year}${month}`;
    
    // Son fatura numarasını al
    const lastInvoice = await this.salesInvoiceRepository.findOne({
      where: {
        invoiceNumber: Like(`${prefix}%`),
      },
      order: {
        invoiceNumber: 'DESC',
      },
    });
    
    let sequential = 1;
    
    if (lastInvoice) {
      const lastSequential = parseInt(lastInvoice.invoiceNumber.substr(-4), 10);
      sequential = lastSequential + 1;
    }
    
    return `${prefix}${String(sequential).padStart(4, '0')}`;
  }
}
