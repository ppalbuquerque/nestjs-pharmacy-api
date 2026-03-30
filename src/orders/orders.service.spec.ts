import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { CheckoutEntity } from '../checkout/checkout.entity';
import { CheckoutIsClosed } from '../checkout/exceptions/CheckoutIsClosed.exception';
import { OrderNotFound } from './exceptions/OrderNotFound.exception';
import { BoxType } from './DTO/order-item.dto';

const mockOrdersRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockOrderItemRepository = {
  create: jest.fn(),
};

const mockCheckoutRepository = {
  findOneBy: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrdersRepository,
        },
        {
          provide: getRepositoryToken(OrderItemEntity),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(CheckoutEntity),
          useValue: mockCheckoutRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should throw CheckoutIsClosed when there is no open checkout', async () => {
      mockCheckoutRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({
          paymentValue: 100,
          orderItems: [
            {
              medicationId: '1',
              amount: 1,
              boxType: BoxType.UNIT,
              totalValue: 50,
            },
          ],
        }),
      ).rejects.toThrow(CheckoutIsClosed);
    });
  });

  describe('cancel()', () => {
    it('should throw OrderNotFound when order does not exist', async () => {
      mockOrdersRepository.findOneBy.mockResolvedValue(null);

      await expect(service.cancel('non-existent-uuid')).rejects.toThrow(
        OrderNotFound,
      );
    });
  });
});
