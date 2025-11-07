import { Controller, Post, Body, Get } from '@nestjs/common';

import { AiSearchService } from './ai-search.service';
import { GenerateResponseDTO } from './dto/generate-response.dto';

@Controller('ai-search')
export class AiSearchController {
  constructor(private aiSearchService: AiSearchService) {}

  @Get()
  async healCheck() {
    return { content: 'Api is running' };
  }

  @Post()
  async generateResponse(@Body() generateResponseDTO: GenerateResponseDTO) {
    return this.aiSearchService.getResponseOpenAi(generateResponseDTO);
  }
}
