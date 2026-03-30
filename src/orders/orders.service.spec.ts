import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrderEntity, OrderStatus } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { CheckoutEntity } from '../checkout/checkout.entity';
import { CheckoutIsClosed } from '../checkout/exceptions/CheckoutIsClosed.exception';
import { OrderNotFound } from './exceptions/OrderNotFound.exception';
import { BoxType } from './DTO/order-item.dto';

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockOrdersRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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
    jest.clearAllMocks();
    mockOrdersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.select.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.skip.mockReturnThis();
    mockQueryBuilder.take.mockReturnThis();

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

  describe('findAll()', () => {
    const mockOrders = [
      { id: 'uuid-1', totalValue: 100, status: OrderStatus.COMPLETE, createdAt: new Date('2026-01-01') },
      { id: 'uuid-2', totalValue: 200, status: OrderStatus.CANCELLED, createdAt: new Date('2026-01-02') },
    ];

    it('should return paginated orders with default limit and offset', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);

      const result = await service.findAll({});

      expect(mockOrdersRepository.createQueryBuilder).toHaveBeenCalledWith('order');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({ orders: mockOrders, total: 2, limit: 10, offset: 0 });
    });

    it('should apply custom limit and offset', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ limit: 5, offset: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('should filter by status', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockOrders[0]], 1]);

      await service.findAll({ status: OrderStatus.COMPLETE });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status: OrderStatus.COMPLETE },
      );
    });

    it('should filter by checkoutId', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);
      const checkoutId = 'checkout-uuid';

      await service.findAll({ checkoutId });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.checkoutId = :checkoutId',
        { checkoutId },
      );
    });

    it('should filter by createdAtFrom', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);
      const createdAtFrom = '2026-01-01T00:00:00.000Z';

      await service.findAll({ createdAtFrom });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.createdAt >= :createdAtFrom',
        { createdAtFrom },
      );
    });

    it('should filter by createdAtTo', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);
      const createdAtTo = '2026-01-31T23:59:59.000Z';

      await service.findAll({ createdAtTo });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.createdAt <= :createdAtTo',
        { createdAtTo },
      );
    });

    it('should filter by date range applying both from and to', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockOrders, 2]);
      const createdAtFrom = '2026-01-01T00:00:00.000Z';
      const createdAtTo = '2026-01-31T23:59:59.000Z';

      await service.findAll({ createdAtFrom, createdAtTo });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.createdAt >= :createdAtFrom',
        { createdAtFrom },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.createdAt <= :createdAtTo',
        { createdAtTo },
      );
    });

    it('should not apply andWhere when no filters are provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
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
