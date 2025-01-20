import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private mailerService: MailerService) {
    this.transporter = nodemailer.createTransport({
      name: 'mail.genomicsivfcentre.com',
      host: 'mail.genomicsivfcentre.com', // or another email service provider
      port: 465,
      secure: true,
      debug: true,
      auth: {
        user: 'info@genomicsivfcentre.com', // Your email address
        pass: 'Vinayak@123#', // Your email password
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'info@genomicsivfcentre.com',
      to,
      subject,
      html: text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendMailTemplateToAdmin(subject: string, data: any, template: string) {
    await this.mailerService.sendMail({
      to: process.env.RECEIVER_MAIL,
      subject,
      template,
      context: {
        data,
      },
    });
  }
}
