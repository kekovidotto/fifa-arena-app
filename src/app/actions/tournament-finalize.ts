"use server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  achievements,
  goals,
  groups,
  matches,
  players,
  tournaments,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { upsertFinishedMatchSnapshot } from "@/lib/match-history";
import { revalidateTournamentSurfaces } from "@/lib/revalidate-tournament-surfaces";

type AchievementType =
  | "CHAMPION"
  | "RUNNER_UP"
  | "THIRD_PLACE"
  | "TOP_SCORER";

async function totalGoalsForPlayerInTournament(
  playerId: number,
  tournamentId: number,
): Promise<number> {
  const rows = await db
    .select({
      total: sql<number>`coalesce(sum(${goals.count}), 0)::int`,
    })
    .from(goals)
    .innerJoin(matches, eq(goals.matchId, matches.id))
    .where(
      and(
        eq(goals.playerId, playerId),
        eq(matches.tournamentId, tournamentId),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function finalizeTournament() {
  await requireAdmin();

  const [active] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "ACTIVE"))
    .orderBy(desc(tournaments.id))
    .limit(1);

  if (!active) {
    throw new Error("Não há campeonato ativo para finalizar.");
  }

  const tourneyMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, active.id));

  if (tourneyMatches.some((m) => m.status === "PENDING")) {
    throw new Error("Ainda existem partidas pendentes neste campeonato.");
  }

  const finalMatch = tourneyMatches.find(
    (m) => m.type === "KNOCKOUT" && m.stage === "FINAL",
  );

  if (!finalMatch || finalMatch.status !== "FINISHED") {
    throw new Error("A final precisa estar disputada e finalizada.");
  }

  const championPid =
    finalMatch.scoreHome > finalMatch.scoreAway
      ? finalMatch.playerHomeId
      : finalMatch.playerAwayId;
  const runnerPid =
    finalMatch.scoreHome > finalMatch.scoreAway
      ? finalMatch.playerAwayId
      : finalMatch.playerHomeId;

  const semis = tourneyMatches.filter(
    (m) => m.type === "KNOCKOUT" && m.stage === "SEMI" && m.status === "FINISHED",
  );

  let thirdPid: number | null = null;
  if (semis.length >= 2) {
    const loser = (m: (typeof semis)[0]) =>
      m.scoreHome > m.scoreAway ? m.playerAwayId : m.playerHomeId;
    const l1 = loser(semis[0]);
    const l2 = loser(semis[1]);
    const g1 = await totalGoalsForPlayerInTournament(l1, active.id);
    const g2 = await totalGoalsForPlayerInTournament(l2, active.id);
    if (g1 > g2) thirdPid = l1;
    else if (g2 > g1) thirdPid = l2;
    else thirdPid = Math.min(l1, l2);
  } else if (semis.length === 1) {
    thirdPid =
      semis[0].scoreHome > semis[0].scoreAway
        ? semis[0].playerAwayId
        : semis[0].playerHomeId;
  }

  const tournamentPlayerIds = await db
    .select({ id: players.id })
    .from(players)
    .innerJoin(groups, eq(players.groupId, groups.id))
    .where(eq(groups.tournamentId, active.id));

  const ids = tournamentPlayerIds.map((r) => r.id);
  if (ids.length === 0) {
    throw new Error("Nenhum jogador encontrado neste torneio.");
  }

  const goalTotals = await db
    .select({
      playerId: goals.playerId,
      total: sql<number>`coalesce(sum(${goals.count}), 0)::int`,
    })
    .from(goals)
    .innerJoin(matches, eq(goals.matchId, matches.id))
    .where(
      and(eq(matches.tournamentId, active.id), inArray(goals.playerId, ids)),
    )
    .groupBy(goals.playerId)
    .orderBy(desc(sql`sum(${goals.count})`));

  const topRow = goalTotals[0];
  const topScorerPid = topRow && topRow.total > 0 ? topRow.playerId : null;

  const neededPlayerIds = new Set<number>([championPid, runnerPid]);
  if (thirdPid != null) neededPlayerIds.add(thirdPid);
  if (topScorerPid != null) neededPlayerIds.add(topScorerPid);

  const playerRows = await db
    .select()
    .from(players)
    .where(inArray(players.id, Array.from(neededPlayerIds)));

  const byId = new Map(playerRows.map((p) => [p.id, p]));

  const toInsert: {
    userId: string;
    tournamentId: number;
    type: AchievementType;
  }[] = [];

  function pushAchievement(playerId: number, type: AchievementType) {
    const p = byId.get(playerId);
    if (p?.userId) {
      toInsert.push({ userId: p.userId, tournamentId: active.id, type });
    }
  }

  pushAchievement(championPid, "CHAMPION");
  pushAchievement(runnerPid, "RUNNER_UP");
  if (thirdPid != null) pushAchievement(thirdPid, "THIRD_PLACE");
  if (topScorerPid != null) pushAchievement(topScorerPid, "TOP_SCORER");

  await db.transaction(async (tx) => {
    for (const m of tourneyMatches) {
      if (m.status !== "FINISHED") continue;
      await upsertFinishedMatchSnapshot(tx, {
        matchId: m.id,
        playerHomeId: m.playerHomeId,
        playerAwayId: m.playerAwayId,
        scoreHome: m.scoreHome,
        scoreAway: m.scoreAway,
      });
    }

    if (toInsert.length > 0) {
      await tx.insert(achievements).values(toInsert);
    }
    await tx
      .update(tournaments)
      .set({ status: "FINISHED" })
      .where(eq(tournaments.id, active.id));
  });

  revalidateTournamentSurfaces();
}
