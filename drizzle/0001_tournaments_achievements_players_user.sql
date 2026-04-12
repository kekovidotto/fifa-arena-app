CREATE TYPE "public"."achievement_type" AS ENUM('CHAMPION', 'RUNNER_UP', 'THIRD_PLACE', 'TOP_SCORER');--> statement-breakpoint
CREATE TYPE "public"."tournament_status" AS ENUM('ACTIVE', 'FINISHED');--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"status" "tournament_status" DEFAULT 'ACTIVE' NOT NULL
);--> statement-breakpoint
INSERT INTO "tournaments" ("name", "date", "status")
VALUES ('Campeonato legado', now(), 'FINISHED');--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "tournament_id" integer;--> statement-breakpoint
UPDATE "groups" SET "tournament_id" = (SELECT "id" FROM "tournaments" ORDER BY "id" ASC LIMIT 1) WHERE "tournament_id" IS NULL;--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "tournament_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "tournament_id" integer;--> statement-breakpoint
UPDATE "matches" m SET "tournament_id" = g."tournament_id" FROM "groups" g WHERE m."group_id" = g."id" AND m."tournament_id" IS NULL;--> statement-breakpoint
UPDATE "matches" SET "tournament_id" = (SELECT "id" FROM "tournaments" ORDER BY "id" ASC LIMIT 1) WHERE "tournament_id" IS NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "tournament_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tournament_id" integer NOT NULL,
	"type" "achievement_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "achievements_user_tournament_type_uidx" ON "achievements" USING btree ("user_id","tournament_id","type");
