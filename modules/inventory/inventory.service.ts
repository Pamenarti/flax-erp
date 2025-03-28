import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { Warehouse } from './entities/warehouse.entity';
import { StockLevel } from './entities/stock-level.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
  ) {}

  // Ürün İşlemleri
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...productData } = createProductDto;

    // Kategori doğrulama
    let category = null;
    if (categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`Kategori ID ${categoryId} bulunamadı`);
      }
    }

    // Ürün oluşturma
    const product = this.productRepository.create({
      ...productData,
      category
    });

    // Ürünü kaydet
    const savedProduct = await this.productRepository.save(product);

    // İlk stok seviyelerini oluştur
    const warehouses = await this.warehouseRepository.find();
    for (const warehouse of warehouses) {
      await this.stockLevelRepository.save({
        product: savedProduct,
        warehouse,
        quantity: 0
      });
    }

    return savedProduct;
  }

  async findAllProducts(
    page: number = 1, 
    limit: number = 10, 
    search: string = '',
    categoryId?: string
  ) {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.stockLevels', 'stockLevels')
      .leftJoinAndSelect('stockLevels.warehouse', 'warehouse');

    // Arama
    if (search) {
      queryBuilder.where(
        'product.name LIKE :search OR product.sku LIKE :search OR product.description LIKE :search',
        { search: `%${search}%` }
      );
    }

    // Kategori filtreleme
    if (categoryId) {
      queryBuilder.andWhere('product.category.id = :categoryId', { categoryId });
    }

    // Sayfalama
    queryBuilder.skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.createdAt', 'DESC');

    const [products, total] = await queryBuilder.getManyAndCount();

    // Toplam stok hesaplama
    for (const product of products) {
      product['totalStock'] = product.stockLevels.reduce((sum, level) => sum + level.quantity, 0);
    }

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOneProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'stockLevels', 'stockLevels.warehouse']
    });

    if (!product) {
      throw new NotFoundException(`Ürün ID ${id} bulunamadı`);
    }

    // Toplam stok hesaplama
    product['totalStock'] = product.stockLevels.reduce((sum, level) => sum + level.quantity, 0);

    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const { categoryId, ...productData } = updateProductDto;
    
    const product = await this.findOneProduct(id);
    
    // Kategori güncelleme
    if (categoryId !== undefined) {
      if (categoryId === null) {
        product.category = null;
      } else {
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
          throw new NotFoundException(`Kategori ID ${categoryId} bulunamadı`);
        }
        product.category = category;
      }
    }
    
    // Diğer alanları güncelle
    Object.assign(product, productData);
    
    return this.productRepository.save(product);
  }

  async removeProduct(id: string): Promise<void> {
    const product = await this.findOneProduct(id);
    await this.productRepository.remove(product);
  }

  // Kategori İşlemleri
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { parentId, ...categoryData } = createCategoryDto;
    
    // Üst kategori kontrolü
    let parent = null;
    if (parentId) {
      parent = await this.categoryRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Üst kategori ID ${parentId} bulunamadı`);
      }
    }
    
    const category = this.categoryRepository.create({
      ...categoryData,
      parent
    });
    
    return this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' }
    });
  }

  async findOneCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products']
    });
    
    if (!category) {
      throw new NotFoundException(`Kategori ID ${id} bulunamadı`);
    }
    
    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const { parentId, ...categoryData } = updateCategoryDto;
    
    const category = await this.findOneCategory(id);
    
    // Üst kategori güncelleme
    if (parentId !== undefined) {
      if (parentId === null) {
        category.parent = null;
      } else {
        // Kendisini kendi üst kategorisi olarak atama kontrolü
        if (parentId === id) {
          throw new BadRequestException('Bir kategori kendisini üst kategori olarak atayamaz');
        }
        
        const parent = await this.categoryRepository.findOne({ where: { id: parentId } });
        if (!parent) {
          throw new NotFoundException(`Üst kategori ID ${parentId} bulunamadı`);
        }
        
        // Döngü kontrolü (bir kategori kendi alt kategorisini üst kategori olarak atayamaz)
        const isSubcategory = await this.isSubcategory(id, parentId);
        if (isSubcategory) {
          throw new BadRequestException('Bir kategori kendi alt kategorisini üst kategori olarak atayamaz');
        }
        
        category.parent = parent;
      }
    }
    
    // Diğer alanları güncelle
    Object.assign(category, categoryData);
    
    return this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);
    
    // Kategori altında ürün ve alt kategori kontrolü
    if (category.products && category.products.length > 0) {
      throw new BadRequestException('Bu kategori altında ürünler var. Önce ürünleri başka kategoriye taşıyın veya silin.');
    }
    
    if (category.children && category.children.length > 0) {
      throw new BadRequestException('Bu kategori altında alt kategoriler var. Önce alt kategorileri başka kategoriye taşıyın veya silin.');
    }
    
    await this.categoryRepository.remove(category);
  }

  // Stok Hareketi İşlemleri
  async createStockMovement(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    const { productId, warehouseId, ...movementData } = createStockMovementDto;
    
    // Ürün kontrolü
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Ürün ID ${productId} bulunamadı`);
    }
    
    // Depo kontrolü
    const warehouse = await this.warehouseRepository.findOne({ where: { id: warehouseId } });
    if (!warehouse) {
      throw new NotFoundException(`Depo ID ${warehouseId} bulunamadı`);
    }
    
    // Stok hareketi oluştur
    const stockMovement = this.stockMovementRepository.create({
      ...movementData,
      product,
      warehouse
    });
    
    // Stok hareketi kaydet
    const savedMovement = await this.stockMovementRepository.save(stockMovement);
    
    // Stok seviyesini güncelle
    await this.updateStockLevel(productId, warehouseId, movementData.quantity, movementData.type);
    
    return savedMovement;
  }

  async findAllStockMovements(
    page: number = 1, 
    limit: number = 10,
    dateFrom?: Date,
    dateTo?: Date,
    productId?: string,
    warehouseId?: string,
    type?: string
  ) {
    const queryBuilder = this.stockMovementRepository.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.warehouse', 'warehouse');
    
    // Filtreler
    if (dateFrom && dateTo) {
      queryBuilder.andWhere('movement.date BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
    }
    
    if (productId) {
      queryBuilder.andWhere('product.id = :productId', { productId });
    }
    
    if (warehouseId) {
      queryBuilder.andWhere('warehouse.id = :warehouseId', { warehouseId });
    }
    
    if (type) {
      queryBuilder.andWhere('movement.type = :type', { type });
    }
    
    // Sayfalama ve sıralama
    queryBuilder.skip((page - 1) * limit)
      .take(limit)
      .orderBy('movement.date', 'DESC');
    
    const [movements, total] = await queryBuilder.getManyAndCount();
    
    return {
      data: movements,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Depo İşlemleri
  async createWarehouse(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    
    // Bu depo için tüm ürünlere stok seviyesi oluştur
    const products = await this.productRepository.find();
    for (const product of products) {
      await this.stockLevelRepository.save({
        product,
        warehouse: savedWarehouse,
        quantity: 0
      });
    }
    
    return savedWarehouse;
  }

  async findAllWarehouses(): Promise<Warehouse[]> {
    return this.warehouseRepository.find();
  }

  // Stok Seviyesi İşlemleri
  async getStockLevels(productId: string): Promise<StockLevel[]> {
    return this.stockLevelRepository.find({
      where: { product: { id: productId } },
      relations: ['warehouse']
    });
  }

  async getStockByWarehouse(warehouseId: string, page: number = 1, limit: number = 10) {
    const [stockLevels, total] = await this.stockLevelRepository.findAndCount({
      where: { warehouse: { id: warehouseId } },
      relations: ['product', 'warehouse'],
      skip: (page - 1) * limit,
      take: limit
    });
    
    return {
      data: stockLevels,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getLowStockProducts() {
    const products = await this.productRepository.find({
      relations: ['stockLevels']
    });
    
    const lowStockProducts = products.filter(product => {
      const totalStock = product.stockLevels.reduce((sum, level) => sum + level.quantity, 0);
      return totalStock < product.minStockLevel;
    });
    
    return lowStockProducts;
  }

  // Yardımcı Metodlar
  private async isSubcategory(parentId: string, childId: string): Promise<boolean> {
    const child = await this.categoryRepository.findOne({
      where: { id: childId },
      relations: ['children']
    });
    
    if (!child || !child.children || child.children.length === 0) {
      return false;
    }
    
    for (const subchild of child.children) {
      if (subchild.id === parentId) {
        return true;
      }
      
      const isSubSub = await this.isSubcategory(parentId, subchild.id);
      if (isSubSub) {
        return true;
      }
    }
    
    return false;
  }

  private async updateStockLevel(productId: string, warehouseId: string, quantity: number, type: string): Promise<void> {
    // Stok seviyesini bul
    let stockLevel = await this.stockLevelRepository.findOne({
      where: {
        product: { id: productId },
        warehouse: { id: warehouseId }
      }
    });
    
    // Eğer stok seviyesi yoksa oluştur
    if (!stockLevel) {
      const product = await this.productRepository.findOne({ where: { id: productId } });
      const warehouse = await this.warehouseRepository.findOne({ where: { id: warehouseId } });
      
      stockLevel = this.stockLevelRepository.create({
        product,
        warehouse,
        quantity: 0
      });
    }
    
    // Stok seviyesini güncelle
    if (type === 'IN') {
      stockLevel.quantity += quantity;
    } else if (type === 'OUT') {
      if (stockLevel.quantity < quantity) {
        throw new BadRequestException('Yeterli stok yok');
      }
      stockLevel.quantity -= quantity;
    } else if (type === 'ADJUSTMENT') {
      stockLevel.quantity = quantity;
    }
    
    await this.stockLevelRepository.save(stockLevel);
  }
}
