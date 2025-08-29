import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';
import { getAuthToken } from '../helpers/auth.helper';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configurar ValidationPipe para os testes E2E
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user with valid data', async () => {
      const token = await getAuthToken(app);

      // Usar timestamp para garantir login único
      const uniqueLogin = `newuser${Date.now()}`;
      const userData = {
        login: uniqueLogin,
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        login: uniqueLogin,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for invalid data', async () => {
      const token = await getAuthToken(app);

      const invalidData = {
        login: 'ab',
        password: '123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 401 without token', async () => {
      const userData = {
        login: `newuser${Date.now()}`,
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(401);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users', async () => {
      const token = await getAuthToken(app);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toMatchObject({
          id: expect.any(String),
          login: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
        expect(response.body[0]).not.toHaveProperty('password');
      }
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });
});
