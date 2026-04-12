"use server";

import { asc } from "drizzle-orm";

import { db } from "@/db";
import { teamsLibrary } from "@/db/schema";

export type TeamLibraryRow = {
  id: number;
  name: string;
  logoUrl: string;
  category: "EUROPE" | "WORLD_CUP";
};

export async function listTeamsLibrary(): Promise<TeamLibraryRow[]> {
  const rows = await db
    .select({
      id: teamsLibrary.id,
      name: teamsLibrary.name,
      logoUrl: teamsLibrary.logoUrl,
      category: teamsLibrary.category,
    })
    .from(teamsLibrary)
    .orderBy(asc(teamsLibrary.category), asc(teamsLibrary.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    logoUrl: r.logoUrl,
    category: r.category as TeamLibraryRow["category"],
  }));
}
