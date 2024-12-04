import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { MedicationService } from './medication.service';

@Controller('medication')
export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicationService.findOne(id);
  }

  @Post()
  async create() {
    return 'this endpoint must be implemented';
  }
}
