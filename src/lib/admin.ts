import { headers } from "next/headers";

import { auth } from "./auth";

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return email === process.env.ADMIN_EMAIL;
}

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    throw new Error("Ação não permitida para este usuário.");
  }

  return session;
}
