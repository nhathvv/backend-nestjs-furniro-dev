import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserVerifyStatus } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ConfigService } from '@nestjs/config';
import { genSaltSync, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class UsersService {
  @InjectModel(User.name)
  private userModel: SoftDeleteModel<UserDocument>;
  constructor(
    private configService: ConfigService,
    private mailService: MailService,

  ) { }
  async create(createUserDto: CreateUserDto) {
    const isEmailExist = await this.userModel.findOne({ email: createUserDto.email });
    if (isEmailExist) {
      throw new BadRequestException('Email already exist');
    }
    const isUsernameExist = await this.userModel.findOne({ username: createUserDto.username });
    if (isUsernameExist) {
      throw new BadRequestException('Username already exist');
    }
    await this.mailService.sendEmailVerify(createUserDto, createUserDto.email_verify_token);
    const result = await this.userModel.create({
      ...createUserDto,
      password: this.hashPassword(createUserDto.password)
    })

    return {
      _id: result._id,
      createdAt: result.createdAt,
    }
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ username })
  }
  findOneByEmail(email: string) {
    return this.userModel.findOne({ email })
  }
  async findOneByRefreshToken(refresh_token: string) {
    return this.userModel.findOne({ refresh_token });
  }
  async verifyEmail(email_verify_token: string) {
    const user = await this.userModel.findOne({ email_verify_token });
    if (!user) {
      throw new BadRequestException('Email verify token is invalid');
    }
    return await this.userModel.updateOne({ email_verify_token }, { email_verify_token: '', verified: UserVerifyStatus.Verified });
  }
  isValidPassword(password: string, hash: string) {
    return hashSync(password, hash)
  }
  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  updateRefreshToken(_id: string, refresh_token: string) {
    return this.userModel.updateOne({ _id }, { refresh_token });
  }
}
