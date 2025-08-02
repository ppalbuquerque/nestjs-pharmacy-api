import { Module } from '@nestjs/common';
import { MedicationModule } from './medication/medication.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medication } from './medication/medication.entitity';
import { MedicationSubscriber } from './medication/medication.subscriber';
import { File } from './files/entities/file.entity';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MedicationModule,
    FilesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'pharma',
      entities: [Medication, File],
      subscribers: [MedicationSubscriber],
      synchronize: false,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
