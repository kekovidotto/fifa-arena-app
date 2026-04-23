import "dotenv/config";

import { eq } from "drizzle-orm";

import { ALL_TEAMS_SEED } from "@/constants/teams-data";

import { db } from "./index";
import { teamsLibrary } from "./schema";

async function main() {
  let inserted = 0;
  let updated = 0;

  for (const t of ALL_TEAMS_SEED) {
    const existing = await db
      .select({
        id: teamsLibrary.id,
        logoUrl: teamsLibrary.logoUrl,
        category: teamsLibrary.category,
      })
      .from(teamsLibrary)
      .where(eq(teamsLibrary.name, t.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(teamsLibrary).values({
        name: t.name,
        logoUrl: t.logoUrl,
        category: t.category,
      });
      inserted += 1;
      continue;
    }

    const row = existing[0];
    if (row.logoUrl !== t.logoUrl || row.category !== t.category) {
      await db
        .update(teamsLibrary)
        .set({
          logoUrl: t.logoUrl,
          category: t.category,
        })
        .where(eq(teamsLibrary.id, row.id));
      updated += 1;
    }
  }

  console.log(
    `Seed concluído: ${inserted} inseridos, ${updated} atualizados, ${ALL_TEAMS_SEED.length} no catálogo.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
