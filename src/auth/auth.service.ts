import { BadRequestException, Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import ms from 'ms';
import { MailService } from 'src/mail/mail.service';
import { registerUserDTO } from 'src/users/dto/create-user.dto';
import { UserVerifyStatus } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService
  ) { }
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      if (this.usersService.isValidPassword(pass, user.password)) {
        return user
      }
    }
    return null;
  }
  signRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN'),
    });
  }
  signEmailVerifyToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_EMAIL_VERIFY_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EMAIL_VERIFY_EXPIRESIN'),
    });
  }

  async login(user: IUser, @Res({ passthrough: true }) response: Response) {
    const { _id, username, email } = user;
    const payload = {
      sub: 'Token Login',
      iss: 'From server',
      _id,
      username,
      email
    }
    const refresh_token = this.signRefreshToken(payload);
    await this.usersService.updateRefreshToken(_id, refresh_token);
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN')),
    });
    if (user.verified !== UserVerifyStatus.Verified) {
      throw new BadRequestException('Please verify your email first');
    }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        email,
        username,
      }
    };
  }
  async register(registerDto: registerUserDTO) {
    const email_verify_token = await this.signEmailVerifyToken({ email: registerDto.email });
    registerDto.email_verify_token = email_verify_token;
    return this.usersService.create(registerDto);
  }
  async logout(user: IUser, res: Response) {
    res.clearCookie('refresh_token');
    return this.usersService.updateRefreshToken(user._id, '');
  }
  async getNewAccessToken(refresh_token: string, res: Response) {
    try {
      await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
      })
      const user = await this.usersService.findOneByRefreshToken(refresh_token);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const { _id, username, email } = user;
      const payload = {
        sub: 'Token Login',
        iss: 'From server',
        _id,
        username,
        email
      }
      const new_refresh_token = this.signRefreshToken(payload);
      await this.usersService.updateRefreshToken(_id.toString(), new_refresh_token);
      res.cookie('refresh_token', new_refresh_token, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRESIN')),
      });
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          _id,
          email,
          username,
        }
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token. Flease login again!!');
    }

  }
}
