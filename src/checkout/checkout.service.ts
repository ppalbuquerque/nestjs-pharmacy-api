import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CheckoutEntity } from './checkout.entity';
import { CheckoutIsOpen } from './exceptions/CheckoutIsOpen.exception';
import { CheckoutNotFound } from './exceptions/CheckoutNotFound.exception';
import { CheckoutIsClosed } from './exceptions/CheckoutIsClosed.exception';
import { CheckoutNotOpen } from './exceptions/CheckoutNotOpen.exception';
import { CheckoutDoesNotExist } from './exceptions/CheckoutDoesNotExist.exception';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(CheckoutEntity)
    private checkoutRepository: Repository<CheckoutEntity>,
  ) {}

  async create(initialValue: number) {
    const checkoutOpened = await this.checkoutRepository.findOneBy({
      isOpen: true,
    });

    if (checkoutOpened) throw new CheckoutIsOpen();

    const checkout = this.checkoutRepository.create({
      isOpen: true,
      initialValue,
    });

    return this.checkoutRepository.save(checkout);
  }

  async close(checkoutId: string, closingValue: number | null) {
    const checkout = await this.checkoutRepository.findOneBy({
      id: checkoutId,
    });

    if (!checkout) {
      throw new CheckoutNotFound();
    }

    if (!checkout.isOpen) {
      throw new CheckoutIsClosed();
    }

    checkout.isOpen = false;
    checkout.closedAt = new Date();
    checkout.closingValue = closingValue;

    return this.checkoutRepository.save(checkout);
  }

  async resume() {
    const raw = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoin('checkout.orders', 'order')
      .select('checkout.id', 'id')
      .addSelect('checkout.createdAt', 'openedAt')
      .addSelect('checkout.initialValue', 'initialValue')
      .addSelect(
        `COUNT(CASE WHEN order.status != 'CANCELLED' THEN 1 END)`,
        'totalOrderCount',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN order.status != 'CANCELLED' THEN order.totalValue ELSE 0 END), 0)`,
        'totalOrdersValue',
      )
      .where('checkout.isOpen = :isOpen', { isOpen: true })
      .groupBy('checkout.id')
      .addGroupBy('checkout.createdAt')
      .addGroupBy('checkout.initialValue')
      .getRawOne();

    if (!raw) throw new CheckoutNotOpen();

    const totalOrdersValue = Number(raw.totalOrdersValue);
    const initialValue = Number(raw.initialValue);

    return {
      openedAt: raw.openedAt,
      initialValue,
      totalOrderCount: Number(raw.totalOrderCount),
      totalOrdersValue,
      grandTotal: totalOrdersValue + initialValue,
    };
  }

  async getStatus() {
    const [checkout] = await this.checkoutRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    if (!checkout) throw new CheckoutDoesNotExist();

    return {
      id: checkout.id,
      isOpen: checkout.isOpen,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
      closedAt: checkout.closedAt,
    };
  }
}
