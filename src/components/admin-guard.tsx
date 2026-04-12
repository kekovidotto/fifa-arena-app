"use client";

import { authClient } from "@/lib/auth-client";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Evita skeleton grande (ex.: menu lateral) — mostra nada até a sessão carregar. */
  compactPending?: boolean;
}

export function AdminGuard({
  children,
  fallback = null,
  compactPending = false,
}: AdminGuardProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    if (compactPending) {
      return null;
    }
    return (
      <div
        className="glass-card h-32 animate-pulse rounded-xl"
        aria-hidden
        aria-busy="true"
      />
    );
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
  const email = session?.user?.email ?? "";
  if (!email || !adminEmail || email !== adminEmail) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
