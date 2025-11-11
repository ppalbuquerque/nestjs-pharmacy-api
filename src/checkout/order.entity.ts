import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { CheckoutEntity } from './checkout.entity';

export enum OrderStatus {
  COMPLETE = 'COMPLETE',
  CANCELLED = 'CANCELLED',
  PROCESSING = 'PROCESSING',
}

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  orderItems: OrderItemEntity[];

  @ManyToOne(() => CheckoutEntity, (checkout) => checkout.orders)
  checkout: CheckoutEntity;

  @Column({ type: 'decimal' })
  totalValue: number;

  @Column({ type: 'decimal' })
  paymentValue: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PROCESSING,
  })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
