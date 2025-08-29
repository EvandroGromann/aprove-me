import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Authentication E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
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

  afterAll(async () => {
    await app.close();
  });

  describe('/integrations/auth (POST)', () => {
    it('should return JWT token for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'aprovame',
          password: 'aprovame',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('token_type', 'Bearer');
          expect(res.body).toHaveProperty('expires_in', 60);
          expect(typeof res.body.access_token).toBe('string');
          expect(res.body.access_token.length).toBeGreaterThan(0);
        });
    });

    it('should return 401 for invalid login', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'invalid',
          password: 'aprovame',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Credenciais inválidas');
          expect(res.body).toHaveProperty('statusCode', 401);
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'aprovame',
          password: 'invalid',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Credenciais inválidas');
          expect(res.body).toHaveProperty('statusCode', 401);
        });
    });

    it('should return 400 for missing login', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          password: 'aprovame',
        })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'aprovame',
        })
        .expect(400);
    });

    it('should return 400 for empty credentials', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid data types', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 123,
          password: true,
        })
        .expect(400);
    });
  });

  describe('Protected endpoints', () => {
    let validToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'aprovame',
          password: 'aprovame',
        });
      
      validToken = response.body.access_token;
    });

    it('should access assignors with valid token', () => {
      return request(app.getHttpServer())
        .get('/integrations/assignor')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('should access payables with valid token', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('should reject assignors without token', () => {
      return request(app.getHttpServer())
        .get('/integrations/assignor')
        .expect(401);
    });

    it('should reject payables without token', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable')
        .expect(401);
    });

    it('should reject assignors with invalid token', () => {
      return request(app.getHttpServer())
        .get('/integrations/assignor')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject payables with malformed Authorization header', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable')
        .set('Authorization', 'invalid-format')
        .expect(401);
    });

    it('should reject with expired token format', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibG9naW4iOiJhcHJvdmFtZSIsImlhdCI6MTY5MzUyNjQwMCwiZXhwIjoxNjkzNTI2NDYwfQ.invalidSignature';
      
      return request(app.getHttpServer())
        .get('/integrations/assignor')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('JWT Token validation', () => {
    it('should generate different tokens for each login', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'aprovame',
          password: 'aprovame',
        });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const response2 = await request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'aprovame',
          password: 'aprovame',
        });

      expect(response1.body.access_token).not.toBe(response2.body.access_token);
    });

    it('should maintain consistent response format', () => {
      return request(app.getHttpServer())
        .post('/integrations/auth')
        .send({
          login: 'aprovame',
          password: 'aprovame',
        })
        .expect(200)
        .expect((res) => {
          expect(Object.keys(res.body)).toEqual([
            'access_token',
            'token_type',
            'expires_in'
          ]);
        });
    });
  });
});
