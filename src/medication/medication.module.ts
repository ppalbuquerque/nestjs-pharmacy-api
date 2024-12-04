import { Module } from '@nestjs/common';
import { MedicationController } from './medication.controller';
import { MedicationService } from './medication.service';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  controllers: [MedicationController],
  providers: [MedicationService],
  imports: [PrismaModule],
})
export class MedicationModule {}
