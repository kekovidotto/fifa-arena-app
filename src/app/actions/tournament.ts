"use server";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { asSqliteTx, runTransaction } from "@/db/run-transaction";
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
import { assertUniqueLobbyPlayers } from "@/lib/lobby-player-uniqueness";
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

  assertUniqueLobbyPlayers(playerInputs);

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

  const result = await runTransaction({
    sqlite: (tx) => {
      const t = asSqliteTx(tx);
      const tournRows = t
        .insert(tournaments)
        .values({
          name: `Copa do Mundo — ${new Date().toLocaleDateString("pt-BR")}`,
          status: "ACTIVE",
        })
        .returning()
        .all();
      const tournament = tournRows[0];
      if (!tournament) throw new Error("Falha ao criar torneio.");

      const createdGroups = [];
      let cursor = 0;

      for (let i = 0; i < groupSizes.length; i++) {
        const groupName = `Grupo ${String.fromCharCode(65 + i)}`;

        const groupRows = t
          .insert(groups)
          .values({ name: groupName, tournamentId: tournament.id })
          .returning()
          .all();
        const group = groupRows[0];
        if (!group) throw new Error("Falha ao criar grupo.");

        const groupPlayerInputs = shuffled.slice(cursor, cursor + groupSizes[i]);
        cursor += groupSizes[i];

        const groupPlayers = t
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
          .returning()
          .all();

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
          t.insert(matches).values(matchValues).run();
        }

        createdGroups.push({
          ...group,
          players: groupPlayers,
          matchCount: matchValues.length,
        });
      }

      return { tournament, createdGroups };
    },
    postgres: async (tx) => {
      const t = tx as typeof db;
      const [tournament] = await t
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

        const [group] = await t
          .insert(groups)
          .values({ name: groupName, tournamentId: tournament.id })
          .returning();

        const groupPlayerInputs = shuffled.slice(cursor, cursor + groupSizes[i]);
        cursor += groupSizes[i];

        const groupPlayers = await t
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
          await t.insert(matches).values(matchValues);
        }

        createdGroups.push({
          ...group,
          players: groupPlayers,
          matchCount: matchValues.length,
        });
      }

      return { tournament, createdGroups };
    },
  });

  revalidateTournamentSurfaces();
  return result;
}

export async function resetMatchScores(): Promise<{ success: true }> {
  await requireAdmin();

  await runTransaction({
    sqlite: (tx) => {
      const t = asSqliteTx(tx);
      const activeRows = t
        .select({ id: tournaments.id })
        .from(tournaments)
        .where(eq(tournaments.status, "ACTIVE"))
        .limit(1)
        .all();

      const activeId = activeRows[0]?.id;
      if (activeId == null) {
        return;
      }

      const idRows = t
        .select({ id: matches.id })
        .from(matches)
        .where(eq(matches.tournamentId, activeId))
        .all();

      const ids = idRows.map((r: { id: number }) => r.id);
      if (ids.length === 0) {
        return;
      }

      /* Remove snapshots destas partidas (ACTIVE); reset nuclear é outro fluxo. */
      t.delete(matchHistory)
        .where(inArray(matchHistory.sourceMatchId, ids))
        .run();
      t.delete(goals).where(inArray(goals.matchId, ids)).run();
      t.update(matches)
        .set({ scoreHome: 0, scoreAway: 0, status: "PENDING" })
        .where(inArray(matches.id, ids))
        .run();
    },
    postgres: async (tx) => {
      const t = tx as typeof db;
      const activeRows = await t
        .select({ id: tournaments.id })
        .from(tournaments)
        .where(eq(tournaments.status, "ACTIVE"))
        .limit(1);

      const activeId = activeRows[0]?.id;
      if (activeId == null) {
        return;
      }

      const idRows = await t
        .select({ id: matches.id })
        .from(matches)
        .where(eq(matches.tournamentId, activeId));

      const ids = idRows.map((r: { id: number }) => r.id);
      if (ids.length === 0) {
        return;
      }

      await t
        .delete(matchHistory)
        .where(inArray(matchHistory.sourceMatchId, ids));
      await t.delete(goals).where(inArray(goals.matchId, ids));
      await t
        .update(matches)
        .set({ scoreHome: 0, scoreAway: 0, status: "PENDING" })
        .where(inArray(matches.id, ids));
    },
  });

  revalidateTournamentSurfaces();
  return { success: true };
}

