import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderItemEntity } from './order-item.entity';
import { CheckoutEntity } from 'src/checkout/checkout.entity';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, CheckoutEntity]),
  ],
})
export class OrdersModule {}
