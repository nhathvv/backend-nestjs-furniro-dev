import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponeMessage, User } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { IUser } from 'src/users/users.interface';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  @Public()
  @ResponeMessage('Send email verify')
  async sendEmailVerify(@User() user: IUser, email_verify_token: string) {
    return this.mailService.sendEmailVerify(user, email_verify_token);
  }
}
