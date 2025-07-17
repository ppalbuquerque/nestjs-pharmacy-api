import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Medication } from './medication.entitity';

import { CreateMedicationDto } from './dto/create-medication.dto';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
  ) {}

  list() {
    return this.medicationRepository.find();
  }

  findOne(id: number) {
    return this.medicationRepository.findOne({ where: { id } });
  }

  create(createMedicationDto: CreateMedicationDto) {
    const medication = this.medicationRepository.create(createMedicationDto);
    return this.medicationRepository.save(medication);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.medicationRepository.delete({ id });
  }

  // async search(query: string): Promise<searchMedications.Result[]> {
  //   return this.prisma.$queryRawTyped(searchMedications(query));
  // }
}
