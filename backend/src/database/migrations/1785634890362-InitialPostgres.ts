import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialPostgres1785634890362 implements MigrationInterface {
    name = 'InitialPostgres1785634890362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "default_hourly_rate" numeric(10,2) NOT NULL DEFAULT '100', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "participants" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "name" character varying(255) NOT NULL, "role" character varying(100), "hourly_rate" numeric(10,2) NOT NULL, "color" character varying(7) NOT NULL DEFAULT '#00F5FF', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1cda06c31eec1c95b3365a0283f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meeting_participants" ("id" SERIAL NOT NULL, "meeting_id" integer NOT NULL, "participant_id" integer NOT NULL, "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL, "left_at" TIMESTAMP WITH TIME ZONE, "rate_override" numeric(10,2), "cost_contribution" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_994ee66a92de655fb478c038980" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meeting_notes" ("id" SERIAL NOT NULL, "meeting_id" integer NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_24248684e8ac266a4bc2ba64475" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meetings" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "title" character varying(255) NOT NULL, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE, "total_cost" numeric(12,2) NOT NULL DEFAULT '0', "status" character varying(20) NOT NULL DEFAULT 'active', "paused_at" TIMESTAMP WITH TIME ZONE, "total_paused_seconds" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aa73be861afa77eb4ed31f3ed57" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "meetings"`);
        await queryRunner.query(`DROP TABLE "meeting_notes"`);
        await queryRunner.query(`DROP TABLE "meeting_participants"`);
        await queryRunner.query(`DROP TABLE "participants"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
