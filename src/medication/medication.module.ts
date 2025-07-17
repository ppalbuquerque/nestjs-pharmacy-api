import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicationController } from './medication.controller';
import { MedicationService } from './medication.service';
import { Medication } from './medication.entitity';

@Module({
  controllers: [MedicationController],
  providers: [MedicationService],
  imports: [TypeOrmModule.forFeature([Medication])],
})
export class MedicationModule {}
