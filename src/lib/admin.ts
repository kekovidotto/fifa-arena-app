import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { user } from "@/db/schema";

import { auth } from "./auth";

export async function isAdmin(userId: string | undefined | null): Promise<boolean> {
  if (!userId) return false;
  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return dbUser?.role === "ADMIN";
}

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    throw new Error("Ação não permitida para este usuário.");
  }

  return session;
}
