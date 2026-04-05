import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

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

  @ApiProperty({ type: 'integer' })
  @IsInt()
  boxPrice: number;

  @ApiProperty({ type: 'integer' })
  @IsInt()
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
