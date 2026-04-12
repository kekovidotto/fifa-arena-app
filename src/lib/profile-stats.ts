import { and, eq, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { goals, matches, players } from "@/db/schema";

export interface UserProfileStats {
  totalGoals: number;
  wins: number;
  draws: number;
  losses: number;
  gamesPlayed: number;
  winRatePercent: number;
}

export async function computeUserProfileStats(
  userId: string,
): Promise<UserProfileStats> {
  const myPlayers = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.userId, userId));

  const playerIds = myPlayers.map((p) => p.id);
  if (playerIds.length === 0) {
    return {
      totalGoals: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gamesPlayed: 0,
      winRatePercent: 0,
    };
  }

  const goalRows = await db
    .select({
      total: sql<number>`coalesce(sum(${goals.count}), 0)::int`,
    })
    .from(goals)
    .where(inArray(goals.playerId, playerIds));

  const totalGoals = goalRows[0]?.total ?? 0;

  const finished = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.status, "FINISHED"),
        or(
          inArray(matches.playerHomeId, playerIds),
          inArray(matches.playerAwayId, playerIds),
        ),
      ),
    );

  let wins = 0;
  let draws = 0;
  let losses = 0;

  for (const m of finished) {
    const isHome = playerIds.includes(m.playerHomeId);
    const isAway = playerIds.includes(m.playerAwayId);
    if (!isHome && !isAway) continue;

    const gf = isHome ? m.scoreHome : m.scoreAway;
    const ga = isHome ? m.scoreAway : m.scoreHome;

    if (gf > ga) wins++;
    else if (gf === ga) draws++;
    else losses++;
  }

  const gamesPlayed = wins + draws + losses;
  const maxPoints = gamesPlayed * 3;
  const points = wins * 3 + draws;
  const winRatePercent =
    maxPoints > 0 ? Math.round((points / maxPoints) * 1000) / 10 : 0;

  return {
    totalGoals,
    wins,
    draws,
    losses,
    gamesPlayed,
    winRatePercent,
  };
}
