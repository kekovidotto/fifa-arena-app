import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { listTeamsLibrary } from "@/app/actions/teams";
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

  if (!(await isAdmin(session.user.id))) {
    redirect("/dashboard");
  }

  const teamsLibrary = await listTeamsLibrary();

  return <RegisterContent teamsLibrary={teamsLibrary} />;
}
