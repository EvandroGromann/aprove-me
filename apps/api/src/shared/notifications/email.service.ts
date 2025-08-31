import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { Log } from '../decorators/log.decorator';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  @Log()
  async send(to: string, subject: string, body: string) {
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';
    const mail = { from, to, subject, text: body };
    return this.transporter.sendMail(mail);
  }
}
