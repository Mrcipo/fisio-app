export const prismaMock = {
  $queryRaw: jest.fn(),
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  patient: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  exercise: {
    findMany: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  initialAssessment: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
