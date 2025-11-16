import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CheckoutEntity } from './checkout.entity';
import { Repository } from 'typeorm';
import { CheckoutIsOpen } from './exceptions/CheckoutIsOpen.exception';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(CheckoutEntity)
    private checkoutRepository: Repository<CheckoutEntity>,
  ) {}

  async createCheckout() {
    const checkoutOpened = await this.checkoutRepository.findOneBy({
      isOpen: true,
    });

    if (checkoutOpened) throw new CheckoutIsOpen();

    const checkout = this.checkoutRepository.create({
      isOpen: true,
    });

    return this.checkoutRepository.save(checkout);
  }
}
