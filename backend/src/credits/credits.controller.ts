import { Controller, Get, Post, Body, UseGuards, Req, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreditsService } from './credits.service';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';

@ApiTags('credits')
@Controller('credits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @ApiOperation({ summary: 'Kullanıcının mevcut kredilerini görüntüle' })
  @ApiResponse({ status: 200, description: 'Kredi bilgisi başarıyla alındı' })
  @Get()
  async getUserCredits(@Req() req) {
    return this.creditsService.getUserCredits(req.user.userId);
  }

  @ApiOperation({ summary: 'Kredi satın al' })
  @ApiResponse({ status: 201, description: 'Kredi başarıyla satın alındı' })
  @Post('purchase')
  async purchaseCredits(@Req() req, @Body() purchaseCreditsDto: PurchaseCreditsDto) {
    return this.creditsService.purchaseCredits(req.user.userId, purchaseCreditsDto);
  }

  @ApiOperation({ summary: 'Kredi kullan' })
  @ApiResponse({ status: 200, description: 'Kredi başarıyla kullanıldı' })
  @Post('use')
  async useCredits(@Req() req, @Body() useCreditsDto: UseCreditsDto) {
    return this.creditsService.useCredits(req.user.userId, useCreditsDto);
  }

  @ApiOperation({ summary: 'Kredi işlem geçmişini görüntüle' })
  @ApiResponse({ status: 200, description: 'İşlem geçmişi başarıyla alındı' })
  @Get('transactions')
  async getTransactionHistory(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.creditsService.getTransactionHistory(req.user.userId, page, limit);
  }

  @ApiOperation({ summary: 'Son kredi işlemini görüntüle' })
  @ApiResponse({ status: 200, description: 'Son işlem başarıyla alındı' })
  @Get('transactions/last')
  async getLastTransaction(@Req() req) {
    return this.creditsService.getLastTransaction(req.user.userId);
  }

  @ApiOperation({ summary: 'Kredi paketlerini listele' })
  @ApiResponse({ status: 200, description: 'Kredi paketleri başarıyla listelendi' })
  @Get('packages')
  async getCreditPackages() {
    return this.creditsService.getCreditPackages();
  }
}
