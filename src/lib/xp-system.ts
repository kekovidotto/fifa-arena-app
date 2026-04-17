/** Regras de XP e nível usadas no perfil (FONTE A + FONTE B). */

export const XP_GOAL = 10;
export const XP_WIN = 50;
export const XP_DRAW = 20;
export const XP_PER_LEVEL = 1000;

export type MatchResult = "W" | "D" | "L";

export interface XpAccumulator {
  totalGoals: number;
  wins: number;
  draws: number;
  losses: number;
}

export function emptyAccumulator(): XpAccumulator {
  return { totalGoals: 0, wins: 0, draws: 0, losses: 0 };
}

export function addResultToAccumulator(
  acc: XpAccumulator,
  result: MatchResult,
  goalsScored: number,
): void {
  acc.totalGoals += goalsScored;
  if (result === "W") acc.wins += 1;
  else if (result === "D") acc.draws += 1;
  else acc.losses += 1;
}

export function mergeAccumulators(a: XpAccumulator, b: XpAccumulator): XpAccumulator {
  return {
    totalGoals: a.totalGoals + b.totalGoals,
    wins: a.wins + b.wins,
    draws: a.draws + b.draws,
    losses: a.losses + b.losses,
  };
}

export function xpFromAccumulator(acc: XpAccumulator): number {
  return (
    acc.totalGoals * XP_GOAL + acc.wins * XP_WIN + acc.draws * XP_DRAW
  );
}

export function levelTitleFor(level: number): string {
  if (level <= 1) return "Iniciante da Arena";
  if (level <= 3) return "Competidor da Arena";
  if (level <= 6) return "Veterano da Arena";
  if (level <= 10) return "Lenda da Arena";
  return "Mito da Arena";
}

export function levelProgressFromXp(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    levelTitle: levelTitleFor(level),
  };
}

export function winRatePercentFromAccumulator(acc: XpAccumulator): number {
  const gamesPlayed = acc.wins + acc.draws + acc.losses;
  const maxPoints = gamesPlayed * 3;
  const points = acc.wins * 3 + acc.draws;
  return maxPoints > 0 ? Math.round((points / maxPoints) * 1000) / 10 : 0;
}
