import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminGuard } from "@/components/admin-guard";
import { DangerZone } from "@/components/settings/danger-zone";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <div className="mx-auto w-full max-w-lg px-4 py-6">
        <header className="mb-8 text-center">
          <h1 className="text-xl font-black tracking-widest text-white">
            CONFIGURAÇÕES
          </h1>
          <p className="mt-1 text-xs tracking-[0.3em] text-muted-foreground">
            GERENCIAR CAMPEONATO
          </p>
        </header>

        <AdminGuard
          fallback={
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Apenas o administrador pode gerenciar o campeonato.
              </p>
            </div>
          }
        >
          <DangerZone />
        </AdminGuard>
      </div>
    </div>
  );
}
