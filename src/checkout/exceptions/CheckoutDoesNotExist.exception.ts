import { HttpException, HttpStatus } from '@nestjs/common';

export class CheckoutDoesNotExist extends HttpException {
  constructor() {
    super(
      { message: 'There are no checkouts', errorCode: '006' },
      HttpStatus.NOT_FOUND,
    );
  }
}
