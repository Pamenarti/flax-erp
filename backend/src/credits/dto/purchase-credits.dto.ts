import { IsNotEmpty, IsNumber, IsString, IsPositive, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseCreditsDto {
  @ApiProperty({ description: 'Satın alınacak kredi miktarı', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Ödeme yöntemi', example: 'credit_card' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ 
    description: 'Ödeme detayları',
    example: {
      cardName: 'John Doe',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123'
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;
}
