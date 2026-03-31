import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CheckoutService } from './checkout.service';
import { CheckoutEntity } from './checkout.entity';
import { CheckoutIsOpen } from './exceptions/CheckoutIsOpen.exception';
import { CheckoutNotFound } from './exceptions/CheckoutNotFound.exception';
import { CheckoutIsClosed } from './exceptions/CheckoutIsClosed.exception';
import { CheckoutNotOpen } from './exceptions/CheckoutNotOpen.exception';
import { CheckoutDoesNotExist } from './exceptions/CheckoutDoesNotExist.exception';

const mockQueryBuilder = {
  leftJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  getRawOne: jest.fn(),
};

const mockCheckoutRepository = {
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockCheckoutRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.leftJoin.mockReturnThis();
    mockQueryBuilder.select.mockReturnThis();
    mockQueryBuilder.addSelect.mockReturnThis();
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.groupBy.mockReturnThis();
    mockQueryBuilder.addGroupBy.mockReturnThis();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: getRepositoryToken(CheckoutEntity),
          useValue: mockCheckoutRepository,
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  describe('create()', () => {
    it('should throw CheckoutIsOpen when a checkout is already open', async () => {
      mockCheckoutRepository.findOneBy.mockResolvedValue({
        id: 'uuid-1',
        isOpen: true,
      });

      await expect(service.create(500)).rejects.toThrow(CheckoutIsOpen);
    });

    it('should create and return a new checkout when none is open', async () => {
      const mockCheckout = { id: 'uuid-1', isOpen: true, initialValue: 500 };
      mockCheckoutRepository.findOneBy.mockResolvedValue(null);
      mockCheckoutRepository.create.mockReturnValue(mockCheckout);
      mockCheckoutRepository.save.mockResolvedValue(mockCheckout);

      const result = await service.create(500);

      expect(mockCheckoutRepository.create).toHaveBeenCalledWith({
        isOpen: true,
        initialValue: 500,
      });
      expect(mockCheckoutRepository.save).toHaveBeenCalledWith(mockCheckout);
      expect(result).toEqual(mockCheckout);
    });
  });

  describe('close()', () => {
    it('should throw CheckoutNotFound when checkout does not exist', async () => {
      mockCheckoutRepository.findOneBy.mockResolvedValue(null);

      await expect(service.close('non-existent-id', null)).rejects.toThrow(
        CheckoutNotFound,
      );
    });

    it('should throw CheckoutIsClosed when checkout is already closed', async () => {
      mockCheckoutRepository.findOneBy.mockResolvedValue({
        id: 'uuid-1',
        isOpen: false,
      });

      await expect(service.close('uuid-1', null)).rejects.toThrow(
        CheckoutIsClosed,
      );
    });

    it('should set isOpen=false, closedAt, and closingValue before saving', async () => {
      const mockCheckout: Partial<CheckoutEntity> = {
        id: 'uuid-1',
        isOpen: true,
        initialValue: 500,
      };
      mockCheckoutRepository.findOneBy.mockResolvedValue(mockCheckout);
      mockCheckoutRepository.save.mockResolvedValue({
        ...mockCheckout,
        isOpen: false,
      });

      await service.close('uuid-1', 150);

      expect(mockCheckoutRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isOpen: false, closingValue: 150 }),
      );
      expect(mockCheckout.closedAt).toBeInstanceOf(Date);
    });
  });

  describe('resume()', () => {
    it('should throw CheckoutNotOpen when no open checkout exists', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      await expect(service.resume()).rejects.toThrow(CheckoutNotOpen);
    });

    it('should return the correct resume when open checkout has orders', async () => {
      const openedAt = new Date('2026-01-01T08:00:00Z');
      mockQueryBuilder.getRawOne.mockResolvedValue({
        id: 'uuid-1',
        openedAt,
        initialValue: '500.00',
        totalOrderCount: '3',
        totalOrdersValue: '300.00',
      });

      const result = await service.resume();

      expect(result).toEqual({
        openedAt,
        initialValue: 500,
        totalOrderCount: 3,
        totalOrdersValue: 300,
        grandTotal: 800,
      });
    });

    it('should return grandTotal equal to initialValue when there are no orders', async () => {
      const openedAt = new Date('2026-01-01T08:00:00Z');
      mockQueryBuilder.getRawOne.mockResolvedValue({
        id: 'uuid-1',
        openedAt,
        initialValue: '500.00',
        totalOrderCount: '0',
        totalOrdersValue: '0',
      });

      const result = await service.resume();

      expect(result).toEqual({
        openedAt,
        initialValue: 500,
        totalOrderCount: 0,
        totalOrdersValue: 0,
        grandTotal: 500,
      });
    });
  });

  describe('getStatus()', () => {
    it('should throw CheckoutDoesNotExist when no checkouts exist', async () => {
      mockCheckoutRepository.find.mockResolvedValue([]);

      await expect(service.getStatus()).rejects.toThrow(CheckoutDoesNotExist);
    });

    it('should return id, isOpen, createdAt, updatedAt and closedAt of the most recent checkout', async () => {
      const mockCheckout = {
        id: 'uuid-1',
        isOpen: false,
        createdAt: new Date('2026-01-01T08:00:00Z'),
        updatedAt: new Date('2026-01-01T18:00:00Z'),
        closedAt: new Date('2026-01-01T18:00:00Z'),
      };
      mockCheckoutRepository.find.mockResolvedValue([mockCheckout]);

      const result = await service.getStatus();

      expect(mockCheckoutRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 1,
      });
      expect(result).toEqual({
        id: mockCheckout.id,
        isOpen: mockCheckout.isOpen,
        createdAt: mockCheckout.createdAt,
        updatedAt: mockCheckout.updatedAt,
        closedAt: mockCheckout.closedAt,
      });
    });
  });
});
