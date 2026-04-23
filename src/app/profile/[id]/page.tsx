import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { account, achievements, tournaments, user } from "@/db/schema";
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

  const [stats, achievementRows, googleAccountRow] = await Promise.all([
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
    db
      .select({ id: account.id })
      .from(account)
      .where(and(eq(account.userId, id), eq(account.providerId, "google")))
      .limit(1)
      .then((rows) => rows[0]),
  ]);

  const achievementCounts = Object.fromEntries(
    ACHIEVEMENT_TYPES.map((t) => [t, 0]),
  ) as Record<AchievementType, number>;
  for (const row of achievementRows) {
    const t = row.type as AchievementType;
    achievementCounts[t] += 1;
  }
  const viewerIsAdmin = await isAdmin(session?.user?.id);
  const canViewEmail = Boolean(
    session?.user?.id &&
      (session.user.id === id || viewerIsAdmin),
  );

  const isOwnProfile = session?.user?.id === id;
  const isGoogleAccount = Boolean(googleAccountRow);
  const canChangeAvatar = isOwnProfile && !isGoogleAccount;

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
      canChangeAvatar={canChangeAvatar}
    />
  );
}
