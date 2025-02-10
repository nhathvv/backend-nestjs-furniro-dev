import { Types } from 'mongoose';

export interface ProductResponse {
  CreateProductResponse: {
    _id: Types.ObjectId;
    createdAt: Date;
  };
}
