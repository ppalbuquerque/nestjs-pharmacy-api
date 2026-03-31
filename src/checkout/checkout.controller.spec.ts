import { Test, TestingModule } from '@nestjs/testing';

import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutNotOpen } from './exceptions/CheckoutNotOpen.exception';
import { CheckoutDoesNotExist } from './exceptions/CheckoutDoesNotExist.exception';

const mockCheckoutService = {
  create: jest.fn(),
  close: jest.fn(),
  resume: jest.fn(),
  getStatus: jest.fn(),
};

describe('CheckoutController', () => {
  let controller: CheckoutController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: mockCheckoutService,
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
  });

  describe('createCheckout()', () => {
    it('should call service.create with initialValue and return result', async () => {
      const mockResult = { id: 'uuid-1', isOpen: true, initialValue: 500 };
      mockCheckoutService.create.mockResolvedValue(mockResult);

      const result = await controller.createCheckout({ initialValue: 500 });

      expect(mockCheckoutService.create).toHaveBeenCalledWith(500);
      expect(result).toEqual(mockResult);
    });
  });

  describe('closeCheckout()', () => {
    it('should call service.close with checkoutId and closingValue and return result', async () => {
      const mockResult = { id: 'uuid-1', isOpen: false, closingValue: 150 };
      mockCheckoutService.close.mockResolvedValue(mockResult);

      const result = await controller.closeCheckout({
        checkoutId: 'uuid-1',
        closingValue: 150,
      });

      expect(mockCheckoutService.close).toHaveBeenCalledWith('uuid-1', 150);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getCheckoutResume()', () => {
    it('should call service.resume and return result', async () => {
      const mockResult = {
        openedAt: new Date('2026-01-01'),
        initialValue: 500,
        totalOrderCount: 3,
        totalOrdersValue: 300,
        grandTotal: 800,
      };
      mockCheckoutService.resume.mockResolvedValue(mockResult);

      const result = await controller.getCheckoutResume();

      expect(mockCheckoutService.resume).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should propagate CheckoutNotOpen exception from service', async () => {
      mockCheckoutService.resume.mockRejectedValue(new CheckoutNotOpen());

      await expect(controller.getCheckoutResume()).rejects.toThrow(CheckoutNotOpen);
    });
  });

  describe('getCheckoutStatus()', () => {
    it('should call service.getStatus and return result', async () => {
      const mockResult = {
        id: 'uuid-1',
        isOpen: false,
        createdAt: new Date('2026-01-01T08:00:00Z'),
        updatedAt: new Date('2026-01-01T18:00:00Z'),
        closedAt: new Date('2026-01-01T18:00:00Z'),
      };
      mockCheckoutService.getStatus.mockResolvedValue(mockResult);

      const result = await controller.getCheckoutStatus();

      expect(mockCheckoutService.getStatus).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should propagate CheckoutDoesNotExist exception from service', async () => {
      mockCheckoutService.getStatus.mockRejectedValue(new CheckoutDoesNotExist());

      await expect(controller.getCheckoutStatus()).rejects.toThrow(CheckoutDoesNotExist);
    });
  });
});
