import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MedicationModule } from './medication/medication.module';
import { Medication } from './medication/medication.entitity';
import { MedicationSubscriber } from './medication/medication.subscriber';

import { File } from './files/entities/file.entity';
import { FilesModule } from './files/files.module';

import { AiSearchModule } from './ai-search/ai-search.module';

import { CheckoutModule } from './checkout/checkout.module';
import { CheckoutEntity } from './checkout/checkout.entity';
import { OrderItemEntity } from './checkout/order-item.entity';
import { OrderEntity } from './checkout/order.entity';

@Module({
  imports: [
    MedicationModule,
    FilesModule,
    AiSearchModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || ''),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Medication,
          File,
          CheckoutEntity,
          OrderEntity,
          OrderItemEntity,
        ],
        subscribers: [MedicationSubscriber],
        synchronize: false,
        ssl: true,
      }),
    }),
    CheckoutModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
