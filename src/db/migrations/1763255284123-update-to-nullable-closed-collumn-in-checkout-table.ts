import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateToNullableClosedCollumnInCheckoutTable1763255284123
  implements MigrationInterface
{
  name = 'UpdateToNullableClosedCollumnInCheckoutTable1763255284123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ALTER COLUMN "isOpen" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ALTER COLUMN "closedAt" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ALTER COLUMN "closedAt" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "checkout_entity" ALTER COLUMN "isOpen" DROP DEFAULT`,
    );
  }
}
