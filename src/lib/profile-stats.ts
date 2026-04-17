import { and, eq, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { aliasPlayers } from "@/db/alias";
import { goals, matches, matchHistory, players, tournaments } from "@/db/schema";
import {
  addResultToAccumulator,
  emptyAccumulator,
  levelProgressFromXp,
  type MatchResult,
  mergeAccumulators,
  winRatePercentFromAccumulator,
  xpFromAccumulator,
} from "@/lib/xp-system";

export interface UserProfileStats {
  totalGoals: number;
  wins: number;
  draws: number;
  losses: number;
  gamesPlayed: number;
  winRatePercent: number;
  /** XP consolidado (`match_history`). */
  permanentXp: number;
  /** XP do campeonato ACTIVE (partidas FINISHED), ainda não oficial. */
  pendingXp: number;
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  levelTitle: string;
}

/**
 * FONTE A: `match_history` (torneios já finalizados / consolidados).
 * FONTE B: partidas `FINISHED` do torneio `ACTIVE` (ainda não em histórico).
 * Perfil = soma A + B; nível e barra usam o total.
 */
export async function computeUserProfileStats(
  userId: string,
): Promise<UserProfileStats> {
  const historyRows = await db
    .select()
    .from(matchHistory)
    .where(eq(matchHistory.userId, userId));

  const permAcc = emptyAccumulator();
  const archivedMatchIds = new Set(
    historyRows.map((r) => r.sourceMatchId),
  );

  for (const r of historyRows) {
    addResultToAccumulator(permAcc, r.result as MatchResult, r.goals);
  }

  const pendAcc = emptyAccumulator();

  const [activeTournament] = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.status, "ACTIVE"))
    .limit(1);

  if (activeTournament) {
    /* Em SQLite o alias usa dialect sqlite; `db` está tipado como PostgreSQL. */
    const ph = aliasPlayers("ph") as typeof players;
    const pa = aliasPlayers("pa") as typeof players;

    const liveRows = await db
      .select({
        matchId: matches.id,
        scoreHome: matches.scoreHome,
        scoreAway: matches.scoreAway,
        homeUserId: ph.userId,
        awayUserId: pa.userId,
        playerHomeId: matches.playerHomeId,
        playerAwayId: matches.playerAwayId,
      })
      .from(matches)
      .innerJoin(ph, eq(matches.playerHomeId, ph.id))
      .innerJoin(pa, eq(matches.playerAwayId, pa.id))
      .where(
        and(
          eq(matches.tournamentId, activeTournament.id),
          eq(matches.status, "FINISHED"),
          or(eq(ph.userId, userId), eq(pa.userId, userId)),
        ),
      );

    const pendingMatchRows = liveRows.filter(
      (r) => !archivedMatchIds.has(r.matchId),
    );
    const extraIds = pendingMatchRows.map((r) => r.matchId);

    const goalsByMatchPlayer = new Map<string, number>();
    if (extraIds.length > 0) {
      const goalRows = await db
        .select({
          matchId: goals.matchId,
          playerId: goals.playerId,
          count: goals.count,
        })
        .from(goals)
        .where(inArray(goals.matchId, extraIds));

      for (const g of goalRows) {
        goalsByMatchPlayer.set(`${g.matchId}:${g.playerId}`, g.count);
      }
    }

    for (const row of pendingMatchRows) {
      const isHome = row.homeUserId === userId;
      const isAway = row.awayUserId === userId;
      if (!isHome && !isAway) continue;

      const pid = isHome ? row.playerHomeId : row.playerAwayId;
      const goalsScored =
        goalsByMatchPlayer.get(`${row.matchId}:${pid}`) ?? 0;

      const gf = isHome ? row.scoreHome : row.scoreAway;
      const ga = isHome ? row.scoreAway : row.scoreHome;
      let result: MatchResult;
      if (gf > ga) result = "W";
      else if (gf === ga) result = "D";
      else result = "L";

      addResultToAccumulator(pendAcc, result, goalsScored);
    }
  }

  const merged = mergeAccumulators(permAcc, pendAcc);
  const permanentXp = xpFromAccumulator(permAcc);
  const pendingXp = xpFromAccumulator(pendAcc);
  const totalXp = permanentXp + pendingXp;

  const { wins, draws, losses, totalGoals } = merged;
  const gamesPlayed = wins + draws + losses;
  const winRatePercent = winRatePercentFromAccumulator(merged);

  const { level, xpIntoLevel, xpForNextLevel, levelTitle } =
    levelProgressFromXp(totalXp);

  return {
    totalGoals,
    wins,
    draws,
    losses,
    gamesPlayed,
    winRatePercent,
    permanentXp,
    pendingXp,
    totalXp,
    level,
    xpIntoLevel,
    xpForNextLevel,
    levelTitle,
  };
}
