import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1753545529637 implements MigrationInterface {
  name = 'Init1753545529637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "medication" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "chemical_composition" character varying NOT NULL, "stock_availability" integer NOT NULL, "shelf_location" character varying NOT NULL, "box_price" numeric(10,2) NOT NULL, "unit_price" numeric(10,2) NOT NULL, "usefulness" character varying NOT NULL, "sample_photo_url" character varying NOT NULL, "dosage_instructions" text NOT NULL, "full_text_search" tsvector, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0682f5b7379fea3c2fdb77d6545" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "medication"`);
  }
}
