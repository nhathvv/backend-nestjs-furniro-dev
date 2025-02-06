import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  Category,
  CategoryDocument,
} from 'src/categories/schemas/category.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CategoryResponse } from 'src/categories/categories.response';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';

@Injectable()
export class CategoriesService {
  @InjectModel(Category.name)
  private categoryModel: SoftDeleteModel<CategoryDocument>;
  async create(
    createCategoryDto: CreateCategoryDto,
    user: IUser,
  ): Promise<CategoryResponse['CreateCategoryResponse']> {
    console.log(user);
    const result = await this.categoryModel.create({
      ...createCategoryDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: result._id,
      name: result.name,
      description: result.description,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
      createdAt: result.createdAt,
    };
  }
  async findAll(currentPage: number, limit: number, qsUrl: string) {
    const { filter } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.categoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.categoryModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    return this.categoryModel.find({ _id: id });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto, user: IUser) {
    return this.categoryModel.updateOne(
      { _id: id },
      {
        ...updateCategoryDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Id is invalid');
    }
    await this.categoryModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
      },
    );
    return this.categoryModel.softDelete({
      _id: id,
    });
  }
}
