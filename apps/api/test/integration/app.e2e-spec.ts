import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) - should return 404 for root path', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  it('/integrations/assignor (POST) - should validate required fields', () => {
    return request(app.getHttpServer())
      .post('/integrations/assignor')
      .send({})
      .expect(400);
  });

  it('/integrations/payable (POST) - should validate required fields', () => {
    return request(app.getHttpServer())
      .post('/integrations/payable')
      .send({})
      .expect(400);
  });
});
