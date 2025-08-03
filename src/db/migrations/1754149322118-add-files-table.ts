import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilesTable1754149322118 implements MigrationInterface {
  name = 'AddFilesTable1754149322118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "file" ("id" SERIAL NOT NULL, "fileName" character varying NOT NULL, "contentLength" integer NOT NULL, "contentType" character varying NOT NULL, "url" character varying NOT NULL, CONSTRAINT "UQ_5b57f7314a83f4203748eeb4d7f" UNIQUE ("fileName"), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "file"`);
  }
}
