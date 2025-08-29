import request from 'supertest';
import { INestApplication } from '@nestjs/common';

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
