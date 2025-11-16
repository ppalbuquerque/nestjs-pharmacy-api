import { ApiProperty } from '@nestjs/swagger';

export class CloseCheckoutDTO {
  @ApiProperty()
  checkoutId: string;
}
