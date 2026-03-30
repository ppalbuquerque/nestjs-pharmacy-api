import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDTO } from './DTO/create-order.dto';
import { ListOrdersDTO } from './DTO/list-orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async listOrders(@Query() filters: ListOrdersDTO) {
    return this.ordersService.findAll(filters);
  }

  @Post()
  async createOrder(@Body() createOrderDTO: CreateOrderDTO) {
    return this.ordersService.create(createOrderDTO);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Put('cancel/:id')
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
