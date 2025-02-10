import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IUser } from 'src/users/users.interface';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponeMessage('Product created successfully')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        product_name: {
          type: 'string',
          example: 'Product 1',
        },
        product_description: {
          type: 'number',
          example: 10000,
        },
        categories: {
          type: 'string',
          example: '67a4c65773d28c20f69f67a0',
        },
        size: {
          type: 'number',
          example: 1,
        },
        color: {
          type: 'string',
          example: 'FFF2F2',
        },
        brand: {
          type: 'string',
          example: 'Brand 1',
        },
        thumbnail: {
          type: 'string',
          example: 'https://image.com/image.jpg',
        },
        quantity: {
          type: 'number',
          example: 100,
        },
        original_price: {
          type: 'number',
          example: 10000,
        },
        discount: {
          type: 'number',
          example: 10,
        },
        status: {
          type: 'number',
          example: 0,
        },
      },
    },
  })
  @ApiBearerAuth('access-token')
  create(@Body() createProductDto: CreateProductDto, @User() user: IUser) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Public()
  @ResponeMessage('Fetch all products by pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query('qsUrl') qsUrl: string,
  ) {
    return this.productsService.findAll(+currentPage, +limit, qsUrl);
  }

  @Get(':id')
  @Public()
  @ResponeMessage("Get product's detail")
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ResponeMessage('Product updated successfully')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: IUser,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @ResponeMessage('Product deleted successfully')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.productsService.remove(id, user);
  }
}
