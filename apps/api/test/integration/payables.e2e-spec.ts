import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/database/prisma.service';

describe('PayablesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testAssignor = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    document: '12345678900',
    email: 'test@example.com',
    phone: '11999888777',
    name: 'Test User',
  };

  const testPayable = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    value: 1500.75,
    emissionDate: '2024-12-31T00:00:00.000Z',
    assignor: testAssignor,
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

  describe('/integrations/payable (POST)', () => {
    it('should create a new payable with new assignor', () => {
      return request(app.getHttpServer())
        .post('/integrations/payable')
        .send(testPayable)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: testPayable.id,
            value: testPayable.value,
            emissionDate: new Date(testPayable.emissionDate).toISOString(),
            assignor: {
              id: testAssignor.id,
              document: testAssignor.document,
              email: testAssignor.email,
              phone: testAssignor.phone,
              name: testAssignor.name,
            },
          });
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should create a new payable with existing assignor', async () => {
      await prisma.assignor.create({ data: testAssignor });

      const payableWithExistingAssignor = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        value: 2000.50,
        emissionDate: '2024-11-30T00:00:00.000Z',
        assignor: {
          ...testAssignor,
          name: 'Updated Name',
          email: 'updated@example.com',
        },
      };

      return request(app.getHttpServer())
        .post('/integrations/payable')
        .send(payableWithExistingAssignor)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: payableWithExistingAssignor.id,
            value: payableWithExistingAssignor.value,
            assignor: {
              id: testAssignor.id,
              name: 'Updated Name',
              email: 'updated@example.com',
            },
          });
        });
    });

    it('should return 409 when creating payable with existing ID', async () => {
      await request(app.getHttpServer())
        .post('/integrations/payable')
        .send(testPayable)
        .expect(201);

      return request(app.getHttpServer())
        .post('/integrations/payable')
        .send(testPayable)
        .expect(409);
    });

    it('should return 400 for invalid payable data', () => {
      return request(app.getHttpServer())
        .post('/integrations/payable')
        .send({
          id: 'invalid-uuid',
          value: -100,
          emissionDate: 'invalid-date',
          assignor: {
            id: 'invalid-uuid',
            document: '',
            email: 'invalid-email',
            phone: '',
            name: '',
          },
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/integrations/payable')
        .send({})
        .expect(400);
    });

    it('should validate minimum value', () => {
      return request(app.getHttpServer())
        .post('/integrations/payable')
        .send({
          ...testPayable,
          value: 0,
        })
        .expect(400);
    });
  });

  describe('/integrations/payable (GET)', () => {
    beforeEach(async () => {
      await prisma.assignor.create({ data: testAssignor });
      
      await prisma.payable.createMany({
        data: [
          {
            id: testPayable.id,
            value: testPayable.value,
            emissionDate: new Date(testPayable.emissionDate),
            assignorId: testAssignor.id,
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            value: 2500.00,
            emissionDate: new Date('2024-10-31T00:00:00.000Z'),
            assignorId: testAssignor.id,
          },
        ],
      });
    });

    it('should return paginated payables', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable')
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
          expect(res.body.data[0].assignor).toBeDefined();
          expect(res.body.data[0].assignor.id).toBe(testAssignor.id);
        });
    });

    it('should return paginated payables with custom pagination', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable?page=1&limit=1')
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

    it('should handle invalid pagination parameters gracefully', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable?page=invalid&limit=invalid')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });
  });

  describe('/integrations/payable/:id (GET)', () => {
    beforeEach(async () => {
      await prisma.assignor.create({ data: testAssignor });
      
      await prisma.payable.create({
        data: {
          id: testPayable.id,
          value: testPayable.value,
          emissionDate: new Date(testPayable.emissionDate),
          assignorId: testAssignor.id,
        },
      });
    });

    it('should return payable by ID with assignor data', () => {
      return request(app.getHttpServer())
        .get(`/integrations/payable/${testPayable.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: testPayable.id,
            value: testPayable.value,
            assignor: {
              id: testAssignor.id,
              document: testAssignor.document,
              email: testAssignor.email,
              phone: testAssignor.phone,
              name: testAssignor.name,
            },
          });
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should return 404 for non-existent payable', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });

    it('should return 404 for invalid UUID format', () => {
      return request(app.getHttpServer())
        .get('/integrations/payable/invalid-uuid')
        .expect(404);
    });
  });

  describe('Data integrity tests', () => {
    it('should maintain referential integrity between payables and assignors', async () => {
      const response = await request(app.getHttpServer())
        .post('/integrations/payable')
        .send(testPayable)
        .expect(201);

      const assignorInDb = await prisma.assignor.findUnique({
        where: { id: testAssignor.id },
      });

      expect(assignorInDb).toBeDefined();
      expect(assignorInDb).toMatchObject(testAssignor);

      const payableInDb = await prisma.payable.findUnique({
        where: { id: testPayable.id },
        include: { assignor: true },
      });

      expect(payableInDb).toBeDefined();
      expect(payableInDb?.assignorId).toBe(testAssignor.id);
      expect(payableInDb?.assignor).toMatchObject(testAssignor);
    });

    it('should update assignor data when creating payable with existing assignor', async () => {
      await prisma.assignor.create({ 
        data: {
          ...testAssignor,
          name: 'Original Name',
          email: 'original@example.com',
        }
      });

      const updatedAssignor = {
        ...testAssignor,
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      await request(app.getHttpServer())
        .post('/integrations/payable')
        .send({
          ...testPayable,
          assignor: updatedAssignor,
        })
        .expect(201);

      const assignorInDb = await prisma.assignor.findUnique({
        where: { id: testAssignor.id },
      });

      expect(assignorInDb?.name).toBe('Updated Name');
      expect(assignorInDb?.email).toBe('updated@example.com');
    });
  });
});
