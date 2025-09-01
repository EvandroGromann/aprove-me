import { PrismaClient } from '@prisma/client';

jest.setTimeout(10000);

// Silencia saídas de console durante os testes (winston Console usa console.log)
const noop = () => {};
jest.spyOn(console, 'log').mockImplementation(noop);
jest.spyOn(console, 'error').mockImplementation(noop);
jest.spyOn(console, 'warn').mockImplementation(noop as any);
jest.spyOn(console, 'info').mockImplementation(noop as any);
jest.spyOn(console, 'debug').mockImplementation(noop as any);

// Evita escrita em arquivos pelo transporte File do winston durante testes
jest.mock('winston', () => {
  const actual = jest.requireActual('winston');
  const Transport = require('winston-transport');

  class NoopFileTransport extends Transport {
    constructor(opts?: any) {
      super(opts);
    }
    log(info: any, callback?: () => void) {
      setImmediate(() => this.emit('logged', info));
      if (callback) callback();
    }
    close(): void { /* noop */ }
  }

  class NoopConsoleTransport extends Transport {
    constructor(opts?: any) {
      super(opts);
    }
    log(info: any, callback?: () => void) {
      setImmediate(() => this.emit('logged', info));
      if (callback) callback();
    }
  }

  return {
    ...actual,
    transports: {
      ...actual.transports,
  Console: NoopConsoleTransport,
      File: NoopFileTransport,
    },
  };
});

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    assignor: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    payable: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  })),
}));

// Mock Bull to avoid real Redis connections during unit tests
jest.mock('@nestjs/bull', () => {
  const { Inject } = require('@nestjs/common');
  const makeDummyQueue = () => ({
    add: jest.fn(),
    addBulk: jest.fn(),
    close: jest.fn(),
    client: {
      hset: jest.fn().mockResolvedValue('OK'),
      hincrby: jest.fn().mockResolvedValue(1),
      hmget: jest.fn().mockResolvedValue(['0', '0', '0', '']),
      set: jest.fn().mockResolvedValue('OK'),
      expire: jest.fn().mockResolvedValue(1),
    },
  });

  class BullTestingModule {}

  const BullModule = {
    forRoot: () => ({ module: BullTestingModule, providers: [], exports: [] }),
    registerQueue: (...queues: Array<{ name: string }>) => {
      const providers = queues.map((q) => ({
        provide: `BullQueue_${q.name}`,
        useValue: makeDummyQueue(),
      }));
      return { module: BullTestingModule, providers, exports: providers };
    },
  };

  const getQueueToken = (name: string) => `BullQueue_${name}`;
  const InjectQueue = (name: string) => Inject(getQueueToken(name));
  const Processor = (..._args: any[]) => (target: any) => target;
  const Process = (..._args: any[]) => (target: any, key: string, descriptor: PropertyDescriptor) => descriptor;
  // No-op decorator for queue failure events used by the consumer in tests
  const OnQueueFailed = (..._args: any[]) => (target: any, key?: string, descriptor?: PropertyDescriptor) => descriptor ?? target;

  return { BullModule, InjectQueue, Processor, Process, OnQueueFailed, getQueueToken };
});

// Mock nodemailer to avoid opening SMTP connections in unit tests
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test' }),
      close: jest.fn(),
    })),
  },
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test' }),
    close: jest.fn(),
  })),
}));

// Mock 'bull' library to avoid importing real implementation during unit tests
jest.mock('bull', () => ({
  __esModule: true,
  default: class BullQueueMock {},
  Job: class JobMock {},
  Queue: class QueueMock {},
}));

beforeEach(() => {
  jest.clearAllMocks();
});
