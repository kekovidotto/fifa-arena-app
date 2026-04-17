"use server";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  goals,
  groups,
  matches,
  matchHistory,
  players,
  tournaments,
  user,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { revalidateTournamentSurfaces } from "@/lib/revalidate-tournament-surfaces";

export interface PlayerInput {
  name: string;
  team: string;
  userId?: string | null;
  /** Preenchido ao escolher time da biblioteca */
  teamLogo?: string | null;
  teamLibraryId?: number | null;
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
            teamLogo:
              p.teamLogo?.trim() ? p.teamLogo.trim().slice(0, 500) : null,
            teamId: p.teamLibraryId ?? null,
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

  revalidateTournamentSurfaces();
  return result;
}

export async function resetMatchScores(): Promise<{ success: true }> {
  await requireAdmin();

  await db.transaction(async (tx) => {
    const activeRows = await tx
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(eq(tournaments.status, "ACTIVE"))
      .limit(1);

    const activeId = activeRows[0]?.id;
    if (activeId == null) {
      return;
    }

    const idRows = await tx
      .select({ id: matches.id })
      .from(matches)
      .where(eq(matches.tournamentId, activeId));

    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return;
    }

    /**
     * Remove snapshots só destas partidas (edição ACTIVE), para o perfil não
     * ficar com V-E-D de jogos que voltaram a pendentes. O reset nuclear
     * grava histórico antes de apagar o torneio — esse fluxo não passa aqui.
     */
    await tx
      .delete(matchHistory)
      .where(inArray(matchHistory.sourceMatchId, ids));
    await tx.delete(goals).where(inArray(goals.matchId, ids));
    await tx
      .update(matches)
      .set({ scoreHome: 0, scoreAway: 0, status: "PENDING" })
      .where(inArray(matches.id, ids));
  });

  revalidateTournamentSurfaces();
  return { success: true };
}

export async function nuclearReset(): Promise<{ success: true }> {
  await requireAdmin();

  await db.transaction(async (tx) => {
    const activeRows = await tx
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(eq(tournaments.status, "ACTIVE"))
      .limit(1);

    const activeId = activeRows[0]?.id;
    if (activeId == null) {
      return;
    }

    const allTournamentMatches = await tx
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, activeId));

    const groupIdRows = await tx
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.tournamentId, activeId));
    const groupIds = groupIdRows.map((g) => g.id);

    const tournamentPlayerIds = new Set<number>();
    for (const m of allTournamentMatches) {
      tournamentPlayerIds.add(m.playerHomeId);
      tournamentPlayerIds.add(m.playerAwayId);
    }
    if (groupIds.length > 0) {
      const inGroup = await tx
        .select({ id: players.id })
        .from(players)
        .where(inArray(players.groupId, groupIds));
      for (const p of inGroup) {
        tournamentPlayerIds.add(p.id);
      }
    }

    const playerIdList = [...tournamentPlayerIds];
    const invitedIds: number[] = [];
    const veteranIds: number[] = [];

    if (playerIdList.length > 0) {
      const rows = await tx
        .select({ id: players.id, userId: players.userId })
        .from(players)
        .where(inArray(players.id, playerIdList));

      for (const r of rows) {
        const uid = r.userId?.trim();
        if (uid) veteranIds.push(r.id);
        else invitedIds.push(r.id);
      }
    }

    const matchIds = allTournamentMatches.map((m) => m.id);

    if (matchIds.length > 0) {
      await tx
        .delete(matchHistory)
        .where(inArray(matchHistory.sourceMatchId, matchIds));
      await tx.delete(goals).where(inArray(goals.matchId, matchIds));
      await tx.delete(matches).where(eq(matches.tournamentId, activeId));
    }

    if (invitedIds.length > 0) {
      await tx.delete(players).where(inArray(players.id, invitedIds));
    }

    if (veteranIds.length > 0) {
      const vets = await tx
        .select({
          id: players.id,
          userId: players.userId,
        })
        .from(players)
        .where(inArray(players.id, veteranIds));

      const uids = [
        ...new Set(
          vets
            .map((v) => v.userId?.trim())
            .filter((id): id is string => Boolean(id)),
        ),
      ];

      const namesByUserId = new Map<string, string>();
      if (uids.length > 0) {
        const urows = await tx
          .select({ id: user.id, name: user.name })
          .from(user)
          .where(inArray(user.id, uids));
        for (const u of urows) {
          namesByUserId.set(u.id, u.name);
        }
      }

      for (const v of vets) {
        const uid = v.userId!.trim();
        const displayName = namesByUserId.get(uid)?.trim() || "Jogador";
        await tx
          .update(players)
          .set({
            groupId: null,
            teamName: "A definir",
            teamLogo: null,
            teamId: null,
            name: displayName.slice(0, 255),
          })
          .where(eq(players.id, v.id));
      }
    }

    if (groupIds.length > 0) {
      await tx
        .update(players)
        .set({ groupId: null })
        .where(inArray(players.groupId, groupIds));
      await tx.delete(groups).where(eq(groups.tournamentId, activeId));
    }

    await tx.delete(tournaments).where(eq(tournaments.id, activeId));
  });

  revalidateTournamentSurfaces();
  return { success: true };
}
