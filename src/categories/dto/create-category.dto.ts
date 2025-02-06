import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Category 1' })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Description of category 1' })
  description: string;
}
