import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { BatchPayablesRequestDto } from '../../../../src/modules/payables/dto/batch-payables-request.dto';
import { CreatePayableRequestDto } from '../../../../src/modules/payables/dto/create-payable-request.dto';

describe('BatchPayablesRequestDto', () => {
  it('transforms items into CreatePayableRequestDto instances via @Type(() => CreatePayableRequestDto)', () => {
    const plain = {
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          value: 123.45,
          emissionDate: '2025-08-30T00:00:00.000Z',
          assignor: {
            id: 'a1b2c3d4-e29b-41d4-a716-446655440000',
            name: 'Acme',
            document: '12345678000199',
            email: 'ops@acme.test',
            phone: '555-0000',
          },
        },
      ],
      notifyTo: 'ops@example.com',
    };

    const dto = plainToInstance(BatchPayablesRequestDto, plain);
    expect(Array.isArray(dto.items)).toBe(true);
    expect(dto.items[0]).toBeInstanceOf(CreatePayableRequestDto);
    expect(dto.notifyTo).toBe('ops@example.com');

    // Also validate to exercise ValidateNested each:true path
    const errors = validateSync(dto);
    expect(errors.length).toBe(0);
  });
});
