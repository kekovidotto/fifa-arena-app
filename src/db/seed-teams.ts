import "dotenv/config";

import { ALL_TEAMS_SEED } from "@/constants/teams-data";

import { db } from "./index";
import { teamsLibrary } from "./schema";

async function main() {
  const existing = await db.select({ id: teamsLibrary.id }).from(teamsLibrary).limit(1);
  if (existing.length > 0) {
    console.log("teams_library já possui dados — seed ignorado.");
    process.exit(0);
  }

  await db.insert(teamsLibrary).values(
    ALL_TEAMS_SEED.map((t) => ({
      name: t.name,
      logoUrl: t.logoUrl,
      category: t.category,
    })),
  );

  console.log(`Inseridos ${ALL_TEAMS_SEED.length} times em teams_library.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
