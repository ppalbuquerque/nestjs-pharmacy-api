import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CheckoutEntity } from 'src/checkout/checkout.entity';
import { CheckoutIsClosed } from 'src/checkout/exceptions/CheckoutIsClosed.exception';

import { OrderEntity, OrderStatus } from './order.entity';
import { CreateOrderDTO } from './DTO/create-order.dto';
import { OrderItemEntity } from './order-item.entity';
import { OrderNotFound } from './exceptions/OrderNotFound.exception';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(CheckoutEntity)
    private checkoutRepository: Repository<CheckoutEntity>,
  ) {}

  async create(createOrderDTO: CreateOrderDTO) {
    const { orderItems, paymentValue } = createOrderDTO;

    const checkout = await this.checkoutRepository.findOneBy({ isOpen: true });

    if (!checkout) {
      throw new CheckoutIsClosed();
    }

    const newOrderItens = orderItems.map((orderItem) => {
      return this.orderItemRepository.create({
        amount: orderItem.amount,
        boxType: orderItem.boxType,
        medication: { id: parseInt(orderItem.medicationId, 10) },
        totalValue: orderItem.totalValue,
      });
    });

    const orderTotalValue = newOrderItens.reduce((sum, orderItem) => {
      return sum + orderItem.totalValue;
    }, 0);

    const newOrder = this.ordersRepository.create({
      paymentValue,
      checkout,
      orderItems: newOrderItens,
      totalValue: orderTotalValue,
      status: OrderStatus.COMPLETE,
    });

    return this.ordersRepository.save(newOrder);
  }

  async cancel(orderId: string) {
    const order = await this.ordersRepository.findOneBy({
      id: orderId,
    });

    if (!order || order.status === OrderStatus.CANCELLED) {
      throw new OrderNotFound();
    }

    await this.ordersRepository.update(
      {
        id: orderId,
      },
      { status: OrderStatus.CANCELLED },
    );

    return { message: 'Order cancelled with success' };
  }
}
