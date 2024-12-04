import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  findOne(id: number) {
    return this.prisma.medication.findUnique({ where: { id } });
  }
}
