"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteAchievement } from "@/app/actions/manual-achievement";
import { Button } from "@/components/ui/button";

export function AchievementDeleteButton({
  achievementId,
  profileUserId,
  title,
}: {
  achievementId: number;
  profileUserId: string;
  title: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Remover este troféu do perfil?\n${title}\nEsta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteAchievement({ achievementId, profileUserId });
        toast.success("Troféu removido.");
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Não foi possível remover.",
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      onClick={handleClick}
      className="size-7 shrink-0 text-red-400/80 hover:bg-red-500/15 hover:text-red-300"
      title="Remover troféu"
      aria-label={`Remover troféu: ${title}`}
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
