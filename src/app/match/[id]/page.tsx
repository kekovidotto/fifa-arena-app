import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { MatchForm } from "@/components/match/match-form";
import { db } from "@/db";
import { groups, matches, players } from "@/db/schema";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);
  if (isNaN(matchId)) notFound();

  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId));

  if (!match) notFound();

  const [[homePlayer], [awayPlayer]] = await Promise.all([
    db.select().from(players).where(eq(players.id, match.playerHomeId)),
    db.select().from(players).where(eq(players.id, match.playerAwayId)),
  ]);

  if (!homePlayer || !awayPlayer) notFound();

  let groupName = "";
  if (match.groupId) {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, match.groupId));
    groupName = group?.name ?? "";
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MatchForm
        match={{
          id: match.id,
          scoreHome: match.scoreHome,
          scoreAway: match.scoreAway,
          status: match.status,
          stage: match.stage,
          type: match.type,
          groupName,
        }}
        homePlayer={{
          id: homePlayer.id,
          name: homePlayer.name,
          teamName: homePlayer.teamName,
        }}
        awayPlayer={{
          id: awayPlayer.id,
          name: awayPlayer.name,
          teamName: awayPlayer.teamName,
        }}
      />
    </div>
  );
}
