import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'johndoe', description: 'User username' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Company Ltd.', description: 'User company information' })
  @IsOptional()
  @IsString()
  companyInfo?: string;
}
