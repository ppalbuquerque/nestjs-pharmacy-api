import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MedicationService } from './medication.service';
import { Medication } from './medication.entitity';
import { AiSearchService } from '../ai-search/ai-search.service';

const mockRepo = {
  query: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

const mockAiSearchService = {
  saveMedicationEmbedding: jest.fn(),
};

describe('MedicationService', () => {
  let service: MedicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicationService,
        { provide: getRepositoryToken(Medication), useValue: mockRepo },
        { provide: AiSearchService, useValue: mockAiSearchService },
      ],
    }).compile();

    service = module.get<MedicationService>(MedicationService);
    jest.clearAllMocks();
  });

  describe('search()', () => {
    const rawRow = {
      id: 11,
      name: 'Macrodantina',
      chemical_composition: 'Nitrofuratoína',
      stock_availability: 10,
      shelf_location: '3F',
      box_price: 1000,
      unit_price: 1000,
      usefulness: 'agente antibacteriano',
      sample_photo_url: 'BLANK',
      dosage_instructions: 'De 8 em 8 horas',
      full_text_search: null,
      created_at: '2025-11-07T18:58:08.394Z',
      updated_at: '2025-11-07T18:58:08.394Z',
    };

    it('deve retornar campos em camelCase mapeados a partir do resultado SQL raw', async () => {
      mockRepo.query.mockResolvedValue([rawRow]);

      const result = await service.search('nitro');

      expect(result[0].chemicalComposition).toBe('Nitrofuratoína');
      expect(result[0].stockAvailability).toBe(10);
      expect(result[0].shelfLocation).toBe('3F');
      expect(result[0].boxPrice).toBe(1000);
      expect(result[0].unitPrice).toBe(1000);
      expect(result[0].samplePhotoUrl).toBe('BLANK');
      expect(result[0].dosageInstructions).toBe('De 8 em 8 horas');
      expect(result[0].fullTextSearch).toBeNull();
    });

    it('não deve expor propriedades snake_case no resultado', async () => {
      mockRepo.query.mockResolvedValue([rawRow]);

      const result = await service.search('nitro');

      expect(result[0]).not.toHaveProperty('chemical_composition');
      expect(result[0]).not.toHaveProperty('stock_availability');
      expect(result[0]).not.toHaveProperty('shelf_location');
      expect(result[0]).not.toHaveProperty('box_price');
      expect(result[0]).not.toHaveProperty('unit_price');
      expect(result[0]).not.toHaveProperty('sample_photo_url');
      expect(result[0]).not.toHaveProperty('dosage_instructions');
      expect(result[0]).not.toHaveProperty('full_text_search');
      expect(result[0]).not.toHaveProperty('created_at');
      expect(result[0]).not.toHaveProperty('updated_at');
    });

    it('deve retornar array vazio quando nenhum resultado for encontrado', async () => {
      mockRepo.query.mockResolvedValue([]);

      const result = await service.search('xyznotfound');

      expect(result).toEqual([]);
    });

    it('deve preservar id e name sem transformação', async () => {
      mockRepo.query.mockResolvedValue([rawRow]);

      const result = await service.search('nitro');

      expect(result[0].id).toBe(11);
      expect(result[0].name).toBe('Macrodantina');
      expect(result[0].usefulness).toBe('agente antibacteriano');
    });
  });
});
