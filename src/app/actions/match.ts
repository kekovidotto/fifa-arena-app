"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { goals, matches } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { upsertFinishedMatchSnapshot } from "@/lib/match-history";

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

  await db.transaction(async (tx) => {
    await tx
      .update(matches)
      .set({
        scoreHome,
        scoreAway,
        status: "FINISHED",
      })
      .where(eq(matches.id, matchId));

    await tx.delete(goals).where(eq(goals.matchId, matchId));

    if (scoreHome > 0) {
      await tx.insert(goals).values({
        matchId,
        playerId: match.playerHomeId,
        count: scoreHome,
      });
    }
    if (scoreAway > 0) {
      await tx.insert(goals).values({
        matchId,
        playerId: match.playerAwayId,
        count: scoreAway,
      });
    }

    await upsertFinishedMatchSnapshot(tx, {
      matchId,
      playerHomeId: match.playerHomeId,
      playerAwayId: match.playerAwayId,
      scoreHome,
      scoreAway,
    });
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
