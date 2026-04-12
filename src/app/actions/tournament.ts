"use server";

import { and, eq, inArray, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export interface PlayerInput {
  name: string;
  team: string;
  userId?: string | null;
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateGroupDistribution(totalPlayers: number): number[] {
  const numGroups = Math.ceil(totalPlayers / 4);
  const baseSize = Math.floor(totalPlayers / numGroups);
  const remainder = totalPlayers % numGroups;

  return Array.from({ length: numGroups }, (_, i) =>
    i < remainder ? baseSize + 1 : baseSize,
  );
}

export async function generateTournament(playerInputs: PlayerInput[]) {
  await requireAdmin();

  if (playerInputs.length < 4) {
    throw new Error("O torneio precisa de no mínimo 4 jogadores.");
  }

  const active = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.status, "ACTIVE"))
    .limit(1);

  if (active.length > 0) {
    throw new Error(
      "Já existe um campeonato ativo. Finalize-o ou use o reset completo antes de criar outro.",
    );
  }

  const shuffled = shuffle(playerInputs);
  const groupSizes = calculateGroupDistribution(shuffled.length);

  const result = await db.transaction(async (tx) => {
    const [tournament] = await tx
      .insert(tournaments)
      .values({
        name: `Copa do Mundo — ${new Date().toLocaleDateString("pt-BR")}`,
        status: "ACTIVE",
      })
      .returning();

    const createdGroups = [];
    let cursor = 0;

    for (let i = 0; i < groupSizes.length; i++) {
      const groupName = `Grupo ${String.fromCharCode(65 + i)}`;

      const [group] = await tx
        .insert(groups)
        .values({ name: groupName, tournamentId: tournament.id })
        .returning();

      const groupPlayerInputs = shuffled.slice(cursor, cursor + groupSizes[i]);
      cursor += groupSizes[i];

      const groupPlayers = await tx
        .insert(players)
        .values(
          groupPlayerInputs.map((p) => ({
            name: p.name,
            teamName: p.team,
            groupId: group.id,
            userId: p.userId?.trim() ? p.userId.trim() : null,
          })),
        )
        .returning();

      const matchValues: {
        playerHomeId: number;
        playerAwayId: number;
        type: "GROUP";
        stage: string;
        status: "PENDING";
        groupId: number;
        tournamentId: number;
      }[] = [];

      for (let a = 0; a < groupPlayers.length; a++) {
        for (let b = a + 1; b < groupPlayers.length; b++) {
          matchValues.push({
            playerHomeId: groupPlayers[a].id,
            playerAwayId: groupPlayers[b].id,
            type: "GROUP",
            stage: "GROUP_STAGE",
            status: "PENDING",
            groupId: group.id,
            tournamentId: tournament.id,
          });
        }
      }

      if (matchValues.length > 0) {
        await tx.insert(matches).values(matchValues);
      }

      createdGroups.push({
        ...group,
        players: groupPlayers,
        matchCount: matchValues.length,
      });
    }

    return { tournament, createdGroups };
  });

  return result;
}

export async function resetMatchScores() {
  await requireAdmin();

  const [active] = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.status, "ACTIVE"))
    .limit(1);

  if (!active) {
    throw new Error("Não há campeonato ativo para resetar placares.");
  }

  await db.transaction(async (tx) => {
    const tourneyMatches = await tx
      .select({ id: matches.id, type: matches.type })
      .from(matches)
      .where(eq(matches.tournamentId, active.id));

    const matchIds = tourneyMatches.map((m) => m.id);
    if (matchIds.length > 0) {
      await tx.delete(goals).where(inArray(goals.matchId, matchIds));
    }

    const knockoutIds = tourneyMatches
      .filter((m) => m.type === "KNOCKOUT")
      .map((m) => m.id);
    if (knockoutIds.length > 0) {
      await tx.delete(matches).where(inArray(matches.id, knockoutIds));
    }

    await tx
      .update(matches)
      .set({ scoreHome: 0, scoreAway: 0, status: "PENDING" })
      .where(
        and(eq(matches.tournamentId, active.id), eq(matches.type, "GROUP")),
      );
  });

  revalidatePath("/", "layout");
}

export async function nuclearReset(): Promise<{ success: true }> {
  await requireAdmin();

  await db.transaction(async (tx) => {
    await tx.delete(goals);
    await tx.delete(matches);
    await tx.delete(players);
    await tx.delete(groups);

    const blockedRows = await tx
      .select({ tournamentId: achievements.tournamentId })
      .from(achievements)
      .groupBy(achievements.tournamentId);
    const blockedIds = blockedRows.map((r) => r.tournamentId);

    if (blockedIds.length === 0) {
      await tx.delete(tournaments);
    } else {
      await tx
        .delete(tournaments)
        .where(notInArray(tournaments.id, blockedIds));
      await tx.update(tournaments).set({ status: "FINISHED" });
    }
  });

  revalidatePath("/", "layout");
  return { success: true };
}
