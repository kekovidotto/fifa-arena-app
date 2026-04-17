import { and, eq, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { goals, matches, matchHistory, players, tournaments } from "@/db/schema";

const XP_GOAL = 10;
const XP_WIN = 50;
const XP_DRAW = 20;
const XP_PER_LEVEL = 1000;

export interface UserProfileStats {
  totalGoals: number;
  wins: number;
  draws: number;
  losses: number;
  gamesPlayed: number;
  winRatePercent: number;
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  levelTitle: string;
}

function levelTitleFor(level: number): string {
  if (level <= 1) return "Iniciante da Arena";
  if (level <= 3) return "Competidor da Arena";
  if (level <= 6) return "Veterano da Arena";
  if (level <= 10) return "Lenda da Arena";
  return "Mito da Arena";
}

function levelProgressFromXp(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    levelTitle: levelTitleFor(level),
  };
}

function addRow(
  acc: { totalGoals: number; wins: number; draws: number; losses: number },
  result: "W" | "D" | "L",
  goalsScored: number,
) {
  acc.totalGoals += goalsScored;
  if (result === "W") acc.wins += 1;
  else if (result === "D") acc.draws += 1;
  else acc.losses += 1;
}

/** Estatísticas permanentes: `match_history` + partidas finalizadas do torneio ACTIVE ainda não arquivadas. */
export async function computeUserProfileStats(
  userId: string,
): Promise<UserProfileStats> {
  const historyRows = await db
    .select()
    .from(matchHistory)
    .where(eq(matchHistory.userId, userId));

  const acc = {
    totalGoals: 0,
    wins: 0,
    draws: 0,
    losses: 0,
  };

  const archivedMatchIds = new Set(
    historyRows.map((r) => r.sourceMatchId),
  );

  for (const r of historyRows) {
    addRow(acc, r.result, r.goals);
  }

  const [activeTournament] = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.status, "ACTIVE"))
    .limit(1);

  if (activeTournament) {
    const ph = alias(players, "ph");
    const pa = alias(players, "pa");

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

    const extraIds = liveRows
      .filter((r) => !archivedMatchIds.has(r.matchId))
      .map((r) => r.matchId);

    if (extraIds.length > 0) {
      const goalRows = await db
        .select({
          matchId: goals.matchId,
          playerId: goals.playerId,
          count: goals.count,
        })
        .from(goals)
        .where(inArray(goals.matchId, extraIds));

      const goalsByMatchPlayer = new Map<string, number>();
      for (const g of goalRows) {
        goalsByMatchPlayer.set(`${g.matchId}:${g.playerId}`, g.count);
      }

      for (const row of liveRows) {
        if (archivedMatchIds.has(row.matchId)) continue;

        const isHome = row.homeUserId === userId;
        const isAway = row.awayUserId === userId;
        if (!isHome && !isAway) continue;

        const pid = isHome ? row.playerHomeId : row.playerAwayId;
        const goalsScored =
          goalsByMatchPlayer.get(`${row.matchId}:${pid}`) ?? 0;

        const gf = isHome ? row.scoreHome : row.scoreAway;
        const ga = isHome ? row.scoreAway : row.scoreHome;
        let result: "W" | "D" | "L";
        if (gf > ga) result = "W";
        else if (gf === ga) result = "D";
        else result = "L";

        addRow(acc, result, goalsScored);
      }
    }
  }

  const { wins, draws, losses, totalGoals } = acc;
  const gamesPlayed = wins + draws + losses;
  const maxPoints = gamesPlayed * 3;
  const points = wins * 3 + draws;
  const winRatePercent =
    maxPoints > 0 ? Math.round((points / maxPoints) * 1000) / 10 : 0;

  const totalXp = totalGoals * XP_GOAL + wins * XP_WIN + draws * XP_DRAW;
  const { level, xpIntoLevel, xpForNextLevel, levelTitle } =
    levelProgressFromXp(totalXp);

  return {
    totalGoals,
    wins,
    draws,
    losses,
    gamesPlayed,
    winRatePercent,
    totalXp,
    level,
    xpIntoLevel,
    xpForNextLevel,
    levelTitle,
  };
}
