import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePayableRequestDto } from '../../../../src/modules/payables/dto/create-payable-request.dto';

describe('CreatePayableRequestDto', () => {
  it('should validate a valid payable request', async () => {
    const validData = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      value: 1500.75,
      emissionDate: '2024-12-31T00:00:00.000Z',
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    const dto = plainToClass(CreatePayableRequestDto, validData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.assignor).toBeDefined();
    expect(dto.assignor.id).toBe(validData.assignor.id);
  });

  it('should fail validation for invalid UUID', async () => {
    const invalidData = {
      id: 'invalid-uuid',
      value: 1500.75,
      emissionDate: '2024-12-31T00:00:00.000Z',
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    const dto = plainToClass(CreatePayableRequestDto, invalidData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
  });

  it('should fail validation for negative value', async () => {
    const invalidData = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      value: -100,
      emissionDate: '2024-12-31T00:00:00.000Z',
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    const dto = plainToClass(CreatePayableRequestDto, invalidData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('value');
  });

  it('should fail validation for invalid date string', async () => {
    const invalidData = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      value: 1500.75,
      emissionDate: 'invalid-date',
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    const dto = plainToClass(CreatePayableRequestDto, invalidData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('emissionDate');
  });

  it('should validate nested assignor object transformation', async () => {
    const validData = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      value: 1500.75,
      emissionDate: '2024-12-31T00:00:00.000Z',
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    const dto = plainToClass(CreatePayableRequestDto, validData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.assignor).toBeDefined();
    expect(typeof dto.assignor).toBe('object');
    expect(dto.assignor.id).toBe(validData.assignor.id);
    expect(dto.assignor.name).toBe(validData.assignor.name);
  });
});
