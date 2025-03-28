import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ProductsService } from '../services/products.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('admin', 'user')
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get('search')
  @Roles('admin', 'user')
  findByCriteria(@Query() criteria: any): Promise<Product[]> {
    return this.productsService.findByCriteria(criteria);
  }

  @Get('categories')
  @Roles('admin', 'user')
  getCategories(): Promise<string[]> {
    return this.productsService.getCategories();
  }

  @Get('low-stock')
  @Roles('admin', 'user')
  getLowStockProducts(): Promise<Product[]> {
    return this.productsService.getLowStockProducts();
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Get('code/:code')
  @Roles('admin', 'user')
  findByCode(@Param('code') code: string): Promise<Product> {
    return this.productsService.findByCode(code);
  }

  @Post()
  @Roles('admin')
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
