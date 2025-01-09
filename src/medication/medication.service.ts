import { Injectable } from '@nestjs/common';
import { Medication } from '@prisma/client';
import { searchMedications } from '@prisma/client/sql';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.medication.findMany();
  }

  findOne(id: number) {
    return this.prisma.medication.findUnique({ where: { id } });
  }

  create(createMedicationDto: CreateMedicationDto) {
    return this.prisma.medication.create({ data: createMedicationDto });
  }

  async delete(id: number): Promise<Medication> {
    return this.prisma.medication.delete({ where: { id } });
  }

  async search(query: string): Promise<searchMedications.Result[]> {
    return this.prisma.$queryRawTyped(searchMedications(query));
  }
}
