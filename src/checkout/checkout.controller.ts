import { Controller, Post } from '@nestjs/common';

import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post()
  async createCheckout() {
    return this.checkoutService.createCheckout();
  }
}
