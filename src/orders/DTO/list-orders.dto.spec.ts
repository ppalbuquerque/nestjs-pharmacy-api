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
});
