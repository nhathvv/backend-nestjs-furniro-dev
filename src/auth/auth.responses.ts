import { Types } from "mongoose";

export interface AuthResponses {
  LoginResponse: {
    access_token: string;
    user: {
      _id: Types.ObjectId;
      email: string;
      username: string;
      avatar: string;
      role: string;
    }
    refresh_token: string;
  },
  RegisterResponse: {
    _id: Types.ObjectId;
    createdAt: Date;
  },
  GetAccountResponse: {
    user: {
      _id: Types.ObjectId;
      email: string;
      username: string;
    }
  },
  GetNewAccessTokenResonse: {
    access_token: string;
    refresh_token: string;
    user: {
      _id: Types.ObjectId;
      email: string;
      username: string;
      avatar: string;
      role: string;
    }
  }

}