import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { StockMovementsService } from './stock-movements.service';
import { MovementType } from '../entities/stock-movement.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private stockMovementsService: StockMovementsService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Ürün #${id} bulunamadı`);
    }
    return product;
  }

  async findByCode(code: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { code } });
    if (!product) {
      throw new NotFoundException(`${code} kodlu ürün bulunamadı`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Ürün kodu benzersiz olmalı
    const existingProduct = await this.productRepository.findOne({
      where: { code: createProductDto.code },
    });
    
    if (existingProduct) {
      throw new ConflictException(`${createProductDto.code} kodlu ürün zaten mevcut`);
    }
    
    const product = this.productRepository.create({
      ...createProductDto,
      currentStock: 0,
    });
    
    const savedProduct = await this.productRepository.save(product);
    
    // Başlangıç stoku varsa stok hareketi oluştur
    if (createProductDto.initialStock && createProductDto.initialStock > 0) {
      await this.stockMovementsService.create({
        productId: savedProduct.id,
        movementType: MovementType.INITIAL,
        quantity: createProductDto.initialStock,
        notes: 'Başlangıç stoku',
        unitPrice: createProductDto.purchasePrice,
      });
      
      // Ürünün stok miktarını güncelle
      savedProduct.currentStock = createProductDto.initialStock;
      await this.productRepository.save(savedProduct);
    }
    
    return savedProduct;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Ürünü bul
    const product = await this.findOne(id);
    
    // Ürün kodu değişiyorsa benzersiz olmalı
    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existingProduct = await this.productRepository.findOne({
        where: { code: updateProductDto.code },
      });
      
      if (existingProduct) {
        throw new ConflictException(`${updateProductDto.code} kodlu başka bir ürün zaten mevcut`);
      }
    }
    
    // Değişiklikleri uygula
    Object.assign(product, updateProductDto);
    
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ürün #${id} bulunamadı`);
    }
  }

  async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);
    product.currentStock += quantity;
    return this.productRepository.save(product);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.currentStock <= product.minimumStockLevel')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findByCriteria(criteria: any): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    if (criteria.name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${criteria.name}%` });
    }
    
    if (criteria.code) {
      queryBuilder.andWhere('product.code LIKE :code', { code: `%${criteria.code}%` });
    }
    
    if (criteria.category) {
      queryBuilder.andWhere('product.category = :category', { category: criteria.category });
    }
    
    if (criteria.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: criteria.isActive });
    }
    
    return queryBuilder.getMany();
  }

  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category')
      .where('product.category IS NOT NULL')
      .getRawMany();
    
    return result.map(r => r.category).filter(c => c);
  }
}
