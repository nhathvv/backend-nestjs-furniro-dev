import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) { }
  async sendEmailVerify(user: any, email_verify_token: string) {
    const url = `example.com/auth/confirm?token=${email_verify_token}`;
    console.log(url);
    return await this.mailerService.sendMail({
      to: user,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Furniro Dev! Confirm your Email',
      template: './verify-account', // `.hbs` extension is appended automatically
      context: { // ✏️ filling curly brackets with content
        name: user.username,
        url
      },
    });
  }
}