export async function nuclearReset(): Promise<{ success: true }> {
  await requireAdmin();

  await runTransaction({
    sqlite: (tx) => {
      const t = asSqliteTx(tx);
      const activeRows = t
        .select({ id: tournaments.id })
        .from(tournaments)
        .where(eq(tournaments.status, "ACTIVE"))
        .limit(1)
        .all();

      const activeId = activeRows[0]?.id;
      if (activeId == null) {
        return;
      }

      const allTournamentMatches = t
        .select()
        .from(matches)
        .where(eq(matches.tournamentId, activeId))
        .all() as {
        id: number;
        playerHomeId: number;
        playerAwayId: number;
      }[];

      const groupIdRows = t
        .select({ id: groups.id })
        .from(groups)
        .where(eq(groups.tournamentId, activeId))
        .all();
      const groupIds = groupIdRows.map((g: { id: number }) => g.id);

      const tournamentPlayerIds = new Set<number>();
      for (const m of allTournamentMatches) {
        tournamentPlayerIds.add(m.playerHomeId);
        tournamentPlayerIds.add(m.playerAwayId);
      }
      if (groupIds.length > 0) {
        const inGroup = t
          .select({ id: players.id })
          .from(players)
          .where(inArray(players.groupId, groupIds))
          .all();
        for (const p of inGroup) {
          tournamentPlayerIds.add(p.id);
        }
      }

      const playerIdList = [...tournamentPlayerIds];
      const invitedIds: number[] = [];
      const veteranIds: number[] = [];

      if (playerIdList.length > 0) {
        const rows = t
          .select({ id: players.id, userId: players.userId })
          .from(players)
          .where(inArray(players.id, playerIdList))
          .all();

        for (const r of rows) {
          const uid = r.userId?.trim();
          if (uid) veteranIds.push(r.id);
          else invitedIds.push(r.id);
        }
      }

      const matchIds = allTournamentMatches.map((m: { id: number }) => m.id);

      if (matchIds.length > 0) {
        t.delete(matchHistory)
          .where(inArray(matchHistory.sourceMatchId, matchIds))
          .run();
        t.delete(goals).where(inArray(goals.matchId, matchIds)).run();
        t.delete(matches).where(eq(matches.tournamentId, activeId)).run();
      }

      if (invitedIds.length > 0) {
        t.delete(players).where(inArray(players.id, invitedIds)).run();
      }

      if (veteranIds.length > 0) {
        const vets = t
          .select({
            id: players.id,
            userId: players.userId,
          })
          .from(players)
          .where(inArray(players.id, veteranIds))
          .all();

        const uidCandidates = vets
          .map((v: { userId: string | null }) => v.userId?.trim())
          .filter((id: string | undefined): id is string => Boolean(id));
        const uids = [...new Set(uidCandidates)] as string[];

        const namesByUserId = new Map<string, string>();
        if (uids.length > 0) {
          const urows = t
            .select({ id: user.id, name: user.name })
            .from(user)
            .where(inArray(user.id, uids))
            .all();
          for (const u of urows) {
            namesByUserId.set(u.id, u.name);
          }
        }

        for (const v of vets) {
          const uid = v.userId!.trim();
          const displayName = namesByUserId.get(uid)?.trim() || "Jogador";
          t.update(players)
            .set({
              groupId: null,
              teamName: "A definir",
              teamLogo: null,
              teamId: null,
              name: displayName.slice(0, 255),
            })
            .where(eq(players.id, v.id))
            .run();
        }
      }

      if (groupIds.length > 0) {
        t.update(players)
          .set({ groupId: null })
          .where(inArray(players.groupId, groupIds))
          .run();
        t.delete(groups).where(eq(groups.tournamentId, activeId)).run();
      }

      t.delete(tournaments).where(eq(tournaments.id, activeId)).run();
    },
    postgres: async (tx) => {
      const t = tx as typeof db;
      const activeRows = await t
        .select({ id: tournaments.id })
        .from(tournaments)
        .where(eq(tournaments.status, "ACTIVE"))
        .limit(1);

      const activeId = activeRows[0]?.id;
      if (activeId == null) {
        return;
      }

      const allTournamentMatches = await t
        .select()
        .from(matches)
        .where(eq(matches.tournamentId, activeId));

      const groupIdRows = await t
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
        const inGroup = await t
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
        const rows = await t
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
        await t
          .delete(matchHistory)
          .where(inArray(matchHistory.sourceMatchId, matchIds));
        await t.delete(goals).where(inArray(goals.matchId, matchIds));
        await t.delete(matches).where(eq(matches.tournamentId, activeId));
      }

      if (invitedIds.length > 0) {
        await t.delete(players).where(inArray(players.id, invitedIds));
      }

      if (veteranIds.length > 0) {
        const vets = await t
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
          const urows = await t
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
          await t
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
        await t
          .update(players)
          .set({ groupId: null })
          .where(inArray(players.groupId, groupIds));
        await t.delete(groups).where(eq(groups.tournamentId, activeId));
      }

      await t.delete(tournaments).where(eq(tournaments.id, activeId));
    },
  });

  revalidateTournamentSurfaces();
  return { success: true };
}
