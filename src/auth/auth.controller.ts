import { Controller, Request, Post, UseGuards, Get, Res, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { registerUserDTO } from 'src/users/dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthResponses } from './auth.responses';
import mongoose from 'mongoose';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponeMessage('Login success')
  @Post('/login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'xuanquoche',
        },
        password: {
          type: 'string',
          example: 'Xuanquoche2206@',
        },
      },
    },
  })
  async login(@User() user, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(user, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/account')
  @ResponeMessage('Get user information')
  async getAccount(@User() user: IUser): Promise<AuthResponses['GetAccountResponse']> {
    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      }
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
  @ApiBearerAuth('access-token')
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

  @Post('/verify-email')
  @ResponeMessage('Verify email')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email_verify_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5oYXRodi4yMWl0dHRndEBnbWFpbC5jb20iLCJpYXQiOjE3MzY2MTI0MjQsImV4cCI6MTczNjYxNDIyNH0.ZjICQcy_IeMn1EIKHnu3ggEFxYG2KR5JXxiR94MCUBU',
        },
      },
    },
  })
  async handleVerifyEmail(@Body('email_verify_token') email_verify_token: string) {
    return this.authService.verifyEmail(email_verify_token);
  }

  @Post('/forgot-password')
  @Public()
  @ResponeMessage('Forgot password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'nhathv.21it@gmail.com',
        },
      },
    },
  })
  async handleForgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('/verify-reset-password')
  @Public()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        forgot_password_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Iml0c3RhaG4uYXdzQGdtYWlsLmNvbSIsImlhdCI6MTczNjcwNDUwMywiZXhwIjoxNzM2NzA2MzAzfQ.AO41M7RvB4Mw0CNhBdU3CiMtvm06eMTIf48jXg5MMgs',
        },
        password: {
          type: 'string',
          example: 'Xuanquoche2206@',
        },
      },
    }
  })
  @ResponeMessage('Password has been successfully reset.')
  async handleVerifyForgotPasswod(@Body('forgot_password_token') forgot_password_token: string, @Body('password') password: string) {
    return this.authService.resetPassword(forgot_password_token, password);
  }

}
