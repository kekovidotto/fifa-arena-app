import { BracketContent } from "@/components/knockout/bracket-content";
import { getActiveTournamentBundle } from "@/lib/active-tournament-data";
import { buildBracketRounds, buildMatchCards } from "@/lib/tournament-utils";

export default async function KnockoutPage() {
  const { groups, players, matches } = await getActiveTournamentBundle();

  const knockoutMatches = matches
    .filter((m) => m.type === "KNOCKOUT")
    .sort((a, b) => a.id - b.id);

  const matchCards = buildMatchCards(knockoutMatches, players, groups);
  const rounds = buildBracketRounds(matchCards);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <BracketContent rounds={rounds} />
    </div>
  );
}
