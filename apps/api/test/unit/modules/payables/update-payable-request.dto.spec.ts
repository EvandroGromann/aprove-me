import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdatePayableRequestDto } from '../../../../src/modules/payables/dto/update-payable-request.dto';
import { AssignorDto } from '../../../../src/modules/assignors/dto/assignor.dto';

describe('UpdatePayableRequestDto', () => {
  it('should validate a valid update payable request with all fields', async () => {
    const validData = {
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

    const dto = plainToClass(UpdatePayableRequestDto, validData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.value).toBe(validData.value);
    expect(dto.emissionDate).toBe(validData.emissionDate);
    expect(dto.assignor).toBeInstanceOf(AssignorDto);
    expect(dto.assignor.id).toBe(validData.assignor.id);
  });

  it('should validate with only value field', async () => {
    const validData = {
      value: 1500.75,
    };

    const dto = plainToClass(UpdatePayableRequestDto, validData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.value).toBe(validData.value);
    expect(dto.emissionDate).toBeUndefined();
    expect(dto.assignor).toBeUndefined();
  });

  it('should validate with only emissionDate field', async () => {
    const validData = {
      emissionDate: '2024-12-31T00:00:00.000Z',
    };

    const dto = plainToClass(UpdatePayableRequestDto, validData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.value).toBeUndefined();
    expect(dto.emissionDate).toBe(validData.emissionDate);
    expect(dto.assignor).toBeUndefined();
  });

  it('should validate with only assignor field', async () => {
    const validData = {
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    const dto = plainToClass(UpdatePayableRequestDto, validData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.value).toBeUndefined();
    expect(dto.emissionDate).toBeUndefined();
    expect(dto.assignor).toBeInstanceOf(AssignorDto);
    expect(dto.assignor.id).toBe(validData.assignor.id);
    expect(dto.assignor.name).toBe(validData.assignor.name);
  });

  it('should fail validation for negative value', async () => {
    const invalidData = {
      value: -100,
    };

    const dto = plainToClass(UpdatePayableRequestDto, invalidData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('value');
  });

  it('should fail validation for invalid date string', async () => {
    const invalidData = {
      emissionDate: 'invalid-date',
    };

    const dto = plainToClass(UpdatePayableRequestDto, invalidData);
    const errors: ValidationError[] = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('emissionDate');
  });

  it('should validate proper transformation of assignor object', async () => {
    const validData = {
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    // This specifically tests the @Type(() => AssignorDto) decorator
    const dto = plainToClass(UpdatePayableRequestDto, validData);
    
    expect(dto.assignor).toBeDefined();
    expect(dto.assignor).toBeInstanceOf(AssignorDto);
    expect(typeof dto.assignor).toBe('object');
    expect(dto.assignor.id).toBe(validData.assignor.id);
    expect(dto.assignor.document).toBe(validData.assignor.document);
    expect(dto.assignor.email).toBe(validData.assignor.email);
    expect(dto.assignor.phone).toBe(validData.assignor.phone);
    expect(dto.assignor.name).toBe(validData.assignor.name);
  });
});
