import { HttpException, HttpStatus } from '@nestjs/common';

export class CheckoutIsOpen extends HttpException {
  constructor() {
    super(
      { message: 'Has a open checkout', errorCode: '001' },
      HttpStatus.FORBIDDEN,
    );
  }
}
