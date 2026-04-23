"use client";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  isAdmin: boolean;
}

export function AdminGuard({ children, fallback = null, isAdmin }: AdminGuardProps) {
  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
