CREATE TYPE "public"."team_library_category" AS ENUM('EUROPE', 'WORLD_CUP');--> statement-breakpoint
CREATE TABLE "teams_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" text NOT NULL,
	"category" "team_library_category" NOT NULL
);
--> statement-breakpoint
CREATE INDEX "teams_library_category_idx" ON "teams_library" USING btree ("category");--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "team_id" integer;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_library_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams_library"("id") ON DELETE set null ON UPDATE no action;
