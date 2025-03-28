import { IsNotEmpty, IsNumber, IsString, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UseCreditsDto {
  @ApiProperty({ description: 'Kullanılacak kredi miktarı', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Kredinin kullanılacağı modül ID', example: 'abcd1234-5678-90ef-ghij-klmnopqrstuv' })
  @IsNotEmpty()
  @IsString()
  moduleId: string;

  @ApiProperty({ description: 'İşlem açıklaması', example: 'Finans Modülü satın alma', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
