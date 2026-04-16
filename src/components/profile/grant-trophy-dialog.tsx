"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { grantManualAchievement } from "@/app/actions/manual-achievement";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ACHIEVEMENT_LABELS,
  ACHIEVEMENT_TYPES,
  type AchievementType,
} from "@/lib/achievement-types";
import { cn } from "@/lib/utils";

export function GrantTrophyDialog({
  targetUserId,
  triggerClassName,
}: {
  targetUserId: string;
  /** Estilo do botão que abre o diálogo (ex.: página de perfil). */
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AchievementType>("CHAMPION");
  const [tournamentName, setTournamentName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = tournamentName.trim();
    if (!name) {
      toast.error("Informe o nome do torneio.");
      return;
    }
    startTransition(async () => {
      try {
        await grantManualAchievement({
          userId: targetUserId,
          type,
          tournamentName: name,
        });
        toast.success("Troféu concedido!");
        setOpen(false);
        setTournamentName("");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível conceder.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "group w-full border border-amber-400/40 bg-amber-500/15 font-bold text-amber-300 hover:bg-amber-500/25",
            triggerClassName,
          )}
        >
          <span
            className="material-symbols-outlined mr-2 text-[22px] text-m3-primary transition-transform group-hover:rotate-12"
            aria-hidden
          >
            card_giftcard
          </span>
          Conceder prêmio manual
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="border-white/10 bg-[#0a0f1a] text-white sm:max-w-md"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">
              Conceder prêmio manual
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cria um registro de torneio finalizado e vincula o troféu
              permanentemente ao perfil.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label
                htmlFor="trophy-type"
                className="text-xs font-semibold text-white/80"
              >
                Tipo de troféu
              </label>
              <select
                id="trophy-type"
                value={type}
                onChange={(e) => setType(e.target.value as AchievementType)}
                className="trophy-select neon-input w-full rounded-xl border border-white/20 bg-[#0f172a] px-3 py-2.5 text-sm text-slate-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-neon-green/40"
              >
                {ACHIEVEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ACHIEVEMENT_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="trophy-tournament"
                className="text-xs font-semibold text-white/80"
              >
                Nome do torneio referente
              </label>
              <input
                id="trophy-tournament"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Ex.: Copa FIFA Arena 2026"
                autoComplete="off"
                className="neon-input w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 bg-transparent pt-4 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="text-white/70"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar troféu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
