import { Controller, Post } from '@nestjs/common';

@Controller('medication')
export class MedicationController {
  @Post()
  async create() {
    return 'this endpoint must be implemented';
  }
}
