import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMedicationEmbeddingTable1762451231834
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "medication_embeddings" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "embedding" VECTOR (1536),
        "pageContent" TEXT,
        "metadata" JSONB
      );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP EXTENSION IF EXISTS vector CASCADE;
      DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
      DROP TABLE IF EXISTS "medication_embeddings";
    `);
  }
}
