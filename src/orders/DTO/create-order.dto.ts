import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDTO {
  @ApiProperty()
  paymentValue: number;

  @ApiProperty({
    description: 'Array com os itens da venda',
    type: OrderItemDto,
    isArray: true,
  })
  orderItems: OrderItemDto[];
}
