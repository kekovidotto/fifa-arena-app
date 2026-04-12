ALTER TABLE "achievements" DROP CONSTRAINT IF EXISTS "achievements_tournament_id_tournaments_id_fk";--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TYPE "public"."achievement_type" ADD VALUE 'FAN_FAVORITE';--> statement-breakpoint
ALTER TYPE "public"."achievement_type" ADD VALUE 'MVP';--> statement-breakpoint
ALTER TYPE "public"."achievement_type" ADD VALUE 'CRAQUE_DA_GALERA';--> statement-breakpoint
ALTER TYPE "public"."achievement_type" ADD VALUE 'FAIR_PLAY';
