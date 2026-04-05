import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBoxPriceAndUnitPriceToInteger1775391523724
  implements MigrationInterface
{
  name = 'ChangeBoxPriceAndUnitPriceToInteger1775391523724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medication" DROP COLUMN "box_price"`);
    await queryRunner.query(
      `ALTER TABLE "medication" ADD "box_price" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "medication" ALTER COLUMN "box_price" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "medication" DROP COLUMN "unit_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medication" ADD "unit_price" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "medication" ALTER COLUMN "unit_price" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ALTER COLUMN "closing_value" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ALTER COLUMN "closing_value" SET DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "medication" DROP COLUMN "unit_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "medication" ADD "unit_price" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "medication" DROP COLUMN "box_price"`);
    await queryRunner.query(
      `ALTER TABLE "medication" ADD "box_price" numeric(10,2) NOT NULL`,
    );
  }
}
