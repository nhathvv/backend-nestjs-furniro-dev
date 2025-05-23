import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Res,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { registerUserDTO } from 'src/users/dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthResponses } from './auth.responses';
import { RESPONSE_MESSAGE } from 'src/constants/message';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponeMessage(RESPONSE_MESSAGE.LOGIN_SUCCESS)
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
  @ResponeMessage(RESPONSE_MESSAGE.GET_USER_INFORMATION)
  async getAccount(
    @User() user: IUser,
  ): Promise<AuthResponses['GetAccountResponse']> {
    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    };
  }

  @Public()
  @Post('/register')
  @ResponeMessage(RESPONSE_MESSAGE.REGISTER_SUCCESS)
  async register(@Body() registerUserDTO: registerUserDTO) {
    return this.authService.register(registerUserDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @ApiBearerAuth('access-token')
  @ResponeMessage(RESPONSE_MESSAGE.LOGOUT_SUCCESSFULLY)
  async handleLogout(
    @User() user: IUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(user, res);
  }

  @Post('/refresh-token')
  @Public()
  @ResponeMessage(RESPONSE_MESSAGE.GET_USER_BY_REFRESH_TOKEN)
  async getNewAccessToken(
    @Body('refresh_token') refresh_token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.getNewAccessToken(refresh_token, res);
  }

  @Post('/verify-email')
  @ResponeMessage(RESPONSE_MESSAGE.VERIFY_EMAIL)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email_verify_token: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5oYXRodi4yMWl0dHRndEBnbWFpbC5jb20iLCJpYXQiOjE3MzY2MTI0MjQsImV4cCI6MTczNjYxNDIyNH0.ZjICQcy_IeMn1EIKHnu3ggEFxYG2KR5JXxiR94MCUBU',
        },
      },
    },
  })
  async handleVerifyEmail(
    @Body('email_verify_token') email_verify_token: string,
  ) {
    return this.authService.verifyEmail(email_verify_token);
  }

  @Post('/forgot-password')
  @Public()
  @ResponeMessage(RESPONSE_MESSAGE.FORGOT_PASSWORD)
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
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Iml0c3RhaG4uYXdzQGdtYWlsLmNvbSIsImlhdCI6MTczNjcwNDUwMywiZXhwIjoxNzM2NzA2MzAzfQ.AO41M7RvB4Mw0CNhBdU3CiMtvm06eMTIf48jXg5MMgs',
        },
        password: {
          type: 'string',
          example: 'Xuanquoche2206@',
        },
      },
    },
  })
  @ResponeMessage(RESPONSE_MESSAGE.PASSWORD_HAS_BEEN_SUCCESSFULLY_RESET)
  async handleVerifyForgotPasswod(
    @Body('forgot_password_token') forgot_password_token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(forgot_password_token, password);
  }
}
