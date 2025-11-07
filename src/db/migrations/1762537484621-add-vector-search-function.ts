import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVectorSearchFunction1762537484621
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION vector_search (
                query_embedding VECTOR(1536),
                similarity_treshold FLOAT,
                match_count INT
            )
            RETURNS TABLE (
                id UUID,
                content TEXT,
                similarity FLOAT
            )
            language sql stable
            as $$
                SELECT
                    id,
                    content,
                    1 - (embedding <=> query_embedding) as similarity
                FROM medication_embeddings
                WHERE (1 - (embedding <=> query_embedding)) > similarity_treshold
                ORDER BY embedding <=> query_embedding
                LIMIT match_count;
                $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS vector_search(vector(1536), float, int);`,
    );
  }
}
