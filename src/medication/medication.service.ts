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

  list(): Promise<Medication[]> {
    return this.medicationRepository.find();
  }

  findOne(id: number): Promise<Medication | null> {
    return this.medicationRepository.findOne({ where: { id } });
  }

  create(createMedicationDto: CreateMedicationDto): Promise<Medication> {
    const medication = this.medicationRepository.create(createMedicationDto);
    return this.medicationRepository.save(medication);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.medicationRepository.delete({ id });
  }

  async search(query: string): Promise<Medication[]> {
    const result = await this.medicationRepository.query(
      `
      select * from medication where full_text_search @@ to_tsquery('portuguese', unaccent($1))
      UNION
      select * from medication where name ilike $2
      UNION
      select * from medication where chemical_composition ilike $2
      UNION
      select * from medication where $1 % usefulness;
    `,
      [query, `%${query}%`],
    );

    return result;
  }
}
