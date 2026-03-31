import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClosingValueToCheckout1764688688874
  implements MigrationInterface
{
  name = 'AddClosingValueToCheckout1764688688874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ADD "closing_value" numeric(10,2) DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" DROP COLUMN "closing_value"`,
    );
  }
}
