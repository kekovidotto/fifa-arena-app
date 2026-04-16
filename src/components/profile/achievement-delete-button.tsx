"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteAchievement } from "@/app/actions/manual-achievement";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function AchievementDeleteButton({
  achievementId,
  profileUserId,
  trophyName,
  tournamentName,
  onDeleted,
}: {
  achievementId: number;
  profileUserId: string;
  trophyName: string;
  tournamentName: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteAchievement({ achievementId, profileUserId });
        toast.success("Conquista removida com sucesso");
        setOpen(false);
        onDeleted?.();
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Não foi possível remover.",
        );
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => setOpen(true)}
        className="size-7 shrink-0 text-red-400/80 hover:bg-red-500/15 hover:text-red-300"
        title="Remover troféu"
        aria-label={`Remover troféu: ${trophyName}, torneio ${tournamentName}`}
      >
        <Trash2 className="size-3.5" />
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <AlertDialogContent
          showCloseButton
          className="danger-card max-h-[min(85dvh,520px)] overflow-y-auto border-[rgba(239,68,68,0.45)] shadow-[0_0_20px_rgba(239,68,68,0.18),0_0_48px_rgba(239,68,68,0.08)] ring-1 ring-red-500/25"
        >
          <AlertTriangle
            className="mx-auto mb-1 size-11 text-m3-error drop-shadow-[0_0_12px_rgba(255,113,108,0.45)]"
            aria-hidden
          />
          <AlertDialogHeader className="space-y-0">
            <AlertDialogTitle>Remover Conquista?</AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-pretty text-sm text-on-surface-variant">
              <span className="block">
                Você está prestes a excluir o troféu{" "}
                <span className="font-semibold text-on-surface">{trophyName}</span>{" "}
                referente ao torneio{" "}
                <span className="font-semibold text-on-surface">
                  {tournamentName}
                </span>
                . Esta ação é permanente e afetará o XP e o nível do jogador.
              </span>
              <span className="mt-2 block text-xs font-semibold text-m3-error">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5 flex w-full flex-row gap-3 sm:mt-6">
            <AlertDialogCancel
              disabled={isPending}
              className="h-auto flex-1 rounded-xl border border-outline/50 bg-surface-container-low py-3 font-label text-sm font-semibold text-on-surface shadow-none hover:bg-surface-bright/40 hover:text-on-surface"
            >
              Cancelar
            </AlertDialogCancel>
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirm}
              className="neon-button-danger-solid inline-flex h-auto min-h-10 flex-1 items-center justify-center gap-2 rounded-xl py-3 font-headline text-sm font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                "Confirmar"
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
