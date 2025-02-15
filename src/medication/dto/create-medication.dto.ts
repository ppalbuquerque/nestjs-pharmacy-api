import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  chemicalComposition: string;

  @ApiProperty()
  stockAvailability: number;

  @ApiProperty()
  shelfLocation: string;

  @ApiProperty()
  boxPrice: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  usefulness: string;

  @ApiProperty()
  dosageInstructions: string;

  @ApiProperty()
  samplePhotoUrl: string;
}
