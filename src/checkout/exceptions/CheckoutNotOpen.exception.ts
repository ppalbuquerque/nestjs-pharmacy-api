import { HttpException, HttpStatus } from '@nestjs/common';

export class CheckoutNotOpen extends HttpException {
  constructor() {
    super(
      { message: 'There is no open checkout', errorCode: '005' },
      HttpStatus.NOT_FOUND,
    );
  }
}
