import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateMedicationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  chemicalComposition: string;

  @ApiProperty()
  @IsNumber()
  stockAvailability: number;

  @ApiProperty()
  @IsString()
  shelfLocation: string;

  @ApiProperty()
  @IsNumber()
  boxPrice: number;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsString()
  usefulness: string;

  @ApiProperty()
  @IsString()
  dosageInstructions: string;

  @ApiProperty()
  @IsString()
  samplePhotoUrl: string;
}
