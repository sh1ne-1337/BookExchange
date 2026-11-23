import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NameUniqueConstraints1795438923355 implements MigrationInterface {
  name = 'NameUniqueConstraints1795438923355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" TO "UQ_users_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchange_requests" RENAME CONSTRAINT "UQ_3c7752197e909b8de003d39f272" TO "UQ_exchange_requests_requester_book"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exchange_requests" RENAME CONSTRAINT "UQ_exchange_requests_requester_book" TO "UQ_3c7752197e909b8de003d39f272"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME CONSTRAINT "UQ_users_email" TO "UQ_97672ac88f789774dd47f7c8be3"`,
    );
  }
}
