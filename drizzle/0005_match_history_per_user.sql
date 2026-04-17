CREATE TYPE "public"."match_history_result" AS ENUM('W', 'D', 'L');
--> statement-breakpoint
ALTER TABLE "match_history" RENAME TO "match_history_old";
--> statement-breakpoint
CREATE TABLE "match_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_match_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"result" "match_history_result" NOT NULL,
	"goals" integer DEFAULT 0 NOT NULL,
	"tournament_name" varchar(255) NOT NULL,
	"finished_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "match_history_source_user_uidx" ON "match_history" USING btree ("source_match_id","user_id");
--> statement-breakpoint
CREATE INDEX "match_history_user_id_idx" ON "match_history" USING btree ("user_id");
--> statement-breakpoint
INSERT INTO "match_history" ("source_match_id", "user_id", "result", "goals", "tournament_name", "finished_at")
SELECT
	mh."source_match_id",
	mh."home_user_id",
	CASE
		WHEN mh."score_home" > mh."score_away" THEN 'W'::"match_history_result"
		WHEN mh."score_home" = mh."score_away" THEN 'D'::"match_history_result"
		ELSE 'L'::"match_history_result"
	END,
	mh."goals_home",
	COALESCE(t."name", 'Histórico'),
	mh."finished_at"
FROM "match_history_old" mh
LEFT JOIN "matches" m ON m."id" = mh."source_match_id"
LEFT JOIN "tournaments" t ON t."id" = m."tournament_id"
WHERE mh."home_user_id" IS NOT NULL;
--> statement-breakpoint
INSERT INTO "match_history" ("source_match_id", "user_id", "result", "goals", "tournament_name", "finished_at")
SELECT
	mh."source_match_id",
	mh."away_user_id",
	CASE
		WHEN mh."score_away" > mh."score_home" THEN 'W'::"match_history_result"
		WHEN mh."score_away" = mh."score_home" THEN 'D'::"match_history_result"
		ELSE 'L'::"match_history_result"
	END,
	mh."goals_away",
	COALESCE(t."name", 'Histórico'),
	mh."finished_at"
FROM "match_history_old" mh
LEFT JOIN "matches" m ON m."id" = mh."source_match_id"
LEFT JOIN "tournaments" t ON t."id" = m."tournament_id"
WHERE mh."away_user_id" IS NOT NULL;
--> statement-breakpoint
DROP TABLE "match_history_old" CASCADE;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "matches_tournament_id_idx" ON "matches" ("tournament_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "groups_tournament_id_idx" ON "groups" ("tournament_id");
