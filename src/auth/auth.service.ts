import { Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import ms from 'ms';
import { registerUserDTO } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
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
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      }
    };
  }
  async register(registerDto: registerUserDTO) {
    console.log(registerDto);
    return this.usersService.create(registerDto);
  }
}
