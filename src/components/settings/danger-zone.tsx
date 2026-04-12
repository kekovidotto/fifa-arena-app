"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Loader2,
  RotateCcw,
  Skull,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  nuclearReset,
  resetMatchScores,
} from "@/app/actions/tournament";

type ModalType = "scores" | "nuclear" | null;

export function DangerZone() {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="size-4 text-red-400" />
          <h2 className="text-sm font-bold tracking-wider text-red-400">
            ZONA DE PERIGO
          </h2>
        </div>

        <div className="space-y-3">
          {/* Reset Scores */}
          <div className="danger-card rounded-xl p-4">
            <div className="mb-3">
              <p className="text-sm font-bold text-white">
                Resetar Apenas Placares
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                No campeonato <strong className="text-white">ativo</strong>,
                zera placares e remove gols; partidas de mata-mata são apagadas
                e a fase de grupos volta a ficar pendente. Usuários e troféus
                não são alterados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenModal("scores")}
              className="neon-button-danger flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wider transition-all active:scale-[0.98]"
            >
              <RotateCcw className="size-4" />
              RESETAR PLACARES
            </button>
          </div>

          {/* Nuclear Reset */}
          <div className="danger-card rounded-xl p-4">
            <div className="mb-3">
              <p className="text-sm font-bold text-white">
                Apagar Campeonato Completo
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Apaga gols, partidas, jogadores, grupos e torneios sem conquistas
                vinculadas. Contas e troféus permanecem; torneios com histórico
                de prêmios viram apenas registro finalizado (sem jogos).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenModal("nuclear")}
              className="neon-button-danger-solid flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wider transition-all active:scale-[0.98]"
            >
              <Skull className="size-4" />
              APAGAR TUDO
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {openModal === "scores" && (
          <ConfirmScoreResetModal onClose={() => setOpenModal(null)} />
        )}
        {openModal === "nuclear" && (
          <ConfirmNuclearModal onClose={() => setOpenModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ConfirmScoreResetModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      await resetMatchScores();
      toast.success("Placares resetados com sucesso!");
      onClose();
      router.refresh();
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <AlertTriangle className="mx-auto mb-3 size-12 text-amber-400" />
      <h3 className="text-lg font-bold text-white">Resetar Placares?</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        No torneio ativo: placares zerados, gols removidos e mata-mata apagado.
        Fase de grupos volta como pendente. Fora do campeonato ativo, nada muda.
      </p>
      <p className="mt-1 text-xs font-semibold text-red-400">
        Esta ação não pode ser desfeita.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="neon-button-danger-solid flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Confirmar"
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

function ConfirmNuclearModal({ onClose }: { onClose: () => void }) {
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = confirmation === "RESETAR";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleConfirm() {
    if (!isValid) return;
    startTransition(async () => {
      try {
        await nuclearReset();
        toast.success("Campeonato apagado com sucesso!");
        onClose();
        router.push("/dashboard");
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Não foi possível concluir o reset.",
        );
      }
    });
  }

  return (
    <ModalOverlay onClose={onClose}>
      <Skull className="mx-auto mb-3 size-12 text-red-400" />
      <h3 className="text-lg font-bold text-white">
        Apagar Campeonato?
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Remove todos os dados de jogo (gols, partidas, jogadores, grupos).
        Usuários e conquistas não são apagados; torneios ligados a troféus
        permanecem como registro finalizado.
      </p>
      <p className="mt-1 text-xs font-semibold text-red-400">
        Esta ação não pode ser desfeita.
      </p>

      <div className="mt-5">
        <label
          htmlFor="nuclear-confirm"
          className="mb-2 block text-xs text-muted-foreground"
        >
          Digite <span className="font-bold text-red-400">RESETAR</span>{" "}
          para confirmar:
        </label>
        <input
          ref={inputRef}
          id="nuclear-confirm"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
          placeholder="RESETAR"
          autoComplete="off"
          className="neon-input w-full rounded-xl bg-white/5 px-4 py-3 text-center text-sm font-bold tracking-widest text-white placeholder:text-white/20 focus:outline-none"
          style={{
            borderColor: isValid
              ? "rgba(239, 68, 68, 0.5)"
              : undefined,
            boxShadow: isValid
              ? "0 0 0 3px rgba(239, 68, 68, 0.15), 0 0 20px rgba(239, 68, 68, 0.1)"
              : undefined,
          }}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValid || isPending}
          className="neon-button-danger-solid flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "APAGAR TUDO"
          )}
        </button>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={handleBackdrop}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="danger-card relative w-full max-w-sm rounded-t-2xl p-6 text-center sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/40 transition-colors hover:text-white"
        >
          <X className="size-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
