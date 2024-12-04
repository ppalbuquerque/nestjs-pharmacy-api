import { Module } from '@nestjs/common';
import { MedicationModule } from './medication/medication.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [MedicationModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
