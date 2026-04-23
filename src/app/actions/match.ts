"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { asSqliteTx, runTransaction } from "@/db/run-transaction";
import { goals, matches } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import {
  upsertFinishedMatchSnapshot,
  upsertFinishedMatchSnapshotSync,
} from "@/lib/match-history";

import { advanceKnockoutWinner } from "./knockout";

interface UpdateMatchInput {
  matchId: number;
  scoreHome: number;
  scoreAway: number;
}

export async function updateMatchResult(input: UpdateMatchInput) {
  await requireAdmin();

  const { matchId, scoreHome, scoreAway } = input;

  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId));

  if (!match) {
    throw new Error("Partida não encontrada.");
  }

  await runTransaction({
    sqlite: (tx) => {
      const t = asSqliteTx(tx);
      t.update(matches)
        .set({
          scoreHome,
          scoreAway,
          status: "FINISHED",
        })
        .where(eq(matches.id, matchId))
        .run();
      t.delete(goals).where(eq(goals.matchId, matchId)).run();
      if (scoreHome > 0) {
        t.insert(goals).values({
          matchId,
          playerId: match.playerHomeId,
          count: scoreHome,
        }).run();
      }
      if (scoreAway > 0) {
        t.insert(goals).values({
          matchId,
          playerId: match.playerAwayId,
          count: scoreAway,
        }).run();
      }
      upsertFinishedMatchSnapshotSync(tx as Parameters<Parameters<typeof db.transaction>[0]>[0], {
        matchId,
        playerHomeId: match.playerHomeId,
        playerAwayId: match.playerAwayId,
        scoreHome,
        scoreAway,
      });
    },
    postgres: async (tx) => {
      const t = tx as typeof db;
      await t
        .update(matches)
        .set({
          scoreHome,
          scoreAway,
          status: "FINISHED",
        })
        .where(eq(matches.id, matchId));
      await t.delete(goals).where(eq(goals.matchId, matchId));
      if (scoreHome > 0) {
        await t.insert(goals).values({
          matchId,
          playerId: match.playerHomeId,
          count: scoreHome,
        });
      }
      if (scoreAway > 0) {
        await t.insert(goals).values({
          matchId,
          playerId: match.playerAwayId,
          count: scoreAway,
        });
      }
      await upsertFinishedMatchSnapshot(
        tx as Parameters<Parameters<typeof db.transaction>[0]>[0],
        {
          matchId,
          playerHomeId: match.playerHomeId,
          playerAwayId: match.playerAwayId,
          scoreHome,
          scoreAway,
        },
      );
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/artilheria");
  revalidatePath("/top-scorers");
  revalidatePath("/classificacao");
  revalidatePath("/standings");
  revalidatePath("/matches");
  revalidatePath("/knockout");
  revalidatePath(`/match/${matchId}`);
  revalidatePath("/profile", "layout");

  if (match.type === "KNOCKOUT") {
    await advanceKnockoutWinner(matchId);
  }

  const winnerId =
    scoreHome > scoreAway
      ? match.playerHomeId
      : scoreAway > scoreHome
        ? match.playerAwayId
        : null;

  return { success: true, winnerId };
}
