import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { asSqliteTx } from "@/db/run-transaction";
import { goals, matches, matchHistory, players, tournaments } from "@/db/schema";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function resultForSide(
  scoreSide: number,
  scoreOpp: number,
): "W" | "D" | "L" {
  if (scoreSide > scoreOpp) return "W";
  if (scoreSide === scoreOpp) return "D";
  return "L";
}

/**
 * Snapshot pós-jogo dentro de transação **SQLite** (`better-sqlite3`):
 * só dentro de `db.transaction((tx) => …)` síncrono (`.get()` / `.run()`).
 */
export function upsertFinishedMatchSnapshotSync(
  tx: DbTransaction,
  input: {
    matchId: number;
    playerHomeId: number;
    playerAwayId: number;
    scoreHome: number;
    scoreAway: number;
  },
) {
  const rtx = asSqliteTx(tx);

  const meta = rtx
    .select({ tournamentName: tournaments.name })
    .from(matches)
    .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .where(eq(matches.id, input.matchId))
    .limit(1)
    .get();

  const tournamentName = meta?.tournamentName ?? "Torneio";

  const homeRow = rtx
    .select({ userId: players.userId })
    .from(players)
    .where(eq(players.id, input.playerHomeId))
    .limit(1)
    .get();

  const awayRow = rtx
    .select({ userId: players.userId })
    .from(players)
    .where(eq(players.id, input.playerAwayId))
    .limit(1)
    .get();

  const ghRow = rtx
    .select({ total: goals.count })
    .from(goals)
    .where(
      and(
        eq(goals.matchId, input.matchId),
        eq(goals.playerId, input.playerHomeId),
      ),
    )
    .limit(1)
    .get();

  const gaRow = rtx
    .select({ total: goals.count })
    .from(goals)
    .where(
      and(
        eq(goals.matchId, input.matchId),
        eq(goals.playerId, input.playerAwayId),
      ),
    )
    .limit(1)
    .get();

  const goalsHome = ghRow?.total ?? 0;
  const goalsAway = gaRow?.total ?? 0;
  const finishedAt = new Date();

  const homeUserId = homeRow?.userId?.trim() ? homeRow.userId.trim() : null;
  const awayUserId = awayRow?.userId?.trim() ? awayRow.userId.trim() : null;

  if (homeUserId) {
    rtx
      .insert(matchHistory)
      .values({
        sourceMatchId: input.matchId,
        userId: homeUserId,
        result: resultForSide(input.scoreHome, input.scoreAway),
        goals: goalsHome,
        tournamentName,
        finishedAt,
      })
      .onConflictDoUpdate({
        target: [matchHistory.sourceMatchId, matchHistory.userId],
        set: {
          result: resultForSide(input.scoreHome, input.scoreAway),
          goals: goalsHome,
          tournamentName,
          finishedAt,
        },
      })
      .run();
  }

  if (awayUserId) {
    rtx
      .insert(matchHistory)
      .values({
        sourceMatchId: input.matchId,
        userId: awayUserId,
        result: resultForSide(input.scoreAway, input.scoreHome),
        goals: goalsAway,
        tournamentName,
        finishedAt,
      })
      .onConflictDoUpdate({
        target: [matchHistory.sourceMatchId, matchHistory.userId],
        set: {
          result: resultForSide(input.scoreAway, input.scoreHome),
          goals: goalsAway,
          tournamentName,
          finishedAt,
        },
      })
      .run();
  }
}

export async function upsertFinishedMatchSnapshot(
  tx: DbTransaction,
  input: {
    matchId: number;
    playerHomeId: number;
    playerAwayId: number;
    scoreHome: number;
    scoreAway: number;
  },
) {
  const [meta] = await tx
    .select({ tournamentName: tournaments.name })
    .from(matches)
    .innerJoin(tournaments, eq(matches.tournamentId, tournaments.id))
    .where(eq(matches.id, input.matchId))
    .limit(1);

  const tournamentName = meta?.tournamentName ?? "Torneio";

  const [[homeRow], [awayRow]] = await Promise.all([
    tx
      .select({ userId: players.userId })
      .from(players)
      .where(eq(players.id, input.playerHomeId))
      .limit(1),
    tx
      .select({ userId: players.userId })
      .from(players)
      .where(eq(players.id, input.playerAwayId))
      .limit(1),
  ]);

  const [ghRow] = await tx
    .select({ total: goals.count })
    .from(goals)
    .where(
      and(
        eq(goals.matchId, input.matchId),
        eq(goals.playerId, input.playerHomeId),
      ),
    )
    .limit(1);

  const [gaRow] = await tx
    .select({ total: goals.count })
    .from(goals)
    .where(
      and(
        eq(goals.matchId, input.matchId),
        eq(goals.playerId, input.playerAwayId),
      ),
    )
    .limit(1);

  const goalsHome = ghRow?.total ?? 0;
  const goalsAway = gaRow?.total ?? 0;
  const finishedAt = new Date();

  const homeUserId = homeRow?.userId?.trim() ? homeRow.userId.trim() : null;
  const awayUserId = awayRow?.userId?.trim() ? awayRow.userId.trim() : null;

  if (homeUserId) {
    await tx
      .insert(matchHistory)
      .values({
        sourceMatchId: input.matchId,
        userId: homeUserId,
        result: resultForSide(input.scoreHome, input.scoreAway),
        goals: goalsHome,
        tournamentName,
        finishedAt,
      })
      .onConflictDoUpdate({
        target: [matchHistory.sourceMatchId, matchHistory.userId],
        set: {
          result: resultForSide(input.scoreHome, input.scoreAway),
          goals: goalsHome,
          tournamentName,
          finishedAt,
        },
      });
  }

  if (awayUserId) {
    await tx
      .insert(matchHistory)
      .values({
        sourceMatchId: input.matchId,
        userId: awayUserId,
        result: resultForSide(input.scoreAway, input.scoreHome),
        goals: goalsAway,
        tournamentName,
        finishedAt,
      })
      .onConflictDoUpdate({
        target: [matchHistory.sourceMatchId, matchHistory.userId],
        set: {
          result: resultForSide(input.scoreAway, input.scoreHome),
          goals: goalsAway,
          tournamentName,
          finishedAt,
        },
      });
  }
}
