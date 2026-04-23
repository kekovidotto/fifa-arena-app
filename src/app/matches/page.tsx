import { headers } from "next/headers";

import { MatchesContent } from "@/components/matches/matches-content";
import { getActiveTournamentBundle } from "@/lib/active-tournament-data";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { buildMatchCards } from "@/lib/tournament-utils";

export default async function MatchesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { activeTournament, groups, players, matches } =
    await getActiveTournamentBundle();

  const matchCards = buildMatchCards(matches, players, groups);
  const viewerIsAdmin = await isAdmin(session?.user?.id);

  return (
    <div className="flex min-h-dvh flex-col bg-m3-background pb-12 font-body text-on-surface selection:bg-m3-primary selection:text-on-primary">
      <MatchesContent
        matches={matchCards}
        viewerIsAdmin={viewerIsAdmin}
        hasActiveTournament={activeTournament != null}
      />
    </div>
  );
}
