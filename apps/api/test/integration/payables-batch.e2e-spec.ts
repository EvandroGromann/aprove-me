import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getQueueToken } from '@nestjs/bull';
import { getAuthToken } from '../helpers/auth.helper';

describe('Payables Batch (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  // Mocks to capture interactions
  const addBulk = jest.fn().mockResolvedValue([]);
  const hset = jest.fn().mockResolvedValue('OK');
  const expire = jest.fn().mockResolvedValue(1);
  const processHandler = jest.fn();
  const process = jest.fn().mockImplementation((_name: string, _cb: Function) => {
    // no-op in tests; BullExplorer will register the handler
    processHandler.mockImplementation(_cb as any);
  });
  const on = jest.fn();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('payable-batch'))
      .useValue({
        addBulk,
        process,
        on,
        client: { hset, expire },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
    authToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('/integrations/payable/batch (POST) enqueues jobs and returns batchId', async () => {
    const body = {
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440101',
          value: 100,
          emissionDate: '2025-08-30T00:00:00.000Z',
          assignor: {
            id: '550e8400-e29b-41d4-a716-446655440111',
            document: '12345678900',
            email: 'ops@acme.test',
            phone: '11999999999',
            name: 'Acme',
          },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440202',
          value: 200,
          emissionDate: '2025-08-29T00:00:00.000Z',
          assignor: {
            id: '550e8400-e29b-41d4-a716-446655440222',
            document: '98765432100',
            email: 'ops2@acme.test',
            phone: '11888888888',
            name: 'Acme 2',
          },
        },
      ],
      notifyTo: 'ops@example.com',
    };

    const res = await request(app.getHttpServer())
      .post('/integrations/payable/batch')
      .set('Authorization', `Bearer ${authToken}`)
      .send(body)
      .expect(201);

    expect(res.body).toHaveProperty('batchId');
    const batchId = res.body.batchId as string;
    expect(typeof batchId).toBe('string');
    expect(batchId.length).toBeGreaterThan(0);

    // Validate that addBulk was called with two jobs named 'payable'
    expect(addBulk).toHaveBeenCalledTimes(1);
    const jobsArg = (addBulk as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(jobsArg)).toBe(true);
    expect(jobsArg).toHaveLength(2);
    expect(jobsArg[0]).toMatchObject({ name: 'payable', data: { batchId } });
    expect(jobsArg[1]).toMatchObject({ name: 'payable', data: { batchId } });

    // Tracker should be written and expired with the same batch key
    expect(hset).toHaveBeenCalled();
    const keyUsed = (hset as jest.Mock).mock.calls[0][0];
    expect(keyUsed).toBe(`batch:payable:${batchId}`);
    expect(expire).toHaveBeenCalledWith(`batch:payable:${batchId}`, expect.any(Number));
  });
});
