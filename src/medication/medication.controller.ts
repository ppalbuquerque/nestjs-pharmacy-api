import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';

import { MedicationService } from './medication.service';
import { CreateMedicationDto } from './dto/create-medication.dto';

@Controller('medication')
export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  @Get()
  async findAll() {
    const result = await this.medicationService.list();
    console.log(result);
    return result;
  }

  // @Get('search')
  // async search(@Query('q') q: string) {
  //   try {
  //     return await this.medicationService.search(q);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicationService.findOne(id);
  }

  @Post()
  create(@Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationService.create(createMedicationDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.medicationService.delete(id);
    } catch (error: unknown) {
      throw new NotFoundException();
    }
  }
}
