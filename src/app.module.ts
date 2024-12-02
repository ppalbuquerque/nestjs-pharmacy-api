import { Module } from '@nestjs/common';
import { MedicationModule } from './medication/medication.module';

@Module({
  imports: [MedicationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
