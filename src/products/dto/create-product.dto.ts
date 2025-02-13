import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ProductSize, ProductStatus } from 'src/utils/enum';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Product 1' })
  product_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Description of product 1' })
  product_description: string;

  @IsMongoId()
  categories: string;

  @ApiProperty({ example: 0 })
  @IsEnum(ProductSize)
  size: string;

  @IsString()
  @ApiProperty({ example: 'FFF2F2' })
  color: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  original_price: number;

  @IsNumber()
  @Type(() => Number)
  discount?: number;

  @IsEnum(ProductStatus)
  @ApiProperty({ example: 'DRAFT' })
  status: string;
}
