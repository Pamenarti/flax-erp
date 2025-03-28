#!/bin/bash

MODULE_NAME=$1
MODULE_CODE=$2
MODULE_ROUTE=$3

if [ -z "$MODULE_NAME" ] || [ -z "$MODULE_CODE" ] || [ -z "$MODULE_ROUTE" ]; then
  echo "Usage: ./create-module-structure.sh \"Module Name\" module-code /route-path"
  exit 1
fi

MODULE_DIR="src/modules/$MODULE_CODE"

# Ana klasörü oluştur
mkdir -p $MODULE_DIR
mkdir -p $MODULE_DIR/controllers
mkdir -p $MODULE_DIR/services
mkdir -p $MODULE_DIR/entities
mkdir -p $MODULE_DIR/dto

# Module entity dosyası
cat > $MODULE_DIR/entities/$MODULE_CODE.entity.ts << EOF
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('${MODULE_CODE}')
export class ${MODULE_NAME//-/ /g} {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
  
  @Column({ nullable: true })
  description: string;
  
  @Column({ default: true })
  isActive: boolean;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
EOF

# DTO Dosyası
cat > $MODULE_DIR/dto/$MODULE_CODE.dto.ts << EOF
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class Create${MODULE_NAME//-/ /g}Dto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class Update${MODULE_NAME//-/ /g}Dto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
EOF

# Service Dosyası
cat > $MODULE_DIR/services/$MODULE_CODE.service.ts << EOF
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${MODULE_NAME//-/ /g} } from '../entities/$MODULE_CODE.entity';
import { Create${MODULE_NAME//-/ /g}Dto, Update${MODULE_NAME//-/ /g}Dto } from '../dto/$MODULE_CODE.dto';

@Injectable()
export class ${MODULE_NAME//-/ /g}Service {
  constructor(
    @InjectRepository(${MODULE_NAME//-/ /g})
    private ${MODULE_CODE}Repository: Repository<${MODULE_NAME//-/ /g}>,
  ) {}

  async findAll(): Promise<${MODULE_NAME//-/ /g}[]> {
    return this.${MODULE_CODE}Repository.find();
  }

  async findOne(id: string): Promise<${MODULE_NAME//-/ /g}> {
    const item = await this.${MODULE_CODE}Repository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(\`ID #\${id} bulunamadı\`);
    }
    return item;
  }

  async create(createDto: Create${MODULE_NAME//-/ /g}Dto): Promise<${MODULE_NAME//-/ /g}> {
    const newItem = this.${MODULE_CODE}Repository.create(createDto);
    return this.${MODULE_CODE}Repository.save(newItem);
  }

  async update(id: string, updateDto: Update${MODULE_NAME//-/ /g}Dto): Promise<${MODULE_NAME//-/ /g}> {
    const item = await this.findOne(id);
    
    Object.assign(item, updateDto);
    
    return this.${MODULE_CODE}Repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.${MODULE_CODE}Repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(\`ID #\${id} bulunamadı\`);
    }
  }
}
EOF

# Controller Dosyası
cat > $MODULE_DIR/controllers/$MODULE_CODE.controller.ts << EOF
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ${MODULE_NAME//-/ /g}Service } from '../services/$MODULE_CODE.service';
import { ${MODULE_NAME//-/ /g} } from '../entities/$MODULE_CODE.entity';
import { Create${MODULE_NAME//-/ /g}Dto, Update${MODULE_NAME//-/ /g}Dto } from '../dto/$MODULE_CODE.dto';

@Controller('${MODULE_ROUTE}')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ${MODULE_NAME//-/ /g}Controller {
  constructor(private readonly ${MODULE_CODE}Service: ${MODULE_NAME//-/ /g}Service) {}

  @Get()
  @Roles('admin', 'user')
  findAll(): Promise<${MODULE_NAME//-/ /g}[]> {
    return this.${MODULE_CODE}Service.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string): Promise<${MODULE_NAME//-/ /g}> {
    return this.${MODULE_CODE}Service.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() createDto: Create${MODULE_NAME//-/ /g}Dto): Promise<${MODULE_NAME//-/ /g}> {
    return this.${MODULE_CODE}Service.create(createDto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: Update${MODULE_NAME//-/ /g}Dto): Promise<${MODULE_NAME//-/ /g}> {
    return this.${MODULE_CODE}Service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.${MODULE_CODE}Service.remove(id);
  }
}
EOF

# Modül Dosyası
cat > $MODULE_DIR/$MODULE_CODE.module.ts << EOF
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${MODULE_NAME//-/ /g}Controller } from './controllers/$MODULE_CODE.controller';
import { ${MODULE_NAME//-/ /g}Service } from './services/$MODULE_CODE.service';
import { ${MODULE_NAME//-/ /g} } from './entities/$MODULE_CODE.entity';

@Module({
  imports: [TypeOrmModule.forFeature([${MODULE_NAME//-/ /g}])],
  controllers: [${MODULE_NAME//-/ /g}Controller],
  providers: [${MODULE_NAME//-/ /g}Service],
  exports: [${MODULE_NAME//-/ /g}Service],
})
export class ${MODULE_NAME//-/ /g}Module {}
EOF

echo "Modül yapısı oluşturuldu: $MODULE_DIR"
echo "Modülü sisteme entegre etmek için app.module.ts dosyasına import etmeyi unutmayınız."
