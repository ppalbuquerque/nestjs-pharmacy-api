import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateOrderDTO } from './create-order.dto';
import { BoxType } from './order-item.dto';

const validPayload = {
  paymentValue: 5000,
  orderItems: [
    { amount: 2, medicationId: '11', totalValue: 4900, boxType: 'box' },
  ],
};

const buildDto = (payload: unknown) => plainToInstance(CreateOrderDTO, payload);

describe('CreateOrderDTO', () => {
  it('aceita o payload válido (caso do bug report)', async () => {
    const errors = await validate(buildDto(validPayload));
    expect(errors).toHaveLength(0);
  });

  it('rejeita quando paymentValue está ausente', async () => {
    const { paymentValue, ...rest } = validPayload;
    const errors = await validate(buildDto(rest));
    expect(errors.some((e) => e.property === 'paymentValue')).toBe(true);
  });

  it('rejeita paymentValue negativo', async () => {
    const errors = await validate(
      buildDto({ ...validPayload, paymentValue: -1 }),
    );
    expect(errors.some((e) => e.property === 'paymentValue')).toBe(true);
  });

  it('rejeita orderItems vazio', async () => {
    const errors = await validate(
      buildDto({ ...validPayload, orderItems: [] }),
    );
    expect(errors.some((e) => e.property === 'orderItems')).toBe(true);
  });

  it('rejeita item com boxType inválido (validação aninhada)', async () => {
    const errors = await validate(
      buildDto({
        ...validPayload,
        orderItems: [{ ...validPayload.orderItems[0], boxType: 'pouch' }],
      }),
    );
    expect(errors.some((e) => e.property === 'orderItems')).toBe(true);
  });

  it('rejeita item com amount menor que 1', async () => {
    const errors = await validate(
      buildDto({
        ...validPayload,
        orderItems: [{ ...validPayload.orderItems[0], amount: 0 }],
      }),
    );
    expect(errors.some((e) => e.property === 'orderItems')).toBe(true);
  });

  it('rejeita item com totalValue negativo', async () => {
    const errors = await validate(
      buildDto({
        ...validPayload,
        orderItems: [{ ...validPayload.orderItems[0], totalValue: -1 }],
      }),
    );
    expect(errors.some((e) => e.property === 'orderItems')).toBe(true);
  });

  it('aceita ambos os boxType válidos', async () => {
    const errors = await validate(
      buildDto({
        ...validPayload,
        orderItems: [{ ...validPayload.orderItems[0], boxType: BoxType.UNIT }],
      }),
    );
    expect(errors).toHaveLength(0);
  });
});
