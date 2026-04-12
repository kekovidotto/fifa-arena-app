import { asc } from "drizzle-orm";

import { HallOfFameGrid } from "@/components/players/hall-of-fame-grid";
import { db } from "@/db";
import { achievements, user } from "@/db/schema";
import {
  ACHIEVEMENT_TYPES,
  type AchievementType,
} from "@/lib/achievement-types";

export const metadata = {
  title: "Hall da Fama | FIFA Arena",
  description: "Todos os jogadores cadastrados na FIFA Arena.",
};

export default async function PlayersPage() {
  const users = await db.select().from(user).orderBy(asc(user.name));

  const achRows = await db
    .select({
      userId: achievements.userId,
      type: achievements.type,
    })
    .from(achievements);

  const typesByUser = new Map<string, Set<AchievementType>>();
  for (const row of achRows) {
    const t = row.type as AchievementType;
    if (!typesByUser.has(row.userId)) {
      typesByUser.set(row.userId, new Set());
    }
    typesByUser.get(row.userId)!.add(t);
  }

  const players = users.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    trophyTypes: ACHIEVEMENT_TYPES.filter((t) =>
      typesByUser.get(u.id)?.has(t),
    ),
  }));

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 pb-12 pt-8">
      <header className="mb-10 text-center">
        <p className="text-[10px] font-bold tracking-[0.35em] text-neon-blue/90">
          COMUNIDADE
        </p>
        <h1 className="mt-2 bg-linear-to-r from-white via-white to-neon-green/80 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
          Hall da Fama
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Jogadores cadastrados. Toque em um card para ver o perfil público e
          conquistas.
        </p>
      </header>

      <HallOfFameGrid players={players} />
    </div>
  );
}
