import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}
export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ default: "" })
  company_name: string; //optional

  @Prop({ default: "" })
  region: string; //optional

  @Prop({ default: "" })
  street_address: string; //optional

  @Prop({ default: "" })
  city: string; //optional

  @Prop({ default: "" })
  province: string; //optional

  @Prop({ default: "" })
  zip_code: string; //optional

  @Prop({ default: "" })
  phone: string; //optional

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: "CUSTOMER" })
  role: string;

  @Prop({ default: "" })
  email_verify_token: string;

  @Prop()
  username: string;

  @Prop()
  forgot_password_token: string;

  @Prop({ type: 'number', enum: UserVerifyStatus, default: 0 })
  verified: UserVerifyStatus;

  @Prop({ default: "" })
  refresh_token: string;

  @Prop({ default: "" })
  deletedAt: Date;

  @Prop()
  createdAt?: Date

  @Prop()
  updatedAt?: Date

  @Prop()
  deleted: boolean;

}
export const UserSchema = SchemaFactory.createForClass(User);