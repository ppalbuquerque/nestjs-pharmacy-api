import { HttpException, HttpStatus } from '@nestjs/common';

export class CheckoutIsClosed extends HttpException {
  constructor() {
    super(
      { message: 'The checkout is already closed', errorCode: '003' },
      HttpStatus.FORBIDDEN,
    );
  }
}
