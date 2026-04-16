import { desc, eq, sql } from "drizzle-orm";

import { ScorersContent } from "@/components/top-scorers/scorers-content";
import { db } from "@/db";
import { goals, players } from "@/db/schema";
import type { Scorer } from "@/lib/tournament-utils";

export default async function ArtilheriaPage() {
  const goalSum = sql<number>`coalesce(cast(sum(${goals.count}) as integer), 0)`;

  const scorers: Scorer[] = await db
    .select({
      playerId: players.id,
      playerName: players.name,
      teamName: players.teamName,
      teamLogo: players.teamLogo,
      userId: players.userId,
      totalGoals: goalSum,
    })
    .from(players)
    .leftJoin(goals, eq(goals.playerId, players.id))
    .groupBy(
      players.id,
      players.name,
      players.teamName,
      players.teamLogo,
      players.userId,
    )
    .orderBy(desc(goalSum), players.name);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <ScorersContent scorers={scorers} />
    </div>
  );
}
