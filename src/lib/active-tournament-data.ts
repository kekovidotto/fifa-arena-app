import { asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { groups, matches, players, tournaments } from "@/db/schema";

export type ActiveTournamentRow = typeof tournaments.$inferSelect;

/**
 * Dados do campeonato com status ACTIVE (ou vazio se não houver).
 * Jogadores: fila do torneio (grupos) + participantes de partidas (mata-mata).
 */
export async function getActiveTournamentBundle(): Promise<{
  activeTournament: ActiveTournamentRow | null;
  groups: (typeof groups.$inferSelect)[];
  players: (typeof players.$inferSelect)[];
  matches: (typeof matches.$inferSelect)[];
}> {
  const [active] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "ACTIVE"))
    .limit(1);

  if (!active) {
    return { activeTournament: null, groups: [], players: [], matches: [] };
  }

  const groupRows = await db
    .select()
    .from(groups)
    .where(eq(groups.tournamentId, active.id))
    .orderBy(asc(groups.id));

  const matchRows = await db
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, active.id))
    .orderBy(asc(matches.id));

  const groupIds = groupRows.map((g) => g.id);
  const matchPlayerIds = new Set<number>();
  for (const m of matchRows) {
    matchPlayerIds.add(m.playerHomeId);
    matchPlayerIds.add(m.playerAwayId);
  }

  const byId = new Map<number, (typeof players.$inferSelect)>();

  if (groupIds.length > 0) {
    const inGroups = await db
      .select()
      .from(players)
      .where(inArray(players.groupId, groupIds));
    for (const p of inGroups) {
      byId.set(p.id, p);
    }
  }

  const extraIds = [...matchPlayerIds].filter((id) => !byId.has(id));
  if (extraIds.length > 0) {
    const extras = await db
      .select()
      .from(players)
      .where(inArray(players.id, extraIds));
    for (const p of extras) {
      byId.set(p.id, p);
    }
  }

  return {
    activeTournament: active,
    groups: groupRows,
    players: [...byId.values()],
    matches: matchRows,
  };
}
