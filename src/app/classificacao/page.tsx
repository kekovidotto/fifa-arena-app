import { asc } from "drizzle-orm";

import { StandingsContent } from "@/components/standings/standings-content";
import { db } from "@/db";
import { matches, players } from "@/db/schema";
import { calculateStandings } from "@/lib/tournament-utils";

export default async function ClassificacaoPage() {
  const [allPlayers, allMatches] = await Promise.all([
    db.select().from(players),
    db.select().from(matches).orderBy(asc(matches.id)),
  ]);

  const standings = calculateStandings(allPlayers, allMatches);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <StandingsContent standings={standings} />
    </div>
  );
}
