"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { goals, groups, matches, players } from "@/db/schema";

interface PlayerInput {
  name: string;
  team: string;
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
  if (playerInputs.length < 4) {
    throw new Error("O torneio precisa de no mínimo 4 jogadores.");
  }

  const shuffled = shuffle(playerInputs);
  const groupSizes = calculateGroupDistribution(shuffled.length);

  const result = await db.transaction(async (tx) => {
    const createdGroups = [];
    let cursor = 0;

    for (let i = 0; i < groupSizes.length; i++) {
      const groupName = `Grupo ${String.fromCharCode(65 + i)}`;

      const [group] = await tx
        .insert(groups)
        .values({ name: groupName })
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

    return createdGroups;
  });

  return result;
}

export async function resetMatchScores() {
  await db.transaction(async (tx) => {
    await tx.delete(goals);

    await tx.delete(matches).where(eq(matches.type, "KNOCKOUT"));

    await tx
      .update(matches)
      .set({ scoreHome: 0, scoreAway: 0, status: "PENDING" });
  });

  revalidatePath("/", "layout");
}

export async function nuclearReset() {
  await db.transaction(async (tx) => {
    await tx.delete(goals);
    await tx.delete(matches);
    await tx.delete(players);
    await tx.delete(groups);
  });

  revalidatePath("/", "layout");
}
