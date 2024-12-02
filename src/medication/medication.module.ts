import { Module } from '@nestjs/common';
import { MedicationController } from './medication.controller';

@Module({
  controllers: [MedicationController],
})
export class MedicationModule {}
