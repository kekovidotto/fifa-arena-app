"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CircleCheck,
  LayoutDashboard,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateMatchResult } from "@/app/actions/match";
import { AdminGuard } from "@/components/admin-guard";
import { cn } from "@/lib/utils";

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

  const phaseLabel =
    match.type === "KNOCKOUT" ? "MATA-MATA" : "FASE DE GRUPOS";

  return (
    <div className="relative min-h-dvh bg-m3-background font-body text-on-surface selection:bg-m3-primary/30">
      {/* Decorative grid (new layout shell) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-size-[40px_40px] bg-[linear-gradient(#e3e7fc_1px,transparent_1px),linear-gradient(90deg,#e3e7fc_1px,transparent_1px)] opacity-[0.03]"
        aria-hidden
      />

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-m3-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Check className="size-16 text-tertiary" />
          </motion.div>
          <p className="font-headline text-lg font-bold text-on-surface">
            Resultado Registrado!
          </p>
          <p className="text-sm text-on-surface-variant">Redirecionando...</p>
        </motion.div>
      )}

      {isPending && !success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-m3-background/90 backdrop-blur-sm">
          <Loader2 className="size-12 animate-spin text-tertiary" />
          <p className="font-headline animate-pulse text-lg font-semibold text-tertiary">
            Registrando...
          </p>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center bg-m3-background px-4">
        <Link
          href="/dashboard"
          className="rounded-full p-2 text-m3-primary transition-colors duration-200 hover:bg-surface-variant active:scale-95"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="ml-4 font-headline text-xl font-bold uppercase tracking-widest text-on-surface">
          Lançar placar
        </h1>
        {isFinished && !isEditing && (
          <span className="ml-auto rounded-full border border-outline-variant/20 bg-surface-container-low px-3 py-1 font-label text-[10px] font-extrabold uppercase tracking-wider text-tertiary">
            Finalizada
          </span>
        )}
      </header>

      <main
        className={cn(
          "relative z-10 mx-auto min-h-dvh max-w-2xl px-4 pt-24",
          isEditing ? "pb-32" : "pb-12",
        )}
      >
        {/* Tournament phase badge */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="rounded-full border border-outline-variant/15 bg-surface-container-low px-6 py-2">
            <span className="font-label text-xs font-extrabold uppercase tracking-[0.2em] text-primary-fixed-dim">
              {phaseLabel}
            </span>
          </div>
          {match.groupName ? (
            <p className="font-headline text-sm font-bold text-on-surface">
              {match.groupName}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <PlayerScoreCard
            side="home"
            player={homePlayer}
            score={scoreHome}
            label="Mandante"
            onIncrement={() => increment("home")}
            onDecrement={() => decrement("home")}
            disabled={!isEditing}
          />

          <div className="relative z-20 -my-2 flex items-center justify-center">
            <div className="rounded-full border border-outline-variant/30 bg-m3-background px-4 py-1">
              <span className="font-headline text-sm font-black italic text-on-surface-variant">
                VS
              </span>
            </div>
          </div>

          <PlayerScoreCard
            side="away"
            player={awayPlayer}
            score={scoreAway}
            label="Visitante"
            onIncrement={() => increment("away")}
            onDecrement={() => decrement("away")}
            disabled={!isEditing}
          />
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <AdminGuard>
            {isEditing ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full rounded-xl bg-linear-to-r from-tertiary-fixed-dim to-tertiary py-5 font-headline text-lg font-extrabold uppercase tracking-wider text-on-tertiary-fixed shadow-[0_0_20px_rgba(0,241,254,0.3)] transition-all hover:shadow-[0_0_30px_rgba(0,241,254,0.5)] active:scale-[0.98] disabled:opacity-50"
              >
                Confirmar resultado
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full rounded-xl border border-m3-secondary/50 bg-m3-secondary/15 py-4 font-headline text-sm font-black uppercase tracking-widest text-m3-secondary shadow-[0_0_20px_rgba(252,192,37,0.15)] transition-all active:scale-[0.98]"
              >
                Editar resultado
              </button>
            )}
          </AdminGuard>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 py-3 font-label text-sm font-bold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <LayoutDashboard className="size-[18px]" />
            Voltar ao Dashboard
          </Link>
        </div>
      </main>

      {/* Bottom confirm (task-focused shell from layout HTML) */}
      <AdminGuard>
        {isEditing ? (
          <div className="pointer-events-none fixed bottom-0 z-50 flex w-full justify-center p-6 pb-8">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="pointer-events-auto flex flex-col items-center justify-center rounded-xl bg-linear-to-r from-m3-primary to-primary-container px-8 py-3 font-bold text-m3-background shadow-[0_0_12px_#3B82F6] transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <CircleCheck className="size-6" strokeWidth={2} />
              <span className="mt-1 font-label text-[10px] font-bold tracking-tighter">
                CONFIRMAR
              </span>
            </button>
          </div>
        ) : null}
      </AdminGuard>
    </div>
  );
}

function PlayerScoreCard({
  side,
  player,
  score,
  label,
  onIncrement,
  onDecrement,
  disabled,
}: {
  side: "home" | "away";
  player: PlayerInfo;
  score: number;
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled: boolean;
}) {
  const isHome = side === "home";
  const blurCorner = isHome
    ? "absolute -right-10 -top-10 size-32 bg-m3-primary/5 blur-[60px]"
    : "absolute -bottom-10 -left-10 size-32 bg-tertiary/5 blur-[60px]";
  const btnHover = isHome
    ? "hover:bg-m3-primary/20"
    : "hover:bg-tertiary/20";
  const iconClass = isHome ? "text-m3-primary" : "text-tertiary";
  const scoreGlow = isHome
    ? "[text-shadow:0_0_15px_rgba(133,173,255,0.4)]"
    : "[text-shadow:0_0_15px_rgba(0,241,254,0.4)]";

  return (
    <div className="group relative overflow-hidden rounded-xl bg-surface-container-high p-6">
      <div className={cn("pointer-events-none", blurCorner)} aria-hidden />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center text-center">
          <span className="mb-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">
            {label}
          </span>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            {player.name} - {player.teamName}
          </h2>
        </div>

        <div className="flex w-full max-w-[280px] items-center justify-between">
          <button
            type="button"
            onClick={onDecrement}
            disabled={disabled || score === 0}
            className={cn(
              "group/btn flex size-14 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-highest transition-all active:scale-90 disabled:opacity-30",
              btnHover,
            )}
            aria-label="Remover gol"
          >
            <Minus
              className={cn(
                "size-6 transition-transform group-hover/btn:scale-110",
                iconClass,
              )}
            />
          </button>

          <span
            className={cn(
              "font-headline text-7xl font-black tabular-nums",
              iconClass,
              scoreGlow,
            )}
          >
            {score}
          </span>

          <button
            type="button"
            onClick={onIncrement}
            disabled={disabled}
            className={cn(
              "group/btn flex size-14 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-highest transition-all active:scale-90 disabled:opacity-30",
              btnHover,
            )}
            aria-label="Adicionar gol"
          >
            <Plus className={cn("size-6 transition-transform group-hover/btn:scale-110", iconClass)} />
          </button>
        </div>
      </div>
    </div>
  );
}
