import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { db } from "@/db";
import { groups, matches, players, tournaments } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import {
  buildMatchCards,
  calculateStandings,
  type GroupData,
} from "@/lib/tournament-utils";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [allGroups, allPlayers, allMatches, activeTournamentRows] =
    await Promise.all([
      db.select().from(groups).orderBy(asc(groups.id)),
      db.select().from(players),
      db.select().from(matches).orderBy(asc(matches.id)),
      db
        .select()
        .from(tournaments)
        .where(eq(tournaments.status, "ACTIVE"))
        .limit(1),
    ]);

  const activeTournament = activeTournamentRows[0];
  let canFinalizeTournament = false;
  if (activeTournament) {
    const tMatches = allMatches.filter(
      (m) => m.tournamentId === activeTournament.id,
    );
    if (
      tMatches.length > 0 &&
      tMatches.every((m) => m.status === "FINISHED")
    ) {
      const finalKnockout = tMatches.find(
        (m) => m.type === "KNOCKOUT" && m.stage === "FINAL",
      );
      canFinalizeTournament = Boolean(finalKnockout);
    }
  }

  const groupsData: GroupData[] = allGroups.map((group) => {
    const groupPlayers = allPlayers.filter((p) => p.groupId === group.id);
    const groupMatches = allMatches.filter((m) => m.groupId === group.id);

    return {
      id: group.id,
      name: group.name,
      standings: calculateStandings(groupPlayers, groupMatches),
    };
  });

  const groupMatches = allMatches.filter((m) => m.type === "GROUP");
  const groupPhaseComplete =
    groupMatches.length > 0 &&
    groupMatches.every((m) => m.status === "FINISHED");

  const knockoutMatchList = allMatches.filter((m) => m.type === "KNOCKOUT");
  const knockoutExists = knockoutMatchList.length > 0;

  const pendingMatches = allMatches.filter((m) => m.status === "PENDING");
  const upcomingMatches = buildMatchCards(
    pendingMatches.slice(0, 4),
    allPlayers,
    allGroups,
  );

  const viewerIsAdmin = isAdmin(session?.user?.email);

  return (
    <div className="flex min-h-dvh flex-col bg-m3-background font-body text-on-surface selection:bg-m3-primary selection:text-on-primary">
      <DashboardContent
        groups={groupsData}
        upcomingMatches={upcomingMatches}
        totalPending={pendingMatches.length}
        groupPhaseComplete={groupPhaseComplete}
        knockoutExists={knockoutExists}
        canFinalizeTournament={canFinalizeTournament}
        viewerIsAdmin={viewerIsAdmin}
      />
    </div>
  );
}
