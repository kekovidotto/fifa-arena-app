import { asc } from "drizzle-orm";

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { MatchesContent } from "@/components/matches/matches-content";
import { db } from "@/db";
import { groups, matches, players } from "@/db/schema";
import { buildMatchCards } from "@/lib/tournament-utils";

export default async function MatchesPage() {
  const [allGroups, allPlayers, allMatches] = await Promise.all([
    db.select().from(groups).orderBy(asc(groups.id)),
    db.select().from(players),
    db.select().from(matches).orderBy(asc(matches.id)),
  ]);

  const matchCards = buildMatchCards(allMatches, allPlayers, allGroups);

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <MatchesContent matches={matchCards} />
      <BottomNav />
    </div>
  );
}
