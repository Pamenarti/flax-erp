import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../backend/src/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Fatura Endpointleri
  @ApiOperation({ summary: 'Yeni fatura oluştur' })
  @ApiResponse({ status: 201, description: 'Fatura başarıyla oluşturuldu' })
  @Post('invoices')
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.financeService.createInvoice(createInvoiceDto);
  }

  @ApiOperation({ summary: 'Tüm faturaları getir' })
  @ApiResponse({ status: 200, description: 'Faturalar listelendi' })
  @Get('invoices')
  findAllInvoices(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    return this.financeService.findAllInvoices(+page, +limit, search);
  }

  @ApiOperation({ summary: 'Belirli bir faturayı getir' })
  @ApiResponse({ status: 200, description: 'Fatura bulundu' })
  @ApiResponse({ status: 404, description: 'Fatura bulunamadı' })
  @Get('invoices/:id')
  findOneInvoice(@Param('id') id: string) {
    return this.financeService.findOneInvoice(id);
  }

  @ApiOperation({ summary: 'Fatura güncelle' })
  @ApiResponse({ status: 200, description: 'Fatura güncellendi' })
  @ApiResponse({ status: 404, description: 'Fatura bulunamadı' })
  @Put('invoices/:id')
  updateInvoice(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.financeService.updateInvoice(id, updateInvoiceDto);
  }

  @ApiOperation({ summary: 'Fatura sil' })
  @ApiResponse({ status: 200, description: 'Fatura silindi' })
  @ApiResponse({ status: 404, description: 'Fatura bulunamadı' })
  @Delete('invoices/:id')
  removeInvoice(@Param('id') id: string) {
    return this.financeService.removeInvoice(id);
  }

  // Müşteri Endpointleri
  @ApiOperation({ summary: 'Yeni müşteri oluştur' })
  @ApiResponse({ status: 201, description: 'Müşteri başarıyla oluşturuldu' })
  @Post('customers')
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.financeService.createCustomer(createCustomerDto);
  }

  @ApiOperation({ summary: 'Tüm müşterileri getir' })
  @ApiResponse({ status: 200, description: 'Müşteriler listelendi' })
  @Get('customers')
  findAllCustomers() {
    return this.financeService.findAllCustomers();
  }

  @ApiOperation({ summary: 'Belirli bir müşteriyi getir' })
  @ApiResponse({ status: 200, description: 'Müşteri bulundu' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  @Get('customers/:id')
  findOneCustomer(@Param('id') id: string) {
    return this.financeService.findOneCustomer(id);
  }

  @ApiOperation({ summary: 'Müşteri güncelle' })
  @ApiResponse({ status: 200, description: 'Müşteri güncellendi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  @Put('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.financeService.updateCustomer(id, updateCustomerDto);
  }

  @ApiOperation({ summary: 'Müşteri sil' })
  @ApiResponse({ status: 200, description: 'Müşteri silindi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  @Delete('customers/:id')
  removeCustomer(@Param('id') id: string) {
    return this.financeService.removeCustomer(id);
  }

  // Ödeme Endpointleri
  @ApiOperation({ summary: 'Yeni ödeme oluştur' })
  @ApiResponse({ status: 201, description: 'Ödeme başarıyla oluşturuldu' })
  @Post('payments')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.financeService.createPayment(createPaymentDto);
  }

  @ApiOperation({ summary: 'Tüm ödemeleri getir' })
  @ApiResponse({ status: 200, description: 'Ödemeler listelendi' })
  @Get('payments')
  findAllPayments() {
    return this.financeService.findAllPayments();
  }

  @ApiOperation({ summary: 'Bir faturanın ödemelerini getir' })
  @ApiResponse({ status: 200, description: 'Fatura ödemeleri listelendi' })
  @Get('invoices/:id/payments')
  findInvoicePayments(@Param('id') id: string) {
    return this.financeService.findInvoicePayments(id);
  }

  // Rapor Endpointleri
  @ApiOperation({ summary: 'Aylık gelir özeti' })
  @ApiResponse({ status: 200, description: 'Gelir özeti oluşturuldu' })
  @Get('reports/monthly-income')
  getMonthlyIncome() {
    return this.financeService.getMonthlyIncome();
  }

  @ApiOperation({ summary: 'Alacak durumu özeti' })
  @ApiResponse({ status: 200, description: 'Alacak durumu özeti oluşturuldu' })
  @Get('reports/receivables')
  getReceivablesSummary() {
    return this.financeService.getReceivablesSummary();
  }

  @ApiOperation({ summary: 'Müşteri bazlı satış analizi' })
  @ApiResponse({ status: 200, description: 'Müşteri satış analizi oluşturuldu' })
  @Get('reports/customer-sales')
  getCustomerSalesAnalysis() {
    return this.financeService.getCustomerSalesAnalysis();
  }
}
