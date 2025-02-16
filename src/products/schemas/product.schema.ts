import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProductSize, ProductStatus } from 'src/constants/enum';

export type ProductDocument = HydratedDocument<Product>;
@Schema({ timestamps: true })
export class Product {
  @Prop()
  product_name: string;

  @Prop()
  product_description: string;

  @Prop()
  size?: ProductSize;

  @Prop()
  original_price: number;

  @Prop()
  discount: number;

  @Prop()
  thumbnail: string;

  @Prop({ default: [] })
  images?: string[];

  @Prop()
  status: ProductStatus;

  @Prop()
  quantity: number;

  @Prop()
  brand: string;

  @Prop()
  color?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  categories: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
