import { eq, or } from "drizzle-orm";

import { db } from "@/db";
import { matchHistory } from "@/db/schema";

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

/** Estatísticas permanentes a partir de `match_history` (partidas finalizadas arquivadas). */
export async function computeUserProfileStats(
  userId: string,
): Promise<UserProfileStats> {
  const rows = await db
    .select()
    .from(matchHistory)
    .where(
      or(
        eq(matchHistory.homeUserId, userId),
        eq(matchHistory.awayUserId, userId),
      ),
    );

  let totalGoals = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  for (const r of rows) {
    const isHome = r.homeUserId === userId;
    const isAway = r.awayUserId === userId;
    if (!isHome && !isAway) continue;

    const gf = isHome ? r.scoreHome : r.scoreAway;
    const ga = isHome ? r.scoreAway : r.scoreHome;
    const goalsScored = isHome ? r.goalsHome : r.goalsAway;

    totalGoals += goalsScored;

    if (gf > ga) wins++;
    else if (gf === ga) draws++;
    else losses++;
  }

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
