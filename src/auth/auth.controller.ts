import { Controller, Request, Post, UseGuards, Get, Res, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { registerUserDTO } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponeMessage('Login success')
  @Post('/login')
  async login(@User() user, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/account')
  @ResponeMessage('Get user information')
  async getAccount(@User() user: IUser) {
    return {
      user
    }
  }

  @Public()
  @Post('/register')
  @ResponeMessage('Register success')
  async register(@Body() registerUserDTO: registerUserDTO) {
    return this.authService.register(registerUserDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @ResponeMessage('Logout successfully!')
  async handleLogout(@User() user: IUser, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(user, res);
  }

  @Post('/refresh-token')
  @Public()
  @ResponeMessage('Get user by refresh token')
  async getNewAccessToken(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req.cookies['refresh_token'];
    return this.authService.getNewAccessToken(refresh_token, res);
  }

}
