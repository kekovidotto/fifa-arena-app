import { asc } from "drizzle-orm";
import { headers } from "next/headers";

import { MatchesContent } from "@/components/matches/matches-content";
import { db } from "@/db";
import { groups, matches, players } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { buildMatchCards } from "@/lib/tournament-utils";

export default async function MatchesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [allGroups, allPlayers, allMatches] = await Promise.all([
    db.select().from(groups).orderBy(asc(groups.id)),
    db.select().from(players),
    db.select().from(matches).orderBy(asc(matches.id)),
  ]);

  const matchCards = buildMatchCards(allMatches, allPlayers, allGroups);
  const viewerIsAdmin = isAdmin(session?.user?.email);

  return (
    <div className="flex min-h-dvh flex-col bg-m3-background pb-12 font-body text-on-surface selection:bg-m3-primary selection:text-on-primary">
      <MatchesContent matches={matchCards} viewerIsAdmin={viewerIsAdmin} />
    </div>
  );
}
