import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMedicationDTO {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  chemicalComposition?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  stockAvailability?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shelfLocation?: string;

  @ApiProperty({ type: 'integer', required: false })
  @IsOptional()
  @IsInt()
  boxPrice?: number;

  @ApiProperty({ type: 'integer', required: false })
  @IsOptional()
  @IsInt()
  unitPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  usefulness?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dosageInstructions?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  samplePhotoUrl?: string;
}
