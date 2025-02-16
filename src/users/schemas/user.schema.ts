import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BanDuration, UserVerifyStatus } from 'src/constants/enum';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ default: '' })
  company_name: string; //optional

  @Prop({ default: '' })
  region: string; //optional

  @Prop({ default: '' })
  street_address: string; //optional

  @Prop({ default: '' })
  city: string; //optional

  @Prop({ default: '' })
  province: string; //optional

  @Prop({ default: '' })
  zip_code: string; //optional

  @Prop({ default: '' })
  phone: string; //optional

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: 'CUSTOMER' })
  role: string;

  @Prop({ default: '' })
  email_verify_token: string;

  @Prop()
  username: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  forgot_password_token: string;

  @Prop({ type: 'number', enum: UserVerifyStatus, default: 0 })
  verified: UserVerifyStatus;

  @Prop({ default: '' })
  refresh_token: string;

  @Prop()
  deletedAt: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deleted: boolean;

  @Prop({ default: null })
  banReason: string;

  @Prop({ default: null })
  banStartDate: Date;

  @Prop({ default: null })
  banEndDate: Date; // Thêm trường thời gian hết hạn ban

  @Prop({ enum: BanDuration, default: null })
  banDuration: BanDuration;
}
export const UserSchema = SchemaFactory.createForClass(User);
