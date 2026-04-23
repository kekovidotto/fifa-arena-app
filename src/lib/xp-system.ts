/** Regras de XP e nível usadas no perfil (FONTE A + FONTE B). */

export const XP_GOAL = 10;
export const XP_WIN = 50;
export const XP_DRAW = 20;
export const XP_PER_LEVEL = 400;

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

type LolRankTier =
  | "BRONZE"
  | "PRATA"
  | "OURO"
  | "PLATINA"
  | "ESMERALDA"
  | "DIAMANTE"
  | "MESTRE"
  | "GRAO_MESTRE";

export interface LolRank {
  tier: LolRankTier;
  division: 1 | 2 | 3 | 4 | null;
  label: string;
}

/**
 * Mapeia nível para elo no estilo LoL.
 * Regra base: a cada 10 níveis sobe 1 divisão (4 -> 1), passando por Bronze até Diamante.
 * Depois: Mestre e Grão-Mestre sem divisão.
 */
export function lolRankFromLevel(level: number): LolRank {
  const normalizedLevel = Math.max(1, level);
  const bucket = Math.floor((normalizedLevel - 1) / 10);

  const divisionTrack = [
    { tier: "BRONZE", division: 4, label: "Bronze 4" },
    { tier: "BRONZE", division: 3, label: "Bronze 3" },
    { tier: "BRONZE", division: 2, label: "Bronze 2" },
    { tier: "BRONZE", division: 1, label: "Bronze 1" },
    { tier: "PRATA", division: 4, label: "Prata 4" },
    { tier: "PRATA", division: 3, label: "Prata 3" },
    { tier: "PRATA", division: 2, label: "Prata 2" },
    { tier: "PRATA", division: 1, label: "Prata 1" },
    { tier: "OURO", division: 4, label: "Ouro 4" },
    { tier: "OURO", division: 3, label: "Ouro 3" },
    { tier: "OURO", division: 2, label: "Ouro 2" },
    { tier: "OURO", division: 1, label: "Ouro 1" },
    { tier: "PLATINA", division: 4, label: "Platina 4" },
    { tier: "PLATINA", division: 3, label: "Platina 3" },
    { tier: "PLATINA", division: 2, label: "Platina 2" },
    { tier: "PLATINA", division: 1, label: "Platina 1" },
    { tier: "ESMERALDA", division: 4, label: "Esmeralda 4" },
    { tier: "ESMERALDA", division: 3, label: "Esmeralda 3" },
    { tier: "ESMERALDA", division: 2, label: "Esmeralda 2" },
    { tier: "ESMERALDA", division: 1, label: "Esmeralda 1" },
    { tier: "DIAMANTE", division: 4, label: "Diamante 4" },
    { tier: "DIAMANTE", division: 3, label: "Diamante 3" },
    { tier: "DIAMANTE", division: 2, label: "Diamante 2" },
    { tier: "DIAMANTE", division: 1, label: "Diamante 1" },
  ] as const;

  if (bucket < divisionTrack.length) {
    const rank = divisionTrack[bucket];
    return { tier: rank.tier, division: rank.division, label: rank.label };
  }

  if (bucket < divisionTrack.length + 4) {
    return { tier: "MESTRE", division: null, label: "Mestre" };
  }

  return { tier: "GRAO_MESTRE", division: null, label: "Grão-Mestre" };
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
