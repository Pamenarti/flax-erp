import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, MovementType } from '../entities/stock-movement.entity';
import { Product } from '../entities/product.entity';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      relations: ['product'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<StockMovement> {
    const movement = await this.stockMovementRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    
    if (!movement) {
      throw new NotFoundException(`Stok hareketi #${id} bulunamadı`);
    }
    
    return movement;
  }

  async findByProduct(productId: string): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: { productId },
      relations: ['product'],
      order: { date: 'DESC' },
    });
  }

  async create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    // Ürünü kontrol et
    const product = await this.productRepository.findOne({
      where: { id: createStockMovementDto.productId },
    });
    
    if (!product) {
      throw new NotFoundException(`Ürün #${createStockMovementDto.productId} bulunamadı`);
    }
    
    // Hareket tipine göre miktar işareti kontrol et (stok giriş/çıkış)
    let quantity = createStockMovementDto.quantity;
    let stockUpdateQuantity = quantity;
    
    // Stoktan çıkış hareketleri için miktarı negatif yapalım (DB'de pozitif değer saklayalım)
    if (createStockMovementDto.movementType === MovementType.SALE ||
        createStockMovementDto.movementType === MovementType.TRANSFER) {
      if (quantity > 0) {
        quantity = -quantity; // Görüntü için kullanalım, db'ye pozitif kaydedelim
      }
      stockUpdateQuantity = -Math.abs(stockUpdateQuantity); // Stok güncellemesi için her zaman negatif yapalım
    }
    
    // StockMovement objesi oluştur
    const stockMovement = this.stockMovementRepository.create({
      ...createStockMovementDto,
      quantity: Math.abs(quantity), // DB'de her zaman pozitif değer sakla
    });
    
    // Stok miktarını güncelle
    product.currentStock += stockUpdateQuantity;
    await this.productRepository.save(product);
    
    // Stok hareketini kaydet
    return this.stockMovementRepository.save(stockMovement);
  }

  async update(id: string, updateStockMovementDto: UpdateStockMovementDto): Promise<StockMovement> {
    // Mevcut kaydı bul
    const existingMovement = await this.findOne(id);
    
    // Eğer miktar değişiyorsa, ürün stok miktarını da güncelle
    if (updateStockMovementDto.quantity !== undefined && 
        updateStockMovementDto.quantity !== existingMovement.quantity) {
      
      const product = await this.productRepository.findOne({
        where: { id: existingMovement.productId },
      });
      
      if (!product) {
        throw new NotFoundException(`Ürün #${existingMovement.productId} bulunamadı`);
      }
      
      // Eski miktarın stok üzerindeki etkisini geri al
      let oldEffect = existingMovement.quantity;
      if (existingMovement.movementType === MovementType.SALE ||
          existingMovement.movementType === MovementType.TRANSFER) {
        oldEffect = -oldEffect;
      }
      
      // Yeni miktarın etkisini hesapla
      let newEffect = updateStockMovementDto.quantity;
      if (existingMovement.movementType === MovementType.SALE ||
          existingMovement.movementType === MovementType.TRANSFER) {
        newEffect = -newEffect;
      }
      
      // Stok miktarını güncelle
      product.currentStock = product.currentStock - oldEffect + newEffect;
      await this.productRepository.save(product);
    }
    
    // StockMovement kaydını güncelle
    Object.assign(existingMovement, updateStockMovementDto);
    return this.stockMovementRepository.save(existingMovement);
  }

  async remove(id: string): Promise<void> {
    // Mevcut kaydı bul
    const existingMovement = await this.findOne(id);
    
    // Hareketin stok miktarı üzerindeki etkisini geri al
    const product = await this.productRepository.findOne({
      where: { id: existingMovement.productId },
    });
    
    if (product) {
      let effect = existingMovement.quantity;
      if (existingMovement.movementType === MovementType.SALE ||
          existingMovement.movementType === MovementType.TRANSFER) {
        effect = -effect;
      }
      
      // Stok miktarını güncelle
      product.currentStock -= effect;
      await this.productRepository.save(product);
    }
    
    // Stok hareketini sil
    const result = await this.stockMovementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stok hareketi #${id} bulunamadı`);
    }
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    return this.stockMovementRepository
      .createQueryBuilder('stockMovement')
      .leftJoinAndSelect('stockMovement.product', 'product')
      .where('stockMovement.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('stockMovement.date', 'DESC')
      .getMany();
  }

  async getBatchHistoryByProductId(productId: string): Promise<any[]> {
    const movements = await this.findByProduct(productId);
    
    // Gruplandırma ve özet bilgileri hesaplama
    const batchSummary = movements.reduce((acc, movement) => {
      const batchKey = movement.documentNumber || 'Belge Numarası Yok';
      
      if (!acc[batchKey]) {
        acc[batchKey] = {
          documentNumber: batchKey,
          date: movement.date,
          totalQuantity: 0,
          totalValue: 0,
          movements: [],
        };
      }
      
      const quantity = movement.movementType === MovementType.SALE || 
                       movement.movementType === MovementType.TRANSFER ? 
                       -movement.quantity : movement.quantity;
      
      acc[batchKey].totalQuantity += quantity;
      acc[batchKey].totalValue += quantity * (movement.unitPrice || 0);
      acc[batchKey].movements.push(movement);
      
      return acc;
    }, {});
    
    return Object.values(batchSummary);
  }
}
