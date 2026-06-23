import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { ListOrdersDTO, OrderSort } from './list-orders.dto';

describe('ListOrdersDTO', () => {
  describe('sort', () => {
    it('should accept a valid sort value', async () => {
      const dto = plainToInstance(ListOrdersDTO, {
        sort: OrderSort.TOTAL_VALUE_ASC,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should be valid when sort is omitted (optional)', async () => {
      const dto = plainToInstance(ListOrdersDTO, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should report an error for an invalid sort value', async () => {
      const dto = plainToInstance(ListOrdersDTO, { sort: 'foo' });

      const errors = await validate(dto);

      const sortError = errors.find((error) => error.property === 'sort');
      expect(sortError).toBeDefined();
      expect(sortError?.constraints).toHaveProperty('isEnum');
    });
  });

  describe('createdAt range', () => {
    const from = '2026-01-01T00:00:00.000Z';
    const to = '2026-01-31T23:59:59.000Z';

    it('should be valid when both dates are omitted', async () => {
      const dto = plainToInstance(ListOrdersDTO, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should require createdAtTo when only createdAtFrom is provided', async () => {
      const dto = plainToInstance(ListOrdersDTO, { createdAtFrom: from });

      const errors = await validate(dto);

      const toError = errors.find((error) => error.property === 'createdAtTo');
      expect(toError).toBeDefined();
      expect(toError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should require createdAtFrom when only createdAtTo is provided', async () => {
      const dto = plainToInstance(ListOrdersDTO, { createdAtTo: to });

      const errors = await validate(dto);

      const fromError = errors.find(
        (error) => error.property === 'createdAtFrom',
      );
      expect(fromError).toBeDefined();
      expect(fromError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should report an error when createdAtFrom is greater than createdAtTo', async () => {
      const dto = plainToInstance(ListOrdersDTO, {
        createdAtFrom: to,
        createdAtTo: from,
      });

      const errors = await validate(dto);

      const toError = errors.find((error) => error.property === 'createdAtTo');
      expect(toError).toBeDefined();
      expect(toError?.constraints).toHaveProperty('isDateRangeOrdered');
    });

    it('should be valid when createdAtFrom equals createdAtTo', async () => {
      const dto = plainToInstance(ListOrdersDTO, {
        createdAtFrom: from,
        createdAtTo: from,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should be valid when createdAtFrom is less than createdAtTo', async () => {
      const dto = plainToInstance(ListOrdersDTO, {
        createdAtFrom: from,
        createdAtTo: to,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});
