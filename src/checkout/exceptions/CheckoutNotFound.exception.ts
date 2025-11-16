import { HttpException, HttpStatus } from '@nestjs/common';

export class CheckoutNotFound extends HttpException {
  constructor() {
    super(
      { message: 'Checkout has not been found', errorCode: '002' },
      HttpStatus.NOT_FOUND,
    );
  }
}
