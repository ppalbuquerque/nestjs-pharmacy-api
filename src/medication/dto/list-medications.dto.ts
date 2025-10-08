import { ApiProperty } from '@nestjs/swagger';

export class ListMedicationDTO {
  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;
}
