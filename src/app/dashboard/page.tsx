import { headers } from "next/headers";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getActiveTournamentBundle } from "@/lib/active-tournament-data";
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

  const {
    activeTournament,
    groups: allGroups,
    players: allPlayers,
    matches: allMatches,
  } = await getActiveTournamentBundle();

  const hasActiveTournament = activeTournament != null;

  let canFinalizeTournament = false;
  if (activeTournament) {
    if (
      allMatches.length > 0 &&
      allMatches.every((m) => m.status === "FINISHED")
    ) {
      const finalKnockout = allMatches.find(
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
        hasActiveTournament={hasActiveTournament}
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
