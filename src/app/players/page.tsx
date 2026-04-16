import { eq, isNotNull, sql } from "drizzle-orm";

import { HallOfFameGrid, type HallPlayer } from "@/components/players/hall-of-fame-grid";
import { db } from "@/db";
import { achievements, goals, players, user } from "@/db/schema";
import {
  ACHIEVEMENT_TYPES,
  type AchievementType,
} from "@/lib/achievement-types";

export const metadata = {
  title: "Hall da Fama | FIFA Arena",
  description: "Todos os jogadores cadastrados na FIFA Arena.",
};

export default async function PlayersPage() {
  const users = await db.select().from(user);

  const achRows = await db
    .select({
      userId: achievements.userId,
      type: achievements.type,
    })
    .from(achievements);

  const typesByUser = new Map<string, Set<AchievementType>>();
  const trophyCountByUser = new Map<string, number>();
  const championCountByUser = new Map<string, number>();

  for (const row of achRows) {
    const t = row.type as AchievementType;
    trophyCountByUser.set(
      row.userId,
      (trophyCountByUser.get(row.userId) ?? 0) + 1,
    );
    if (row.type === "CHAMPION") {
      championCountByUser.set(
        row.userId,
        (championCountByUser.get(row.userId) ?? 0) + 1,
      );
    }
    if (!typesByUser.has(row.userId)) {
      typesByUser.set(row.userId, new Set());
    }
    typesByUser.get(row.userId)!.add(t);
  }

  const goalSum = sql<number>`coalesce(cast(sum(${goals.count}) as integer), 0)`;

  const goalRows = await db
    .select({
      userId: players.userId,
      totalGoals: goalSum,
    })
    .from(players)
    .leftJoin(goals, eq(goals.playerId, players.id))
    .where(isNotNull(players.userId))
    .groupBy(players.userId);

  const goalsByUser = new Map(
    goalRows.map((r) => [r.userId as string, Number(r.totalGoals) || 0]),
  );

  const hallPlayers: HallPlayer[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    trophyTypes: ACHIEVEMENT_TYPES.filter((t) =>
      typesByUser.get(u.id)?.has(t),
    ),
    totalTrophies: trophyCountByUser.get(u.id) ?? 0,
    championCount: championCountByUser.get(u.id) ?? 0,
    totalGoals: goalsByUser.get(u.id) ?? 0,
  }));

  hallPlayers.sort((a, b) => {
    if (b.championCount !== a.championCount) {
      return b.championCount - a.championCount;
    }
    if (b.totalGoals !== a.totalGoals) {
      return b.totalGoals - a.totalGoals;
    }
    return a.name.localeCompare(b.name, "pt-BR");
  });

  return (
    <div className="min-h-dvh bg-m3-background pb-24 pt-8 font-body text-on-surface">
      <HallOfFameGrid players={hallPlayers} />
    </div>
  );
}
