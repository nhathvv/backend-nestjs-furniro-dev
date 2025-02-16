import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ConfigService } from '@nestjs/config';
import { genSaltSync, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { AuthResponses } from 'src/auth/auth.responses';
import { BanDuration, UserVerifyStatus } from 'src/constants/enum';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
@Injectable()
export class UsersService {
  @InjectModel(User.name)
  private userModel: SoftDeleteModel<UserDocument>;
  constructor(private mailService: MailService) {}
  async create(
    createUserDto: CreateUserDto,
  ): Promise<AuthResponses['RegisterResponse']> {
    const isEmailExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isEmailExist) {
      throw new BadRequestException('Email already exist');
    }
    const isUsernameExist = await this.userModel.findOne({
      username: createUserDto.username,
    });
    if (isUsernameExist) {
      throw new BadRequestException('Username already exist');
    }
    await this.mailService.sendEmailVerify(
      createUserDto,
      createUserDto.email_verify_token,
    );
    const result = await this.userModel.create({
      ...createUserDto,
      password: this.hashPassword(createUserDto.password),
    });

    return {
      _id: result._id,
      createdAt: result.createdAt,
    };
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findOneByRefreshToken(refresh_token: string) {
    return this.userModel.findOne({ refresh_token });
  }

  async verifyEmail(email_verify_token: string) {
    const user = await this.userModel.findOne({ email_verify_token });
    if (!user) {
      throw new BadRequestException('Email verify token is invalid');
    }
    return await this.userModel.updateOne(
      { email_verify_token },
      { email_verify_token: '', verified: UserVerifyStatus.Verified },
    );
  }
  async resetPassword(forgot_password_token: string, password: string) {
    const user = await this.userModel.findOne({ forgot_password_token });
    if (!user) {
      throw new BadRequestException('Forgot password token is invalid');
    }
    return await this.userModel.updateOne(
      { forgot_password_token },
      { forgot_password_token: '', password: this.hashPassword(password) },
    );
  }

  isValidPassword(password: string, hash: string) {
    return hashSync(password, hash) || false;
  }

  async forgotPassword(email: string, forgot_password_token: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email not found');
    }
    await this.userModel.updateOne({ email }, { forgot_password_token });
    return this.mailService.sendEmailForgotPassword(
      user,
      forgot_password_token,
    );
  }

  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  async findAll(currentPage: number, limit: number, qsUrl: string) {
    const { filter } = aqp(qsUrl);
    let { sort }: { sort: any } = aqp(qsUrl);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    if (isEmpty(sort)) {
      sort = '-updatedAt';
    }
    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .select(
        '-password -refresh_token -email_verify_token -forgot_password_token',
      )
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
    return this.userModel
      .findById(id)
      .select(
        '-password -refresh_token -email_verify_token -forgot_password_token',
      );
  }

  update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    return this.userModel.updateOne(
      {
        _id: id,
      },
      {
        ...updateUserDto,
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
    await this.userModel.updateOne(
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
    return this.userModel.softDelete({ _id: id });
  }
  updateRefreshToken(_id: string, refresh_token: string) {
    return this.userModel.updateOne({ _id }, { refresh_token });
  }
  async banUser(userId: string, reason: string, duration: BanDuration) {
    const banStartDate = new Date();
    const banEndDate = new Date(banStartDate.getTime() + BanDuration[duration]);
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          verified: UserVerifyStatus.Banned,
          banReason: reason,
          banStartDate,
          banEndDate,
          banDuration: BanDuration[duration],
        },
        { new: true },
      )
      .select(
        '-password -refresh_token -email_verify_token -forgot_password_token',
      );
  }

  async getRemainingBanTime(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user?.banEndDate) return 0;

    return Math.max(0, user.banEndDate.getTime() - Date.now());
  }

  async handleAutoUnban() {
    const now = new Date();
    await this.userModel.updateMany(
      {
        verified: UserVerifyStatus.Banned,
        banEndDate: { $lte: now },
      },
      {
        verified: UserVerifyStatus.Verified,
        banReason: null,
        banStartDate: null,
        banEndDate: null,
        banDuration: null,
      },
    );
  }
  async unbanUser(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          verified: UserVerifyStatus.Verified,
          banReason: null,
          banStartDate: null,
          banEndDate: null,
          banDuration: null,
        },
        { new: true },
      )
      .select(
        '-password -refresh_token -email_verify_token -forgot_password_token',
      );
  }
}
