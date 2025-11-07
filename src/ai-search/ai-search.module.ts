import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiSearchController } from './ai-search.controller';
import { AiSearchService } from './ai-search.service';
import { Medication } from 'src/medication/medication.entitity';

@Module({
  controllers: [AiSearchController],
  providers: [AiSearchService],
  imports: [TypeOrmModule.forFeature([Medication])],
  exports: [AiSearchService],
})
export class AiSearchModule {}
