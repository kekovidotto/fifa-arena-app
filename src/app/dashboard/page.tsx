import { asc } from "drizzle-orm";

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { db } from "@/db";
import { groups, matches, players } from "@/db/schema";
import {
  buildMatchCards,
  calculateStandings,
  type GroupData,
} from "@/lib/tournament-utils";

export default async function DashboardPage() {
  const [allGroups, allPlayers, allMatches] = await Promise.all([
    db.select().from(groups).orderBy(asc(groups.id)),
    db.select().from(players),
    db.select().from(matches).orderBy(asc(matches.id)),
  ]);

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

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <DashboardContent
        groups={groupsData}
        upcomingMatches={upcomingMatches}
        totalPending={pendingMatches.length}
        groupPhaseComplete={groupPhaseComplete}
        knockoutExists={knockoutExists}
      />
      <BottomNav />
    </div>
  );
}
