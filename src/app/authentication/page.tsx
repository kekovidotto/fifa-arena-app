import { redirect } from "next/navigation";

/** Rota legada: use `/login`. */
export default async function AuthenticationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  if (tab === "register") {
    redirect("/login?tab=register");
  }
  redirect("/login");
}
