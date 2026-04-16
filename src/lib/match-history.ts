import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { goals, matchHistory, players } from "@/db/schema";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

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

  await tx
    .insert(matchHistory)
    .values({
      sourceMatchId: input.matchId,
      homeUserId: homeRow?.userId ?? null,
      awayUserId: awayRow?.userId ?? null,
      scoreHome: input.scoreHome,
      scoreAway: input.scoreAway,
      goalsHome,
      goalsAway,
      finishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: matchHistory.sourceMatchId,
      set: {
        homeUserId: homeRow?.userId ?? null,
        awayUserId: awayRow?.userId ?? null,
        scoreHome: input.scoreHome,
        scoreAway: input.scoreAway,
        goalsHome,
        goalsAway,
        finishedAt: new Date(),
      },
    });
}
