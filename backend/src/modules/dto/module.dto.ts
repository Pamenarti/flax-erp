import { IsNotEmpty, IsOptional, IsBoolean, IsArray, IsString, IsNumber } from 'class-validator';

export class CreateModuleDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isCore?: boolean = false;

  @IsOptional()
  @IsString()
  version?: string = '1.0.0';

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @IsNumber()
  order?: number = 100;

  @IsOptional()
  @IsArray()
  dependencies?: string[];

  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsArray()
  dependencies?: string[];

  @IsOptional()
  @IsString()
  category?: string;
}

export class ToggleModuleDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
