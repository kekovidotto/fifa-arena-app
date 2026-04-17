import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { LoginShell } from "./login-shell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect("/dashboard");
  }

  const { tab } = await searchParams;
  const defaultTab = tab === "register" ? "register" : "login";

  return <LoginShell defaultTab={defaultTab} />;
}
