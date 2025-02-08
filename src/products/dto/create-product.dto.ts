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
  product_name: string;

  @IsNotEmpty()
  @IsString()
  product_description: string;

  @IsMongoId()
  categories: string;

  @IsEnum(ProductSize)
  size: string;

  @IsString()
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
  status: string;
}
