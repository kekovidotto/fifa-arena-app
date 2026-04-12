import { asc, eq } from "drizzle-orm";

import { BracketContent } from "@/components/knockout/bracket-content";
import { db } from "@/db";
import { groups, matches, players } from "@/db/schema";
import { buildBracketRounds, buildMatchCards } from "@/lib/tournament-utils";

export default async function KnockoutPage() {
  const [allGroups, allPlayers, knockoutMatches] = await Promise.all([
    db.select().from(groups).orderBy(asc(groups.id)),
    db.select().from(players),
    db
      .select()
      .from(matches)
      .where(eq(matches.type, "KNOCKOUT"))
      .orderBy(asc(matches.id)),
  ]);

  const matchCards = buildMatchCards(knockoutMatches, allPlayers, allGroups);
  const rounds = buildBracketRounds(matchCards);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <BracketContent rounds={rounds} />
    </div>
  );
}
