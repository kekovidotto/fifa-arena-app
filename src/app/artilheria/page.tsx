import { desc, eq, inArray, sql } from "drizzle-orm";

import { ScorersContent } from "@/components/top-scorers/scorers-content";
import { db } from "@/db";
import { goals, matches, players } from "@/db/schema";
import { getActiveTournamentBundle } from "@/lib/active-tournament-data";
import type { Scorer } from "@/lib/tournament-utils";

export default async function ArtilheriaPage() {
  const { activeTournament, players: rosterPlayers } =
    await getActiveTournamentBundle();

  if (!activeTournament || rosterPlayers.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col pb-8">
        <ScorersContent scorers={[]} />
      </div>
    );
  }

  const rosterIds = rosterPlayers.map((p) => p.id);
  const tid = activeTournament.id;
  const goalSum = sql<number>`coalesce(sum(case when ${matches.tournamentId} = ${tid} then ${goals.count} else 0 end), 0)::int`;

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
    .leftJoin(matches, eq(goals.matchId, matches.id))
    .where(inArray(players.id, rosterIds))
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
