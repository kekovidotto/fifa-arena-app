import { revalidatePath } from "next/cache";

/** Invalida páginas afetadas por torneio / perfil / placares. */
export function revalidateTournamentSurfaces() {
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/classificacao");
  revalidatePath("/profile");
  revalidatePath("/profile", "layout");
  revalidatePath("/knockout");
  revalidatePath("/artilheria");
  revalidatePath("/top-scorers");
  revalidatePath("/standings");
  revalidatePath("/players");
  revalidatePath("/settings");
}
