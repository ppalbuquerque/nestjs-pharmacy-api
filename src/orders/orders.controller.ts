import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDTO } from './DTO/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDTO: CreateOrderDTO) {
    return this.ordersService.create(createOrderDTO);
  }

  @Put('cancel/:id')
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
