import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export enum BoxType {
  BOX = 'box',
  UNIT = 'unit',
}

export class OrderItemDto {
  @ApiProperty({
    description: 'ID do medicamento',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsString()
  @IsNotEmpty()
  medicationId: string;

  @ApiProperty({
    description: 'Quantidade do medicamento',
    example: 10,
    type: 'integer',
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Valor total do item',
    example: 150.5,
    type: 'number',
    format: 'decimal',
  })
  @IsNumber()
  @Min(0)
  totalValue: number;

  @ApiProperty({
    description: 'Tipo de embalagem do medicamento',
    enum: BoxType,
    enumName: 'BoxType',
    example: BoxType.UNIT,
    default: BoxType.UNIT,
  })
  @IsEnum(BoxType)
  boxType: BoxType;
}
