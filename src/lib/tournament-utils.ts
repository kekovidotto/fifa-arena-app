export const QUALIFYING_POSITIONS = 2;

export const STAGE_ORDER = ["ROUND_16", "QUARTER", "SEMI", "FINAL"] as const;

export const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Fase de Grupos",
  ROUND_16: "Oitavas de Final",
  QUARTER: "Quartas de Final",
  SEMI: "Semifinal",
  FINAL: "Final",
};

export interface BracketMatch {
  id: number | null;
  homePlayerName: string;
  awayPlayerName: string;
  homeTeamName: string;
  awayTeamName: string;
  scoreHome: number;
  scoreAway: number;
  status: "PENDING" | "FINISHED" | "TBD";
}

export interface BracketRound {
  stage: string;
  label: string;
  matches: BracketMatch[];
}

export function getStageForMatchCount(matchCount: number): string {
  switch (matchCount) {
    case 1:
      return "FINAL";
    case 2:
      return "SEMI";
    case 4:
      return "QUARTER";
    default:
      return `ROUND_${matchCount * 2}`;
  }
}

export function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function buildBracketRounds(
  knockoutCards: MatchCardData[],
): BracketRound[] {
  if (knockoutCards.length === 0) return [];

  const byStage = new Map<string, MatchCardData[]>();
  for (const m of knockoutCards) {
    if (!byStage.has(m.stage)) byStage.set(m.stage, []);
    byStage.get(m.stage)!.push(m);
  }

  let firstIdx: number = STAGE_ORDER.length;
  for (const stage of byStage.keys()) {
    const idx = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
    if (idx !== -1 && idx < firstIdx) firstIdx = idx;
  }
  if (firstIdx === STAGE_ORDER.length) return [];

  const firstStageMatches = byStage.get(STAGE_ORDER[firstIdx]) ?? [];
  let expected = firstStageMatches.length;
  const rounds: BracketRound[] = [];

  for (let i = firstIdx; i < STAGE_ORDER.length && expected >= 1; i++) {
    const stage = STAGE_ORDER[i];
    const existing = byStage.get(stage) ?? [];

    const slots: BracketMatch[] = [];
    for (let j = 0; j < expected; j++) {
      if (j < existing.length) {
        const m = existing[j];
        slots.push({
          id: m.id,
          homePlayerName: m.homePlayer.name,
          awayPlayerName: m.awayPlayer.name,
          homeTeamName: m.homePlayer.teamName,
          awayTeamName: m.awayPlayer.teamName,
          scoreHome: m.scoreHome,
          scoreAway: m.scoreAway,
          status: m.status as "PENDING" | "FINISHED",
        });
      } else {
        slots.push({
          id: null,
          homePlayerName: "Aguardando",
          awayPlayerName: "Aguardando",
          homeTeamName: "",
          awayTeamName: "",
          scoreHome: 0,
          scoreAway: 0,
          status: "TBD",
        });
      }
    }

    rounds.push({ stage, label: STAGE_LABELS[stage] ?? stage, matches: slots });
    expected = Math.ceil(expected / 2);
  }

  return rounds;
}

export interface Standing {
  playerId: number;
  playerName: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupData {
  id: number;
  name: string;
  standings: Standing[];
}

export interface NextMatch {
  id: number;
  homePlayer: { id: number; name: string; teamName: string };
  awayPlayer: { id: number; name: string; teamName: string };
  groupName: string;
}

export interface Scorer {
  playerId: number;
  playerName: string;
  teamName: string;
  /** URL do escudo (time em uso na inscrição). */
  teamLogo: string | null;
  /** Quando preenchido, o nome pode apontar para `/profile/[userId]`. */
  userId: string | null;
  totalGoals: number;
}

export interface MatchCardData {
  id: number;
  homePlayer: {
    id: number;
    name: string;
    teamName: string;
    teamLogo?: string | null;
  };
  awayPlayer: {
    id: number;
    name: string;
    teamName: string;
    teamLogo?: string | null;
  };
  scoreHome: number;
  scoreAway: number;
  status: string;
  type: string;
  stage: string;
  groupId: number | null;
  groupName: string;
}

interface RawMatch {
  id: number;
  playerHomeId: number;
  playerAwayId: number;
  scoreHome: number;
  scoreAway: number;
  status: string;
  type: string;
  stage: string;
  groupId: number | null;
}

interface RawPlayer {
  id: number;
  name: string;
  teamName: string;
  teamLogo?: string | null;
}

interface RawGroup {
  id: number;
  name: string;
}

export function buildMatchCards(
  rawMatches: RawMatch[],
  rawPlayers: RawPlayer[],
  rawGroups: RawGroup[],
): MatchCardData[] {
  const playerMap = new Map(rawPlayers.map((p) => [p.id, p]));
  const groupMap = new Map(rawGroups.map((g) => [g.id, g]));

  return rawMatches.map((m) => {
    const home = playerMap.get(m.playerHomeId);
    const away = playerMap.get(m.playerAwayId);
    const group = m.groupId ? groupMap.get(m.groupId) : undefined;

    return {
      id: m.id,
      homePlayer: home
        ? {
            id: home.id,
            name: home.name,
            teamName: home.teamName,
            teamLogo: home.teamLogo ?? null,
          }
        : { id: 0, name: "?", teamName: "?", teamLogo: null },
      awayPlayer: away
        ? {
            id: away.id,
            name: away.name,
            teamName: away.teamName,
            teamLogo: away.teamLogo ?? null,
          }
        : { id: 0, name: "?", teamName: "?", teamLogo: null },
      scoreHome: m.scoreHome,
      scoreAway: m.scoreAway,
      status: m.status,
      type: m.type,
      stage: m.stage,
      groupId: m.groupId,
      groupName: group?.name ?? "",
    };
  });
}

interface MatchRecord {
  playerHomeId: number;
  playerAwayId: number;
  scoreHome: number;
  scoreAway: number;
  status: string;
}

interface PlayerRecord {
  id: number;
  name: string;
  teamName: string;
}

export function calculateStandings(
  players: PlayerRecord[],
  matchRecords: MatchRecord[],
): Standing[] {
  const finished = matchRecords.filter((m) => m.status === "FINISHED");

  const standings: Standing[] = players.map((player) => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const m of finished) {
      const isHome = m.playerHomeId === player.id;
      const isAway = m.playerAwayId === player.id;
      if (!isHome && !isAway) continue;

      const gf = isHome ? m.scoreHome : m.scoreAway;
      const ga = isHome ? m.scoreAway : m.scoreHome;

      goalsFor += gf;
      goalsAgainst += ga;

      if (gf > ga) wins++;
      else if (gf === ga) draws++;
      else losses++;
    }

    return {
      playerId: player.id,
      playerName: player.name,
      teamName: player.teamName,
      played: wins + draws + losses,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: wins * 3 + draws,
    };
  });

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}
