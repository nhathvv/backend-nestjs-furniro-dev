import {
  BadRequestException,
  Injectable,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { request, Response } from 'express';
import ms from 'ms';
import { registerUserDTO } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import {
  convertExpiresInToDate,
  formatRemainingTime,
} from 'src/constants/common';
import { AuthResponses } from './auth.responses';
import mongoose from 'mongoose';
import { UserVerifyStatus } from 'src/constants/enum';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<IUser | null> {
    const [user, userByEmail] = await Promise.all([
      this.usersService.findOneByUsername(username),
      this.usersService.findOneByEmail(username),
    ]);
    await this.checkBanned(user || userByEmail);
    const validUser = [user, userByEmail].find(
      (u) => u && this.usersService.isValidPassword(pass, u.password),
    );

    return validUser || null;
  }
  private async checkBanned(user: IUser | null) {
    if (user?.verified === UserVerifyStatus.Banned) {
      if (Date.now() > user.banEndDate.getTime()) {
        await this.usersService.unbanUser(user._id.toString());
      } else {
        const remainingTime = user.banEndDate.getTime() - Date.now();
        throw new UnauthorizedException(
          `Tài khoản bị cấm đến ${user.banEndDate.toLocaleString()}. ` +
            `Thời gian còn lại: ${formatRemainingTime(remainingTime)}. ` +
            `Lý do: ${user.banReason}`,
        );
      }
    }
  }
  signRefreshToken(payload: IUser) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN'),
    });
  }

  signEmailVerifyToken(payload: { email: string }) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_EMAIL_VERIFY_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EMAIL_VERIFY_EXPIRESIN'),
    });
  }

  signForgotPasswordToken(payload: { email: string }) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_FORGOT_PASSWORD_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_FORGOT_PASSWORD_EXPIRESIN',
      ),
    });
  }

  async login(
    user: IUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponses['LoginResponse']> {
    const { _id, username, email, verified, avatar, role } = user;
    const payload = {
      sub: 'Token Login',
      iss: 'From server',
      _id,
      username,
      email,
      verified,
      avatar,
      role,
    };
    const refresh_token = this.signRefreshToken(payload);
    await this.usersService.updateRefreshToken(
      new mongoose.Types.ObjectId(_id).toString(),
      refresh_token,
    );
    // response.cookie('refresh_token', refresh_token, {
    //   httpOnly: true,
    //   maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN')),
    // });
    if (user.verified !== UserVerifyStatus.Verified) {
      throw new BadRequestException('Please verify your email first');
    }
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      user: {
        _id: new mongoose.Types.ObjectId(_id),
        email,
        username,
        avatar,
        role,
      },
    };
  }

  async register(registerDto: registerUserDTO) {
    const email_verify_token = await this.signEmailVerifyToken({
      email: registerDto.email,
    });
    registerDto.email_verify_token = email_verify_token;
    return this.usersService.create(registerDto);
  }

  async logout(user: IUser, res: Response) {
    res.clearCookie('refresh_token');
    const result = this.usersService.updateRefreshToken(
      new mongoose.Types.ObjectId(user._id).toString(),
      '',
    );
    return {};
  }

  async getNewAccessToken(
    refresh_token: string,
    res: Response,
  ): Promise<AuthResponses['GetNewAccessTokenResonse']> {
    try {
      await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.usersService.findOneByRefreshToken(refresh_token);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const { _id, username, email, avatar, role } = user;
      const payload = {
        sub: 'Token Login',
        iss: 'From server',
        _id,
        username,
        email,
        avatar,
        role,
      };
      const new_refresh_token = this.signRefreshToken(payload);
      await this.usersService.updateRefreshToken(
        _id.toString(),
        new_refresh_token,
      );
      res.cookie('refresh_token', new_refresh_token, {
        httpOnly: true,
        maxAge: ms(
          this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN'),
        ),
      });
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: new_refresh_token,
        user: {
          _id,
          email,
          username,
          avatar,
          role,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Invalid refresh token. Flease login again!!',
      );
    }
  }

  async verifyEmail(email_verify_token: string) {
    try {
      const result = await this.jwtService.verify(email_verify_token, {
        secret: this.configService.get<string>('JWT_EMAIL_VERIFY_SECRET'),
      });
      const day = new Date();
      if (convertExpiresInToDate(result.exp).getTime() < day.getTime()) {
        throw new BadRequestException('Token is expired');
      }
      return this.usersService.verifyEmail(email_verify_token);
    } catch (error) {
      throw new BadRequestException('Token is invalid');
    }
  }
  async forgotPassword(email: string) {
    const forgot_password_token = await this.signForgotPasswordToken({ email });
    return this.usersService.forgotPassword(email, forgot_password_token);
  }
  async resetPassword(forgot_password_token: string, password: string) {
    try {
      const result = await this.jwtService.verify(forgot_password_token, {
        secret: this.configService.get<string>('JWT_FORGOT_PASSWORD_SECRET'),
      });
      const day = new Date();
      if (convertExpiresInToDate(result.exp).getTime() < day.getTime()) {
        throw new BadRequestException('Token is expired');
      }
      return this.usersService.resetPassword(forgot_password_token, password);
    } catch (error) {
      throw new BadRequestException('Token is invalid');
    }
  }
}
