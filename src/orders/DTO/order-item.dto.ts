import { ApiProperty } from '@nestjs/swagger';

export enum BoxType {
  BOX = 'box',
  UNIT = 'unit',
}

export class OrderItemDto {
  @ApiProperty({
    description: 'ID do medicamento',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  medicationId: string;

  @ApiProperty({
    description: 'Quantidade do medicamento',
    example: 10,
    type: 'integer',
  })
  amount: number;

  @ApiProperty({
    description: 'Valor total do item',
    example: 150.5,
    type: 'number',
    format: 'decimal',
  })
  totalValue: number;

  @ApiProperty({
    description: 'Tipo de embalagem do medicamento',
    enum: BoxType,
    enumName: 'BoxType',
    example: BoxType.UNIT,
    default: BoxType.UNIT,
  })
  boxType: BoxType;
}
