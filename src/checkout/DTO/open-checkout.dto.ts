import { ApiProperty } from '@nestjs/swagger';

export class OpenCheckoutDTO {
  @ApiProperty()
  initialValue: number;
}
