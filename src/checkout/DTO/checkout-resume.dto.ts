import { ApiProperty } from '@nestjs/swagger';

export class CheckoutResumeDTO {
  @ApiProperty({ description: 'Checkout opening timestamp' })
  openedAt: Date;

  @ApiProperty({ example: 500.0 })
  initialValue: number;

  @ApiProperty({ description: 'Total non-cancelled orders' })
  totalOrderCount: number;

  @ApiProperty({ description: 'Sum of non-cancelled order values' })
  totalOrdersValue: number;

  @ApiProperty({ description: 'totalOrdersValue + initialValue' })
  grandTotal: number;
}
