import { Injectable } from '@nestjs/common';
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
}
