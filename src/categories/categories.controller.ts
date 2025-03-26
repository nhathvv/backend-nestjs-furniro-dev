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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { RESPONSE_MESSAGE } from 'src/constants/message';
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ResponeMessage(RESPONSE_MESSAGE.CREATE_CATEGORY_SUCCESS)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Category 1',
        },
        description: {
          type: 'string',
          example: 'Description of category 1',
        },
      },
    },
  })
  @ApiBearerAuth('access-token')
  create(@Body() createCategoryDto: CreateCategoryDto, @User() user: IUser) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Public()
  @Get()
  @ResponeMessage(RESPONSE_MESSAGE.GET_ALL_CATEGORIES_SUCCESS)
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qsUrl: string,
  ) {
    return this.categoriesService.findAll(+currentPage, +limit, qsUrl);
  }

  @Get(':id')
  @ResponeMessage(RESPONSE_MESSAGE.GET_CATEGORY_BY_ID_SUCCESS)
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ResponeMessage(RESPONSE_MESSAGE.UPDATE_CATEGORY_SUCCESS)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: IUser,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @ResponeMessage(RESPONSE_MESSAGE.DELETE_CATEGORY_SUCCESS)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.categoriesService.remove(id, user);
  }
}
