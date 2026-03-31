import { Body, Controller, Get, Post } from '@nestjs/common';

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

  @Get('/resume')
  async getCheckoutResume() {
    return this.checkoutService.resume();
  }

  @Post('/close')
  async closeCheckout(@Body() closeCheckoutDTO: CloseCheckoutDTO) {
    return this.checkoutService.close(
      closeCheckoutDTO.checkoutId,
      closeCheckoutDTO.closingValue,
    );
  }
}
