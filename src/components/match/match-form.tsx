"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Plus,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateMatchResult } from "@/app/actions/match";
import { AdminGuard } from "@/components/admin-guard";

interface PlayerInfo {
  id: number;
  name: string;
  teamName: string;
}

interface MatchFormProps {
  match: {
    id: number;
    scoreHome: number;
    scoreAway: number;
    status: string;
    stage: string;
    type: string;
    groupName: string;
  };
  homePlayer: PlayerInfo;
  awayPlayer: PlayerInfo;
}

export function MatchForm({ match, homePlayer, awayPlayer }: MatchFormProps) {
  const [scoreHome, setScoreHome] = useState(match.scoreHome);
  const [scoreAway, setScoreAway] = useState(match.scoreAway);
  const [isEditing, setIsEditing] = useState(match.status === "PENDING");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const isFinished = match.status === "FINISHED";

  function increment(side: "home" | "away") {
    if (!isEditing) return;
    if (side === "home") setScoreHome((v) => v + 1);
    else setScoreAway((v) => v + 1);
  }

  function decrement(side: "home" | "away") {
    if (!isEditing) return;
    if (side === "home") setScoreHome((v) => Math.max(0, v - 1));
    else setScoreAway((v) => Math.max(0, v - 1));
  }

  function handleSubmit() {
    startTransition(async () => {
      await updateMatchResult({
        matchId: match.id,
        scoreHome,
        scoreAway,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    });
  }

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col px-4">
      {/* Success Overlay */}
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#020617]/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Check className="size-16 text-neon-green" />
          </motion.div>
          <p className="text-lg font-bold text-white">
            Resultado Registrado!
          </p>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {isPending && !success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#020617]/90 backdrop-blur-sm">
          <Loader2 className="size-12 animate-spin text-neon-green" />
          <p className="animate-pulse text-lg font-semibold text-neon-green">
            Registrando...
          </p>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-3 py-5">
        <Link
          href="/dashboard"
          className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">
            {match.type === "KNOCKOUT" ? "MATA-MATA" : "FASE DE GRUPOS"}
          </p>
          {match.groupName && (
            <p className="text-sm font-bold text-white">{match.groupName}</p>
          )}
        </div>
        {isFinished && !isEditing && (
          <span className="ml-auto rounded-full bg-neon-green/10 px-3 py-1 text-xs font-bold text-neon-green">
            FINALIZADA
          </span>
        )}
      </header>

      {/* Score Cards */}
      <div className="mt-2 flex flex-col gap-4">
        <PlayerScoreCard
          player={homePlayer}
          score={scoreHome}
          label="MANDANTE"
          onIncrement={() => increment("home")}
          onDecrement={() => decrement("home")}
          disabled={!isEditing}
        />

        <div className="flex items-center justify-center py-1">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-white/10" />
            <Swords className="size-5 text-white/20" />
            <div className="h-px w-12 bg-white/10" />
          </div>
        </div>

        <PlayerScoreCard
          player={awayPlayer}
          score={scoreAway}
          label="VISITANTE"
          onIncrement={() => increment("away")}
          onDecrement={() => decrement("away")}
          disabled={!isEditing}
        />
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 pb-8">
        <AdminGuard>
          {isEditing ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="neon-button-primary flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="size-5" />
              CONFIRMAR RESULTADO
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="neon-button-blue flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold tracking-wider transition-all active:scale-[0.98]"
            >
              EDITAR RESULTADO
            </button>
          )}
        </AdminGuard>
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center rounded-xl bg-white/5 py-3.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

function PlayerScoreCard({
  player,
  score,
  label,
  onIncrement,
  onDecrement,
  disabled,
}: {
  player: PlayerInfo;
  score: number;
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled: boolean;
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <p className="mb-1 text-center text-[10px] font-semibold tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mb-5 text-center">
        <p className="text-lg font-bold text-white">{player.name}</p>
        <p className="text-sm text-neon-blue">{player.teamName}</p>
      </div>

      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={onDecrement}
          disabled={disabled || score === 0}
          className="flex size-14 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30"
          aria-label="Remover gol"
        >
          <Minus className="size-6" />
        </button>

        <div className="flex w-20 items-center justify-center">
          <span className="text-6xl font-black tabular-nums text-white">
            {score}
          </span>
        </div>

        <button
          type="button"
          onClick={onIncrement}
          disabled={disabled}
          className="flex size-14 items-center justify-center rounded-xl bg-neon-green/10 text-neon-green transition-all hover:bg-neon-green/20 active:scale-95 disabled:opacity-30"
          aria-label="Adicionar gol"
        >
          <Plus className="size-6" />
        </button>
      </div>

      {!disabled && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Toque <span className="text-neon-green">+</span> para adicionar gol
        </p>
      )}
    </div>
  );
}
