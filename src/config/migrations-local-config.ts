import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

import { Medication } from '../medication/medication.entitity';
import { File } from '../files/entities/file.entity';
import { CheckoutEntity } from '../checkout/checkout.entity';
import { OrderItemEntity } from '../orders/order-item.entity';
import { OrderEntity } from '../orders/order.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT') || ''),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASS'),
  database: configService.get<string>('DB_NAME'),
  entities: [Medication, File, CheckoutEntity, OrderItemEntity, OrderEntity],
  migrations: ['src/db/migrations/*{.ts,.js}'],
  synchronize: true,
  ssl: true,
});
