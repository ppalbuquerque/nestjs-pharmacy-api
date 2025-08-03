import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPtbrTextSearchConfiguration1754233019589
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TEXT SEARCH CONFIGURATION IF EXISTS ptbr CASCADE;
        CREATE TEXT SEARCH CONFIGURATION ptbr (COPY=pg_catalog.portuguese);
        ALTER TEXT SEARCH CONFIGURATION ptbr ALTER MAPPING FOR word, hword, hword_part
        WITH unaccent, portuguese_stem`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TEXT SEARCH CONFIGURATION IF EXISTS ptbr CASCADE`,
    );
  }
}
