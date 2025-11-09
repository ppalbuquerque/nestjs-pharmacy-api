import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { embed, streamText, stepCountIs, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

import { GenerateResponseDTO } from './dto/generate-response.dto';
import { Medication } from 'src/medication/medication.entitity';
import { SaveMedicationEmbeddingDTO } from './dto/save-medication-embedding.dto';

@Injectable()
export class AiSearchService {
  constructor(
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
    private dataSource: DataSource,
  ) {}

  async generateEmbedding(content: string) {
    const { embedding } = await embed({
      model: openai.textEmbeddingModel('text-embedding-3-small'),
      value: content,
    });

    return embedding;
  }

  async saveMedicationEmbedding(
    saveMedicationEmbeddingDTO: SaveMedicationEmbeddingDTO,
  ) {
    const textForEmbedding = `
      Nome: ${saveMedicationEmbeddingDTO.medicationName}
      Composição: ${saveMedicationEmbeddingDTO.chemicalComposition}
      Utilidade: ${saveMedicationEmbeddingDTO.medicationUsefulness}
      Tem no estoque: ${saveMedicationEmbeddingDTO.stock > 0 ? 'Sim' : 'Não'}
    `;

    const embedding = await this.generateEmbedding(textForEmbedding);

    const embeddingString = `[${embedding.join(',')}]`;

    await this.dataSource.query(
      `
        INSERT INTO medication_embeddings (content, embedding) VALUES ($1, $2)`,
      [textForEmbedding, embeddingString],
    );
  }

  private async _safeToolCall(toolName: string): Promise<Medication[]> {
    if (toolName === 'getMedications') {
      const medications = await this.medicationRepository.find();
      return medications;
    }

    return [];
  }

  private async getResource(prompt: string) {
    const { embedding } = await embed({
      model: openai.textEmbeddingModel('text-embedding-3-small'),
      value: prompt,
    });

    const embeddingString = `[${embedding.join(',')}]`;
    const similarityTreshold = 0.5;
    const medicationLimit = 3;

    const data = await this.dataSource.query(
      `SELECT id, content, similarity FROM vector_search($1, $2, $3)`,
      [embeddingString, similarityTreshold, medicationLimit],
    );

    return {
      data,
    };
  }

  getResponseOpenAi(generateResponseDTO: GenerateResponseDTO) {
    const result = streamText({
      model: openai('gpt-4.1-nano-2025-04-14'),
      prompt: generateResponseDTO.prompt,
      maxOutputTokens: 200,
      stopWhen: stepCountIs(5),
      system: `You are a helpful assistant. Check your knowledge base before answering any questions.
        Only respond to questions using information from tool calls.
        if no relevant information is found in the tool calls, respond, "Não existe medicamento na farmácia para sua pergunta"`,
      tools: {
        getInformation: tool({
          description:
            'get information from your knowledge base to answer questions.',
          inputSchema: z.object({
            question: z.string().describe('the user question'),
          }),
          execute: async ({ question }) => this.getResource(question),
        }),
      },
    });

    return result;
  }
}
