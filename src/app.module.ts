import { Module } from '@nestjs/common';
import { MedicationModule } from './medication/medication.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medication } from './medication/medication.entitity';

@Module({
  imports: [
    MedicationModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'pharma',
      entities: [Medication],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
