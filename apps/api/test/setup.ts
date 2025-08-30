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

beforeEach(() => {
  jest.clearAllMocks();
});
