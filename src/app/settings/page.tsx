import { BottomNav } from "@/components/dashboard/bottom-nav";
import { DangerZone } from "@/components/settings/danger-zone";

export default function SettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <div className="mx-auto w-full max-w-lg px-4 py-6">
        <header className="mb-8 text-center">
          <h1 className="text-xl font-black tracking-widest text-white">
            CONFIGURAÇÕES
          </h1>
          <p className="mt-1 text-xs tracking-[0.3em] text-muted-foreground">
            GERENCIAR CAMPEONATO
          </p>
        </header>

        <DangerZone />
      </div>
      <BottomNav />
    </div>
  );
}
