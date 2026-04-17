"use server";

import { asc, like, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export async function searchAppUsers(query: string) {
  await requireAdmin();

  const q = query.trim().replace(/%/g, "").replace(/_/g, "");
  if (q.length < 2) {
    return [] as { id: string; name: string; email: string; image: string | null }[];
  }

  const pattern = `%${q.toLowerCase()}%`;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(
      or(
        like(sql`lower(${user.name})`, pattern),
        like(sql`lower(${user.email})`, pattern),
      ),
    )
    .orderBy(asc(user.name))
    .limit(12);

  return rows;
}
