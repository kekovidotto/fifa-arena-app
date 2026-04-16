import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { achievements, tournaments, user } from "@/db/schema";
import {
  ACHIEVEMENT_TYPES,
  type AchievementType,
} from "@/lib/achievement-types";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { computeUserProfileStats } from "@/lib/profile-stats";

import { ProfileContent } from "./profile-content";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { id } = await params;

  const [profileUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!profileUser) {
    notFound();
  }

  const [stats, achievementRows] = await Promise.all([
    computeUserProfileStats(id),
    db
      .select({
        id: achievements.id,
        type: achievements.type,
        tournamentName: tournaments.name,
        earnedAt: achievements.createdAt,
      })
      .from(achievements)
      .innerJoin(tournaments, eq(achievements.tournamentId, tournaments.id))
      .where(eq(achievements.userId, id))
      .orderBy(desc(achievements.createdAt)),
  ]);

  const achievementCounts = Object.fromEntries(
    ACHIEVEMENT_TYPES.map((t) => [t, 0]),
  ) as Record<AchievementType, number>;
  for (const row of achievementRows) {
    const t = row.type as AchievementType;
    achievementCounts[t] += 1;
  }
  const viewerIsAdmin =
    session?.user?.email != null && isAdmin(session.user.email);
  const canViewEmail = Boolean(
    session?.user?.id &&
      (session.user.id === id || viewerIsAdmin),
  );

  const isOwnProfile = session?.user?.id === id;

  return (
    <ProfileContent
      user={{
        id: profileUser.id,
        name: profileUser.name,
        email: profileUser.email,
        image: profileUser.image,
      }}
      stats={stats}
      achievementCounts={achievementCounts}
      achievementRecords={achievementRows.map((r) => ({
        id: r.id,
        type: r.type as AchievementType,
        tournamentName: r.tournamentName,
        earnedAt:
          r.earnedAt instanceof Date
            ? r.earnedAt.toISOString()
            : String(r.earnedAt),
      }))}
      viewerIsAdmin={viewerIsAdmin}
      canViewEmail={canViewEmail}
      isOwnProfile={isOwnProfile}
    />
  );
}
