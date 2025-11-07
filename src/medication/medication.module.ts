import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicationController } from './medication.controller';
import { MedicationService } from './medication.service';
import { Medication } from './medication.entitity';
import { AiSearchModule } from '../ai-search/ai-search.module';

@Module({
  controllers: [MedicationController],
  providers: [MedicationService],
  imports: [TypeOrmModule.forFeature([Medication]), AiSearchModule],
})
export class MedicationModule {}
