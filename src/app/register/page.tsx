import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";

import { RegisterContent } from "./register-content";

export default async function RegisterPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (!isAdmin(session.user.email)) {
    redirect("/dashboard");
  }

  return <RegisterContent />;
}
