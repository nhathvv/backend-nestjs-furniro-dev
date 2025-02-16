import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { BanDuration } from 'src/constants/enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponeMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponeMessage('User created successfully')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: {
          type: 'string',
          example: 'Nhat',
        },
        last_name: {
          type: 'string',
          example: 'Nguyen',
        },
        username: {
          type: 'string',
          example: 'nhatnguyen',
        },
        password: {
          type: 'string',
          example: '123456',
        },
        email: {
          type: 'string',
          example: 'nhatnguyen@gmail.com',
        },
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ResponeMessage('Get all users success')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qsUrl: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qsUrl);
  }

  @Get(':id')
  @ResponeMessage('Get user by id success')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponeMessage('User updated successfully')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @ResponeMessage('User deleted successfully')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Put('banned/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Vi pham quy dinh',
        },
        duration: {
          type: 'string',
          example: 'FIVE_MINUTES',
        },
      },
    },
  })
  @ResponeMessage('User banned successfully')
  async banUser(
    @Param('id') userId: string,
    @Body() body: { reason: string; duration: BanDuration },
  ) {
    return this.usersService.banUser(userId, body.reason, body.duration);
  }
  @Put('unbanned/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponeMessage('User unbanned successfully')
  async unbanUser(@Param('id') userId: string) {
    return this.usersService.unbanUser(userId);
  }
}
