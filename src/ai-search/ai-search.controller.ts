import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AiSearchService } from './ai-search.service';
import { GenerateResponseDTO } from './dto/generate-response.dto';

@Controller('ai-search')
export class AiSearchController {
  constructor(private aiSearchService: AiSearchService) {}

  @Get()
  async healthCheck() {
    return {
      status: 'ok',
      message: 'API is running',
      version: '0.1',
    };
  }

  @Post()
  async generateResponse(
    @Body() generateResponseDTO: GenerateResponseDTO,
    @Res() res: Response,
  ) {
    this.aiSearchService
      .getResponseOpenAi(generateResponseDTO)
      .pipeUIMessageStreamToResponse(res, {
        headers: {
          'Content-Encoding': 'none',
        },
      });
  }
}
