import { EmailService } from '../../../../src/shared/notifications/email.service';
import nodemailer from 'nodemailer';

// nodemailer is mocked in test/setup.ts; we also use it directly here
describe('EmailService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    (nodemailer as any).createTransport.mockReset();
    (nodemailer as any).createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'msg' }),
      close: jest.fn(),
    });
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('configures transport with auth when SMTP_USER and SMTP_PASS are present', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '2525';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'secret';

    const service = new EmailService();
    expect(service).toBeDefined();

    expect((nodemailer as any).createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 2525,
        secure: false,
        auth: { user: 'user@example.com', pass: 'secret' },
      })
    );
  });

  it('omits auth when credentials are missing and uses EMAIL_FROM in send()', async () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'true';
    process.env.EMAIL_FROM = 'no-reply@acme.test';

    const service = new EmailService();
    expect((nodemailer as any).createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        auth: undefined,
      })
    );

    const transport = (nodemailer as any).createTransport.mock.results[0].value;
    await service.send('to@acme.test', 'Subject', 'Body');
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'no-reply@acme.test' })
    );
  });

  it('send() falls back to SMTP_USER then default when EMAIL_FROM is not set', async () => {
    delete process.env.EMAIL_FROM;
    process.env.SMTP_USER = 'smtp-user@example.com';

    const svc = new EmailService();
    const transport = (nodemailer as any).createTransport.mock.results[0].value;
    await svc.send('to2@example.com', 'S2', 'B2');
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'smtp-user@example.com' })
    );

    // Now clear SMTP_USER to hit the default 'no-reply@example.com'
    (transport.sendMail as jest.Mock).mockClear();
    delete process.env.SMTP_USER;
    const svc2 = new EmailService();
    const transport2 = (nodemailer as any).createTransport.mock.results[1].value;
    await svc2.send('to3@example.com', 'S3', 'B3');
    expect(transport2.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'no-reply@example.com' })
    );
  });
});
