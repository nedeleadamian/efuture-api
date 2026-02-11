import { MigrationInterface, QueryRunner } from "typeorm";

export class SetUpMigration1769462841160 implements MigrationInterface {
    name = 'SetUpMigration1769462841160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_tag_name" UNIQUE ("name"), CONSTRAINT "PK_tag" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "content" character varying(240) NOT NULL, "deleted_at" TIMESTAMP, "author_id" uuid NOT NULL, "tag_id" uuid NOT NULL, "authorId" uuid, "tagId" uuid, CONSTRAINT "PK_message" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_message_tag_id_created_at" ON "message" ("tag_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_message_author_id_created_at" ON "message" ("author_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_message_created_at" ON "message" ("created_at") `);
        await queryRunner.query(`CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "slug" text NOT NULL, "description" text, CONSTRAINT "UQ_permission_slug" UNIQUE ("slug"), CONSTRAINT "PK_permission" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, "roleId" uuid, "permissionId" uuid, CONSTRAINT "UQ_role_permission_role_id_permission_id" UNIQUE ("role_id", "permission_id"), CONSTRAINT "PK_role_permission" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "UQ_role_name" UNIQUE ("name"), CONSTRAINT "PK_role" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" text NOT NULL, "password" text NOT NULL, "refresh_token" text, "is_active" boolean NOT NULL DEFAULT true, "role_id" uuid, "roleId" uuid, CONSTRAINT "UQ_user_email" UNIQUE ("email"), CONSTRAINT "PK_user" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_authorId" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_tagId" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permission" ADD CONSTRAINT "FK_role_permission_roleId" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permission" ADD CONSTRAINT "FK_role_permission_permissionId" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_user_roleId" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_roleId"`);
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_role_permission_permissionId"`);
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_role_permission_roleId"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_tagId"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_authorId"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "role_permission"`);
        await queryRunner.query(`DROP TABLE "permission"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_message_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_message_author_id_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_message_tag_id_created_at"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "tag"`);
    }

}
