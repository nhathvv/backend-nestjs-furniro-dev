import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Hoang Van' })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Nhat' })
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'nhathv' })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: "nhathv.21it@gmail.com" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Cvbn1234@@@@!' })
  password: string;

  email_verify_token?: string;
}
export class registerUserDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Hoang Van' })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Nhat' })
  last_name: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'nhathv' })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: "nhathv.21it@gmail.com" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Cvbn1234@@@@!' })
  password: string;

  email_verify_token?: string;
}