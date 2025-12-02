import { Body, Controller, Post } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CloseCheckoutDTO } from './DTO/close-checkout.dto';
import { OpenCheckoutDTO } from './DTO/open-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post()
  async createCheckout(@Body() openCheckoutDTO: OpenCheckoutDTO) {
    return this.checkoutService.create(openCheckoutDTO.initialValue);
  }

  @Post('/close')
  async closeCheckout(@Body() closeCheckoutDTO: CloseCheckoutDTO) {
    return this.checkoutService.close(closeCheckoutDTO.checkoutId);
  }
}
