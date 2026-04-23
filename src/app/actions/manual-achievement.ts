"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { asSqliteTx, runTransaction } from "@/db/run-transaction";
import { achievements, tournaments } from "@/db/schema";
import {
  ACHIEVEMENT_TYPES,
  type AchievementType,
} from "@/lib/achievement-types";
import { requireAdmin } from "@/lib/admin";

const grantSchema = z.object({
  userId: z.string().min(1),
  type: z.custom<AchievementType>(
    (val): val is AchievementType =>
      typeof val === "string" &&
      (ACHIEVEMENT_TYPES as readonly string[]).includes(val),
    { message: "Tipo de troféu inválido" },
  ),
  tournamentName: z.string().trim().min(1).max(255),
});

export async function grantManualAchievement(input: unknown) {
  await requireAdmin();

  const parsed = grantSchema.parse(input);

  try {
    await runTransaction({
      sqlite: (tx) => {
        const t = asSqliteTx(tx);
        const rows = t
          .insert(tournaments)
          .values({
            name: parsed.tournamentName,
            status: "FINISHED",
          })
          .returning()
          .all();
        const tournament = rows[0];
        if (!tournament) throw new Error("Falha ao criar torneio.");
        t.insert(achievements).values({
          userId: parsed.userId,
          tournamentId: tournament.id,
          type: parsed.type as AchievementType,
        }).run();
      },
      postgres: async (tx) => {
        const t = tx as typeof db;
        const [tournament] = await t
          .insert(tournaments)
          .values({
            name: parsed.tournamentName,
            status: "FINISHED",
          })
          .returning();

        await t.insert(achievements).values({
          userId: parsed.userId,
          tournamentId: tournament.id,
          type: parsed.type as AchievementType,
        });
      },
    });
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? String((e as { code?: string }).code)
        : "";
    if (code === "23505") {
      throw new Error(
        "Já existe este tipo de troféu para o mesmo torneio neste perfil.",
      );
    }
    throw e;
  }

  revalidatePath("/", "layout");
  revalidatePath(`/profile/${parsed.userId}`);
}

const deleteSchema = z.object({
  achievementId: z.coerce.number().int().positive(),
  profileUserId: z.string().min(1),
});

/** Remove um troféu (admin). `achievementId` é o id numérico da linha em `achievements`. */
export async function deleteAchievement(input: unknown) {
  await requireAdmin();

  const parsed = deleteSchema.parse(input);

  const [row] = await db
    .select({
      id: achievements.id,
      userId: achievements.userId,
    })
    .from(achievements)
    .where(eq(achievements.id, parsed.achievementId))
    .limit(1);

  if (!row) {
    throw new Error("Troféu não encontrado.");
  }
  if (row.userId !== parsed.profileUserId) {
    throw new Error("Este troféu não pertence a este perfil.");
  }

  await db
    .delete(achievements)
    .where(
      and(
        eq(achievements.id, parsed.achievementId),
        eq(achievements.userId, parsed.profileUserId),
      ),
    );

  revalidatePath("/", "layout");
  revalidatePath(`/profile/${parsed.profileUserId}`);
}
