import { ApiProperty } from '@nestjs/swagger';

export class GenerateResponseDTO {
  @ApiProperty()
  prompt: string;
}
