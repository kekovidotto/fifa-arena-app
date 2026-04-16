CREATE TABLE "match_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_match_id" integer NOT NULL,
	"home_user_id" text,
	"away_user_id" text,
	"score_home" integer NOT NULL,
	"score_away" integer NOT NULL,
	"goals_home" integer DEFAULT 0 NOT NULL,
	"goals_away" integer DEFAULT 0 NOT NULL,
	"finished_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "match_history_source_match_id_unique" UNIQUE("source_match_id")
);
--> statement-breakpoint
CREATE INDEX "match_history_home_user_idx" ON "match_history" USING btree ("home_user_id");
--> statement-breakpoint
CREATE INDEX "match_history_away_user_idx" ON "match_history" USING btree ("away_user_id");
--> statement-breakpoint
INSERT INTO "match_history" (
	"source_match_id",
	"home_user_id",
	"away_user_id",
	"score_home",
	"score_away",
	"goals_home",
	"goals_away",
	"finished_at"
)
SELECT
	m."id",
	ph."user_id",
	pa."user_id",
	m."score_home",
	m."score_away",
	COALESCE(
		(SELECT SUM(g."count")::int FROM "goals" g WHERE g."match_id" = m."id" AND g."player_id" = m."player_home_id"),
		0
	),
	COALESCE(
		(SELECT SUM(g."count")::int FROM "goals" g WHERE g."match_id" = m."id" AND g."player_id" = m."player_away_id"),
		0
	),
	NOW()
FROM "matches" m
INNER JOIN "players" ph ON ph."id" = m."player_home_id"
INNER JOIN "players" pa ON pa."id" = m."player_away_id"
WHERE m."status" = 'FINISHED'
ON CONFLICT ("source_match_id") DO NOTHING;
