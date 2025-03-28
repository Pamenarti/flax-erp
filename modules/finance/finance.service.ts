import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Transaction } from './entities/transaction.entity';
import { Customer } from './entities/customer.entity';
import { Payment } from './entities/payment.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  // Fatura İşlemleri
  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    const customer = await this.customerRepository.findOne({
      where: { id: createInvoiceDto.customer_id },
    });
    
    if (!customer) {
      throw new NotFoundException(`Müşteri ID: ${createInvoiceDto.customer_id} bulunamadı`);
    }

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      customer,
    });
    
    return this.invoiceRepository.save(invoice);
  }

  async findAllInvoices(page: number, limit: number, search: string) {
    const [invoices, total] = await this.invoiceRepository.findAndCount({
      where: [
        { invoice_number: Like(`%${search}%`) },
        { description: Like(`%${search}%`) },
      ],
      relations: ['customer'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOneInvoice(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['customer', 'payments'],
    });
    
    if (!invoice) {
      throw new NotFoundException(`Fatura ID: ${id} bulunamadı`);
    }
    
    return invoice;
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.findOneInvoice(id);
    
    if (updateInvoiceDto.customer_id) {
      const customer = await this.customerRepository.findOne({
        where: { id: updateInvoiceDto.customer_id },
      });
      
      if (!customer) {
        throw new NotFoundException(`Müşteri ID: ${updateInvoiceDto.customer_id} bulunamadı`);
      }
      
      invoice.customer = customer;
    }
    
    this.invoiceRepository.merge(invoice, updateInvoiceDto);
    return this.invoiceRepository.save(invoice);
  }

  async removeInvoice(id: string) {
    const invoice = await this.findOneInvoice(id);
    return this.invoiceRepository.remove(invoice);
  }

  // Müşteri İşlemleri
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAllCustomers() {
    return this.customerRepository.find();
  }

  async findOneCustomer(id: string) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['invoices'],
    });
    
    if (!customer) {
      throw new NotFoundException(`Müşteri ID: ${id} bulunamadı`);
    }
    
    return customer;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOneCustomer(id);
    this.customerRepository.merge(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async removeCustomer(id: string) {
    const customer = await this.findOneCustomer(id);
    return this.customerRepository.remove(customer);
  }

  // Ödeme İşlemleri
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: createPaymentDto.invoice_id },
    });
    
    if (!invoice) {
      throw new NotFoundException(`Fatura ID: ${createPaymentDto.invoice_id} bulunamadı`);
    }
    
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      invoice,
    });
    
    return this.paymentRepository.save(payment);
  }

  async findAllPayments() {
    return this.paymentRepository.find({
      relations: ['invoice'],
      order: { payment_date: 'DESC' },
    });
  }

  async findInvoicePayments(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });
    
    if (!invoice) {
      throw new NotFoundException(`Fatura ID: ${invoiceId} bulunamadı`);
    }
    
    return this.paymentRepository.find({
      where: { invoice: { id: invoiceId } },
      order: { payment_date: 'DESC' },
    });
  }

  // Rapor İşlemleri
  async getMonthlyIncome() {
    // Aylık gelir raporları
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const invoices = await this.invoiceRepository.find({
      where: {
        invoice_date: startOfMonth,
      },
      relations: ['payments'],
    });
    
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const totalPaid = invoices.reduce((sum, invoice) => 
      sum + invoice.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0);
    
    return {
      month: currentDate.toLocaleString('default', { month: 'long' }),
      year: currentDate.getFullYear(),
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      remaining: totalInvoiced - totalPaid,
    };
  }

  async getReceivablesSummary() {
    // Alacak durumu özeti
    const invoices = await this.invoiceRepository.find({
      relations: ['payments', 'customer'],
    });
    
    const receivables = invoices.map(invoice => {
      const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remaining = invoice.total_amount - totalPaid;
      
      return {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customer.name,
        total_amount: invoice.total_amount,
        total_paid: totalPaid,
        remaining: remaining,
        due_date: invoice.due_date,
        status: remaining <= 0 ? 'paid' : new Date() > invoice.due_date ? 'overdue' : 'pending',
      };
    });
    
    return receivables;
  }

  async getCustomerSalesAnalysis() {
    // Müşteri bazlı satış analizi
    const customers = await this.customerRepository.find({
      relations: ['invoices'],
    });
    
    const analysis = customers.map(customer => {
      const totalInvoiced = customer.invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
      const invoiceCount = customer.invoices.length;
      
      return {
        customer_id: customer.id,
        customer_name: customer.name,
        invoice_count: invoiceCount,
        total_amount: totalInvoiced,
        average_invoice: invoiceCount > 0 ? totalInvoiced / invoiceCount : 0,
      };
    });
    
    return analysis;
  }
}
