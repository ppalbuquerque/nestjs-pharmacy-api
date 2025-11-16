import { Body, Controller, Post } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CloseCheckoutDTO } from './DTO/close-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post()
  async createCheckout() {
    return this.checkoutService.create();
  }

  @Post('/close')
  async closeCheckout(@Body() closeCheckoutDTO: CloseCheckoutDTO) {
    return this.checkoutService.close(closeCheckoutDTO.checkoutId);
  }
}
