"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { groups, matches, players } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import {
  calculateStandings,
  getStageForMatchCount,
  nextPowerOf2,
  QUALIFYING_POSITIONS,
  STAGE_ORDER,
} from "@/lib/tournament-utils";

interface QualifiedPlayer {
  playerId: number;
  groupPosition: number;
  points: number;
  goalDifference: number;
  goalsFor: number;
}

export async function generateKnockoutPhase() {
  await requireAdmin();

  const existingKnockout = await db
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.type, "KNOCKOUT"))
    .limit(1);

  if (existingKnockout.length > 0) {
    throw new Error("A fase de mata-mata já foi gerada.");
  }

  const groupMatchList = await db
    .select()
    .from(matches)
    .where(eq(matches.type, "GROUP"));

  if (groupMatchList.length === 0) {
    throw new Error("Nenhuma partida de grupo encontrada.");
  }

  const pendingGroup = groupMatchList.find((m) => m.status === "PENDING");
  if (pendingGroup) {
    throw new Error("Ainda existem partidas da fase de grupos pendentes.");
  }

  const [allGroups, allPlayers] = await Promise.all([
    db.select().from(groups).orderBy(asc(groups.id)),
    db.select().from(players),
  ]);

  const tournamentId = allGroups[0]?.tournamentId;
  if (!tournamentId) {
    throw new Error("Torneio não encontrado para gerar o mata-mata.");
  }

  const qualified: QualifiedPlayer[] = [];
  const thirdPlaced: QualifiedPlayer[] = [];

  for (const group of allGroups) {
    const gPlayers = allPlayers.filter((p) => p.groupId === group.id);
    const gMatches = groupMatchList.filter((m) => m.groupId === group.id);
    const standings = calculateStandings(gPlayers, gMatches);

    standings.forEach((s, pos) => {
      const qp: QualifiedPlayer = {
        playerId: s.playerId,
        groupPosition: pos,
        points: s.points,
        goalDifference: s.goalDifference,
        goalsFor: s.goalsFor,
      };
      if (pos < QUALIFYING_POSITIONS) {
        qualified.push(qp);
      } else if (pos === QUALIFYING_POSITIONS) {
        thirdPlaced.push(qp);
      }
    });
  }

  let bracketSize = nextPowerOf2(qualified.length);

  if (qualified.length < bracketSize) {
    const sortedThirds = [...thirdPlaced].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    const needed = bracketSize - qualified.length;
    qualified.push(...sortedThirds.slice(0, needed));
  }

  while (qualified.length < bracketSize && bracketSize > 2) {
    bracketSize /= 2;
  }

  const seeded = [...qualified]
    .sort((a, b) => {
      if (a.groupPosition !== b.groupPosition)
        return a.groupPosition - b.groupPosition;
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    })
    .slice(0, bracketSize);

  const firstRoundStage = getStageForMatchCount(bracketSize / 2);

  const pairs: { home: number; away: number }[] = [];
  for (let i = 0; i < bracketSize / 2; i++) {
    pairs.push({
      home: seeded[i].playerId,
      away: seeded[bracketSize - 1 - i].playerId,
    });
  }

  await db.transaction(async (tx) => {
    for (const pair of pairs) {
      await tx.insert(matches).values({
        playerHomeId: pair.home,
        playerAwayId: pair.away,
        type: "KNOCKOUT",
        stage: firstRoundStage,
        status: "PENDING",
        tournamentId,
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/knockout");
}

export async function advanceKnockoutWinner(finishedMatchId: number) {
  const [finished] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, finishedMatchId));

  if (
    !finished ||
    finished.type !== "KNOCKOUT" ||
    finished.status !== "FINISHED"
  ) {
    return;
  }

  if (finished.stage === "FINAL") return;

  const stageIdx = STAGE_ORDER.indexOf(
    finished.stage as (typeof STAGE_ORDER)[number],
  );
  if (stageIdx === -1 || stageIdx >= STAGE_ORDER.length - 1) return;
  const nextStage = STAGE_ORDER[stageIdx + 1];

  const stageMatches = await db
    .select()
    .from(matches)
    .where(
      and(eq(matches.type, "KNOCKOUT"), eq(matches.stage, finished.stage)),
    )
    .orderBy(asc(matches.id));

  const pos = stageMatches.findIndex((m) => m.id === finishedMatchId);
  if (pos === -1) return;

  const siblingPos = pos % 2 === 0 ? pos + 1 : pos - 1;
  if (siblingPos < 0 || siblingPos >= stageMatches.length) return;

  const sibling = stageMatches[siblingPos];
  if (sibling.status !== "FINISHED") return;

  const evenMatch = pos % 2 === 0 ? finished : sibling;
  const oddMatch = pos % 2 === 0 ? sibling : finished;

  const winnerEven =
    evenMatch.scoreHome > evenMatch.scoreAway
      ? evenMatch.playerHomeId
      : evenMatch.playerAwayId;
  const winnerOdd =
    oddMatch.scoreHome > oddMatch.scoreAway
      ? oddMatch.playerHomeId
      : oddMatch.playerAwayId;

  const nextStageMatches = await db
    .select()
    .from(matches)
    .where(and(eq(matches.type, "KNOCKOUT"), eq(matches.stage, nextStage)));

  const pairIdx = Math.floor(pos / 2);
  if (pairIdx < nextStageMatches.length) return;

  await db.insert(matches).values({
    playerHomeId: winnerEven,
    playerAwayId: winnerOdd,
    type: "KNOCKOUT",
    stage: nextStage,
    status: "PENDING",
    tournamentId: finished.tournamentId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/knockout");
}
