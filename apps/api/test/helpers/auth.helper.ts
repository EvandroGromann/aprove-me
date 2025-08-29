import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/shared/database/prisma.service';
import * as bcrypt from 'bcrypt';

export async function getAuthToken(app: INestApplication): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/integrations/auth')
    .send({
      login: 'aprovame',
      password: 'aprovame',
    })
    .expect(200);

  return response.body.access_token;
}

export function authenticatedRequest(app: INestApplication, token: string) {
  return {
    get: (url: string) => request(app.getHttpServer()).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app.getHttpServer()).post(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => request(app.getHttpServer()).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app.getHttpServer()).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

export class AuthHelper {
  private prisma: PrismaService;

  constructor(private app: INestApplication) {
    this.prisma = app.get<PrismaService>(PrismaService);
  }

  async createDefaultUser() {
    const hashedPassword = await bcrypt.hash('aprovame', 10);
    
    await this.prisma.user.upsert({
      where: { login: 'aprovame' },
      update: {},
      create: {
        id: 'default-user-id',
        login: 'aprovame',
        password: hashedPassword,
      },
    });
  }

  async getAuthToken(): Promise<string> {
    return getAuthToken(this.app);
  }

  authenticatedRequest(token: string) {
    return authenticatedRequest(this.app, token);
  }
}
