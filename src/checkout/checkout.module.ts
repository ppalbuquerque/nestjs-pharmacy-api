import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutEntity } from './checkout.entity';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService],
  imports: [TypeOrmModule.forFeature([CheckoutEntity])],
})
export class CheckoutModule {}
