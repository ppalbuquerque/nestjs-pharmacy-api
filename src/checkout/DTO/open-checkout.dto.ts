import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OpenCheckoutDTO {
  @ApiProperty()
  @IsNumber()
  initialValue: number;
}
