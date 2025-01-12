import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) { }

  async sendEmailVerify(user: any, email_verify_token: string) {
    const url = `http://localhost:3000/auth/confirm?email_veriy_token=${email_verify_token}`;
    return await this.mailerService.sendMail({
      to: user.email, // list of receivers
      from: '"Furniro.dev" <support@example.com>', // override default from
      subject: 'Welcome to Furniro Dev! Verify your Email',
      template: './verify-account', // `.hbs` extension is appended automatically
      context: { // ✏️ filling curly brackets with content
        name: user.username,
        url
      },
    });
  }

  async sendEmailForgotPassword(user: any, forgot_password_token: string) {
    const url = `http://localhost:3000/auth/confirm?forgot_password_token=${forgot_password_token}`;
    return await this.mailerService.sendMail({
      to: user.email, // list of receivers
      from: '"Furniro.dev" <support@example.com>', // override default from
      subject: 'Reset Your Password - Furniro Dev',
      template: './forgot-password', // `.hbs` extension is appended automatically
      context: { // ✏️ filling curly brackets with content
        name: user.username,
        url
      },
    });
  }

}
