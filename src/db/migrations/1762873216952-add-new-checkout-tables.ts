import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewCheckoutTables1762873216952 implements MigrationInterface {
  name = 'AddNewCheckoutTables1762873216952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_item_entity_boxtype_enum" AS ENUM('box', 'unit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL, "totalValue" numeric NOT NULL, "boxType" "public"."order_item_entity_boxtype_enum" NOT NULL DEFAULT 'unit', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid, "medicationId" integer, CONSTRAINT "PK_c12e105219e59720676c72957dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_entity_status_enum" AS ENUM('COMPLETE', 'CANCELLED', 'PROCESSING')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "totalValue" numeric NOT NULL, "paymentValue" numeric NOT NULL, "status" "public"."order_entity_status_enum" NOT NULL DEFAULT 'PROCESSING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "checkoutId" uuid, CONSTRAINT "PK_428b558237e70f2cd8462e1bea1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "checkout_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isOpen" boolean NOT NULL, "closedAt" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fa3e9b31cb0ef8451d380c1e19f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_entity" ADD CONSTRAINT "FK_cd7ee8cfd1250200aa78d806f8d" FOREIGN KEY ("orderId") REFERENCES "order_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_entity" ADD CONSTRAINT "FK_f5b7c171610e2a395dd2ac25eb7" FOREIGN KEY ("medicationId") REFERENCES "medication"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_entity" ADD CONSTRAINT "FK_fe88089aade0efe808823e26ec8" FOREIGN KEY ("checkoutId") REFERENCES "checkout_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_entity" DROP CONSTRAINT "FK_fe88089aade0efe808823e26ec8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_entity" DROP CONSTRAINT "FK_f5b7c171610e2a395dd2ac25eb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item_entity" DROP CONSTRAINT "FK_cd7ee8cfd1250200aa78d806f8d"`,
    );
    await queryRunner.query(`DROP TABLE "checkout_entity"`);
    await queryRunner.query(`DROP TABLE "order_entity"`);
    await queryRunner.query(`DROP TYPE "public"."order_entity_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_item_entity"`);
    await queryRunner.query(
      `DROP TYPE "public"."order_item_entity_boxtype_enum"`,
    );
  }
}
