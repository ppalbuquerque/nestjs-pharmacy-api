import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderEntity } from '../orders/order.entity';

@Entity()
export class CheckoutEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bool', default: true })
  isOpen: boolean;

  @OneToMany(() => OrderEntity, (order) => order.checkout)
  orders: OrderEntity[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'intial_value',
    default: 0,
  })
  initialValue: number;

  @Column({ type: 'date', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
