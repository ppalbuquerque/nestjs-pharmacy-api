import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrigramExtension1759930789802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP EXTENSION pg_trgm IF EXISTS pg_trgm CASCADE;`,
    );
  }
}
