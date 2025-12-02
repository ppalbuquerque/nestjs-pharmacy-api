import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764688688873 implements MigrationInterface {
  name = 'Migrations1764688688873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ADD "intial_value" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" DROP COLUMN "intial_value"`,
    );
  }
}
