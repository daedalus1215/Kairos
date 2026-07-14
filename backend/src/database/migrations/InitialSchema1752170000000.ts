import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1752170000000 implements MigrationInterface {
  name = 'InitialSchema1752170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "default_hourly_rate" decimal(10,2) NOT NULL DEFAULT (100),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "participants" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" integer NOT NULL,
        "name" varchar(255) NOT NULL,
        "role" varchar(100),
        "hourly_rate" decimal(10,2) NOT NULL,
        "color" varchar(7) NOT NULL DEFAULT ('#00F5FF'),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "meetings" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" integer NOT NULL,
        "title" varchar(255) NOT NULL,
        "start_time" datetime NOT NULL,
        "end_time" datetime,
        "total_cost" decimal(12,2) NOT NULL DEFAULT (0),
        "status" varchar(20) NOT NULL DEFAULT ('active'),
        "paused_at" datetime,
        "total_paused_seconds" integer NOT NULL DEFAULT (0),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "meeting_participants" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "meeting_id" integer NOT NULL,
        "participant_id" integer NOT NULL,
        "joined_at" datetime NOT NULL,
        "left_at" datetime,
        "rate_override" decimal(10,2),
        "cost_contribution" decimal(12,2) NOT NULL DEFAULT (0),
        "created_at" datetime NOT NULL DEFAULT (datetime('now'))
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "meeting_notes" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "meeting_id" integer NOT NULL,
        "content" text NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "meeting_notes"`);
    await queryRunner.query(`DROP TABLE "meeting_participants"`);
    await queryRunner.query(`DROP TABLE "meetings"`);
    await queryRunner.query(`DROP TABLE "participants"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
