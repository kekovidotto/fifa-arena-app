import { desc, eq, sql } from "drizzle-orm";

import { ScorersContent } from "@/components/top-scorers/scorers-content";
import { db } from "@/db";
import { goals, players } from "@/db/schema";
import type { Scorer } from "@/lib/tournament-utils";

export default async function ArtilheriaPage() {
  const scorers: Scorer[] = await db
    .select({
      playerId: goals.playerId,
      playerName: players.name,
      teamName: players.teamName,
      totalGoals: sql<number>`cast(sum(${goals.count}) as integer)`,
    })
    .from(goals)
    .innerJoin(players, eq(goals.playerId, players.id))
    .groupBy(goals.playerId, players.name, players.teamName)
    .orderBy(desc(sql`sum(${goals.count})`));

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <ScorersContent scorers={scorers} />
    </div>
  );
}
