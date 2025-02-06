import { Types } from 'mongoose';
export interface CategoryResponse {
  CreateCategoryResponse: {
    _id: Types.ObjectId;
    name: string;
    description: string;
    createdBy: {
      _id: Types.ObjectId;
      email: string;
    };
    createdAt: Date;
  };
}
