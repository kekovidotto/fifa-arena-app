import { inArray } from "drizzle-orm";

import type {
  StandingRow,
  StandingsGroupBlock,
} from "@/components/standings/standings-content";
import { StandingsContent } from "@/components/standings/standings-content";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getActiveTournamentBundle } from "@/lib/active-tournament-data";
import { calculateStandings } from "@/lib/tournament-utils";

export default async function ClassificacaoPage() {
  const { activeTournament, groups: allGroups, players: allPlayers, matches: allMatches } =
    await getActiveTournamentBundle();

  const userIds = [
    ...new Set(
      allPlayers
        .map((p) => p.userId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const userRows =
    userIds.length > 0
      ? await db
          .select({ id: user.id, image: user.image })
          .from(user)
          .where(inArray(user.id, userIds))
      : [];

  const imageByUserId = new Map(
    userRows.map((u) => [u.id, u.image ?? null] as const),
  );

  const groupsData: StandingsGroupBlock[] = allGroups.map((group) => {
    const groupPlayers = allPlayers.filter((p) => p.groupId === group.id);
    const groupMatches = allMatches.filter((m) => m.groupId === group.id);
    const standings = calculateStandings(groupPlayers, groupMatches);
    const standingsRows: StandingRow[] = standings.map((s) => {
      const p = groupPlayers.find((x) => x.id === s.playerId);
      const avatarUrl = p?.userId
        ? (imageByUserId.get(p.userId) ?? null)
        : null;
      return { ...s, avatarUrl, linkedUserId: p?.userId ?? null };
    });
    return {
      id: group.id,
      name: group.name,
      standings: standingsRows,
    };
  });

  return (
    <div className="flex min-h-dvh flex-col bg-m3-background pb-16 font-body text-on-surface selection:bg-m3-primary selection:text-on-primary">
      <StandingsContent
        groups={groupsData}
        hasActiveTournament={activeTournament != null}
      />
    </div>
  );
}
