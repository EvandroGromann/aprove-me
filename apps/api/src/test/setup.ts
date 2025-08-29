// Setup global test configuration
import { PrismaClient } from '@prisma/client';

// Configurar timeout global
jest.setTimeout(10000);

// Mock do PrismaClient para testes
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
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

// Limpar mocks entre testes
beforeEach(() => {
  jest.clearAllMocks();
});
