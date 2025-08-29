import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';

describe('AssignorsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testAssignor = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    document: '12345678900',
    email: 'test@example.com',
    phone: '11999888777',
    name: 'Test User',
  };

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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.payable.deleteMany();
    await prisma.assignor.deleteMany();
  });

  afterAll(async () => {
    await prisma.payable.deleteMany();
    await prisma.assignor.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('/integrations/assignor (POST)', () => {
    it('should create a new assignor', () => {
      return request(app.getHttpServer())
        .post('/integrations/assignor')
        .send(testAssignor)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: testAssignor.id,
            document: testAssignor.document,
            email: testAssignor.email,
            phone: testAssignor.phone,
            name: testAssignor.name,
          });
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
          expect(res.body.deletedAt).toBeUndefined();
        });
    });

    it('should return 409 when creating assignor with existing ID', async () => {
      await request(app.getHttpServer())
        .post('/integrations/assignor')
        .send(testAssignor)
        .expect(201);

      const duplicateAssignor = {
        ...testAssignor,
        email: 'different@example.com',
      };

      return request(app.getHttpServer())
        .post('/integrations/assignor')
        .send(duplicateAssignor)
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/integrations/assignor')
        .send({
          id: 'invalid-uuid',
          document: '',
          email: 'invalid-email',
          phone: '',
          name: '',
        })
        .expect(400);
    });
  });

  describe('/integrations/assignor (GET)', () => {
    beforeEach(async () => {
      await prisma.assignor.createMany({
        data: [
          testAssignor,
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            document: '98765432100',
            email: 'test2@example.com',
            phone: '11888777666',
            name: 'Test User 2',
          },
        ],
      });
    });

    it('should return paginated assignors', () => {
      return request(app.getHttpServer())
        .get('/integrations/assignor')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.meta).toMatchObject({
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          });
        });
    });

    it('should return paginated assignors with custom pagination', () => {
      return request(app.getHttpServer())
        .get('/integrations/assignor?page=1&limit=1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.meta).toMatchObject({
            page: 1,
            limit: 1,
            total: 2,
            totalPages: 2,
            hasNext: true,
            hasPrev: false,
          });
        });
    });
  });

  describe('/integrations/assignor/:id (GET)', () => {
    beforeEach(async () => {
      await prisma.assignor.create({ data: testAssignor });
    });

    it('should return assignor by ID', () => {
      return request(app.getHttpServer())
        .get(`/integrations/assignor/${testAssignor.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: testAssignor.id,
            document: testAssignor.document,
            email: testAssignor.email,
            phone: testAssignor.phone,
            name: testAssignor.name,
          });
        });
    });

    it('should return 404 for non-existent assignor', () => {
      return request(app.getHttpServer())
        .get('/integrations/assignor/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });

  describe('/integrations/assignor/:id (PATCH)', () => {
    beforeEach(async () => {
      await prisma.assignor.create({ data: testAssignor });
    });

    it('should update assignor', () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      return request(app.getHttpServer())
        .patch(`/integrations/assignor/${testAssignor.id}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: testAssignor.id,
            name: updateData.name,
            email: updateData.email,
          });
        });
    });

    it('should return 404 for non-existent assignor', () => {
      return request(app.getHttpServer())
        .patch('/integrations/assignor/550e8400-e29b-41d4-a716-446655440999')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('/integrations/assignor/:id (DELETE)', () => {
    beforeEach(async () => {
      await prisma.assignor.create({ data: testAssignor });
    });

    it('should soft delete assignor', () => {
      return request(app.getHttpServer())
        .delete(`/integrations/assignor/${testAssignor.id}`)
        .expect(200);
    });

    it('should return 404 for non-existent assignor', () => {
      return request(app.getHttpServer())
        .delete('/integrations/assignor/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });

  describe('/integrations/assignor/:id/restore (POST)', () => {
    beforeEach(async () => {
      await prisma.assignor.create({ 
        data: { 
          ...testAssignor, 
          deletedAt: new Date() 
        } 
      });
    });

    it('should restore soft deleted assignor', () => {
      return request(app.getHttpServer())
        .post(`/integrations/assignor/${testAssignor.id}/restore`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: testAssignor.id,
            document: testAssignor.document,
            email: testAssignor.email,
            phone: testAssignor.phone,
            name: testAssignor.name,
          });
        });
    });
  });
});
