import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderEntity } from './order.entity';
import { Medication } from '../medication/medication.entitity';

export enum BoxType {
  BOX = 'box',
  UNIT = 'unit',
}

@Entity()
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems)
  order: OrderEntity;

  @ManyToOne(() => Medication)
  medication: Medication;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'decimal' })
  totalValue: number;

  @Column({ type: 'enum', enum: BoxType, default: BoxType.UNIT })
  boxType: BoxType;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
