import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';

@Injectable()
export class ProductsService {
  @InjectModel(Product.name)
  private productModel: SoftDeleteModel<ProductDocument>;
  async create(createProductDto: CreateProductDto, user: IUser) {
    const product = await this.productModel.create({
      ...createProductDto,
      createdBy: {
        _id: new mongoose.Types.ObjectId(user._id),
        email: user.email,
      },
    });
    return {
      _id: product._id,
      createdAt: product.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qsUrl: string) {
    const { filter } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.productModel
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(defaultLimit)
      .populate([{ path: 'categories', select: { name: 1, _id: 0 } }]);
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
    return this.productModel
      .findOne({
        _id: id,
      })
      .populate([{ path: 'categories', select: { name: 1, _id: 0 } }]);
  }

  update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    return this.productModel.updateOne(
      {
        _id: id,
      },
      {
        ...updateProductDto,
        updatedBy: {
          _id: new mongoose.Types.ObjectId(user._id),
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid');
    }
    await this.productModel.updateOne(
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
    return this.productModel.softDelete({ _id: id });
  }
}
