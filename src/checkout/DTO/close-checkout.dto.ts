import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CloseCheckoutDTO {
  @ApiProperty()
  @IsUUID()
  checkoutId: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  closingValue: number | null;
}
