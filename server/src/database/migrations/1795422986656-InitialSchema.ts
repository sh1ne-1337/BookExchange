import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1795422986656 implements MigrationInterface {
  name = 'InitialSchema1795422986656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "avatarUrl" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "author" character varying(200) NOT NULL, "photoUrl" character varying, "ownerId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82209aa3c485bb7f7e7e8374c6" ON "books" ("ownerId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "exchange_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requesterId" uuid NOT NULL, "bookId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3c7752197e909b8de003d39f272" UNIQUE ("requesterId", "bookId"), CONSTRAINT "PK_c511ce18339628b950f5b068d69" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "FK_82209aa3c485bb7f7e7e8374c66" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchange_requests" ADD CONSTRAINT "FK_8eb3de665265b56199a290f65f9" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchange_requests" ADD CONSTRAINT "FK_7214ae6b2a9a91fed05bbc75b95" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exchange_requests" DROP CONSTRAINT "FK_7214ae6b2a9a91fed05bbc75b95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exchange_requests" DROP CONSTRAINT "FK_8eb3de665265b56199a290f65f9"`,
    );
    await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_82209aa3c485bb7f7e7e8374c66"`);
    await queryRunner.query(`DROP TABLE "exchange_requests"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_82209aa3c485bb7f7e7e8374c6"`);
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
