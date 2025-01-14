import { Types } from "mongoose";


export interface IUser {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  verified?: number;
  avatar?: string;
  role?: string
}