import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getAuthToken, authenticatedRequest } from '../helpers/auth.helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();

    authToken = await getAuthToken(app);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) - should return 404 for root path', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  it('/integrations/assignor (POST) - should return 401 without authentication', () => {
    return request(app.getHttpServer())
      .post('/integrations/assignor')
      .send({})
      .expect(401);
  });

  it('/integrations/payable (POST) - should return 401 without authentication', () => {
    return request(app.getHttpServer())
      .post('/integrations/payable')
      .send({})
      .expect(401);
  });

  it('/integrations/assignor (POST) - should validate required fields when authenticated', () => {
    return authenticatedRequest(app, authToken)
      .post('/integrations/assignor')
      .send({})
      .expect(400);
  });

  it('/integrations/payable (POST) - should validate required fields when authenticated', () => {
    return authenticatedRequest(app, authToken)
      .post('/integrations/payable')
      .send({})
      .expect(400);
  });
});
