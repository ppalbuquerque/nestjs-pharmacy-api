import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CheckoutEntity } from './checkout.entity';
import { CheckoutIsOpen } from './exceptions/CheckoutIsOpen.exception';
import { CheckoutNotFound } from './exceptions/CheckoutNotFound.exception';
import { CheckoutIsClosed } from './exceptions/CheckoutIsClosed.exception';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(CheckoutEntity)
    private checkoutRepository: Repository<CheckoutEntity>,
  ) {}

  async create() {
    const checkoutOpened = await this.checkoutRepository.findOneBy({
      isOpen: true,
    });

    if (checkoutOpened) throw new CheckoutIsOpen();

    const checkout = this.checkoutRepository.create({
      isOpen: true,
    });

    return this.checkoutRepository.save(checkout);
  }

  async close(checkoutId: string) {
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

    return this.checkoutRepository.save(checkout);
  }
}
