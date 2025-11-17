import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderNotFound extends HttpException {
  constructor() {
    super(
      { message: 'Order has not been found', errorCode: '004' },
      HttpStatus.NOT_FOUND,
    );
  }
}
