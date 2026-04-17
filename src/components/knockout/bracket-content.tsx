"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Swords, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { type BracketMatch, type BracketRound } from "@/lib/tournament-utils";
import { cn } from "@/lib/utils";

interface BracketContentProps {
  rounds: BracketRound[];
  tournamentName: string | null;
  participantCount: number;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function initials(teamName: string, playerName: string): string {
  const s = (teamName || playerName).trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return s.slice(0, 2).toUpperCase();
}

export function BracketContent({
  rounds,
  tournamentName,
  participantCount,
}: BracketContentProps) {
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);

  useEffect(() => {
    setSelectedRoundIndex((idx) =>
      rounds.length === 0 ? 0 : Math.min(idx, rounds.length - 1),
    );
  }, [rounds.length]);

  const finalRound = rounds.find((r) => r.stage === "FINAL");
  const finalMatch = finalRound?.matches[0];
  const champion =
    finalMatch?.status === "FINISHED"
      ? finalMatch.scoreHome > finalMatch.scoreAway
        ? { name: finalMatch.homePlayerName, team: finalMatch.homeTeamName }
        : { name: finalMatch.awayPlayerName, team: finalMatch.awayTeamName }
      : null;

  const selectedRound = rounds[selectedRoundIndex];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-8"
    >
      <motion.header variants={fadeUp} className="py-6 text-center md:text-left">
        <h1 className="font-headline text-xl font-bold uppercase tracking-widest text-m3-primary">
          CHAVEAMENTO
        </h1>
        <p className="mt-1 font-body text-xs tracking-[0.2em] text-on-surface-variant">
          FASE ELIMINATÓRIA
        </p>
      </motion.header>

      {champion && (
        <motion.div
          variants={fadeUp}
          className="gold-card mb-8 rounded-2xl p-6 text-center"
        >
          <Trophy className="mx-auto mb-2 size-12 text-m3-secondary" />
          <p className="font-label text-xs font-bold tracking-widest text-m3-secondary/90">
            CAMPEÃO
          </p>
          <p className="mt-1 font-headline text-2xl font-bold text-on-surface">
            {champion.name}
          </p>
          <p className="mt-1 font-body text-sm text-on-surface-variant">
            {champion.team}
          </p>
        </motion.div>
      )}

      {rounds.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="arena-glass-card editorial-shadow rounded-2xl border border-outline-variant/10 p-10 text-center"
        >
          <Swords className="mx-auto mb-4 size-12 text-on-surface-variant" />
          <p className="font-headline text-lg font-bold text-on-surface">
            Mata-mata não iniciado
          </p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-on-surface-variant">
            Finalize todas as partidas da fase de grupos para gerar o
            chaveamento.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block font-label text-sm font-semibold text-m3-primary transition-colors hover:text-primary-fixed"
          >
            Ir para o Dashboard
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.nav
            variants={fadeUp}
            className="mb-10 flex gap-2 overflow-x-auto pb-2 no-scrollbar"
            role="tablist"
            aria-label="Fases do chaveamento"
          >
            {rounds.map((round, index) => {
              const selected = index === selectedRoundIndex;
              return (
                <button
                  key={round.stage}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`bracket-tab-${round.stage}`}
                  onClick={() => setSelectedRoundIndex(index)}
                  className={cn(
                    "shrink-0 rounded-xl px-6 py-3 font-headline text-sm font-bold tracking-tight whitespace-nowrap transition-all",
                    selected
                      ? "bg-m3-primary text-on-primary active-nav-glow"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest",
                  )}
                >
                  {round.label.toUpperCase()}
                </button>
              );
            })}
          </motion.nav>

          <motion.div
            variants={fadeUp}
            role="tabpanel"
            aria-labelledby={
              selectedRound
                ? `bracket-tab-${selectedRound.stage}`
                : undefined
            }
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {selectedRound?.matches.map((match, idx) => (
              <BracketMatchCard
                key={match.id ?? `tbd-${selectedRound.stage}-${idx}`}
                match={match}
                isFinal={selectedRound.stage === "FINAL"}
              />
            ))}
          </motion.div>

          <motion.footer
            variants={fadeUp}
            className="mt-16 grid grid-cols-1 gap-8 rounded-3xl bg-surface-container-low p-8 md:grid-cols-3"
          >
            <div>
              <span className="font-label text-[10px] font-extrabold tracking-[0.2em] text-m3-primary uppercase">
                Torneio atual
              </span>
              <h3 className="mt-1 font-headline text-2xl font-bold text-on-surface md:text-3xl">
                {tournamentName ?? "—"}
              </h3>
              <p className="mt-2 font-body text-sm text-on-surface-variant">
                Fase eliminatória
              </p>
            </div>
            <div className="flex flex-col items-start justify-center">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-headline text-2xl font-bold text-m3-secondary tabular-nums">
                    {participantCount}
                  </p>
                  <p className="font-label text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Jogadores
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center md:justify-end">
              <div className="text-right">
                <span
                  className="material-symbols-outlined mb-2 block text-4xl text-tertiary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden
                >
                  workspace_premium
                </span>
                <p className="ml-auto max-w-[180px] font-label text-xs text-on-surface-variant">
                  Acompanhe as partidas e confira quem levanta o troféu.
                </p>
              </div>
            </div>
          </motion.footer>
        </>
      )}
    </motion.div>
  );
}

function BracketMatchCard({
  match,
  isFinal,
}: {
  match: BracketMatch;
  isFinal: boolean;
}) {
  const isTBD = match.status === "TBD";
  const isFinished = match.status === "FINISHED";
  const isPending = match.status === "PENDING";

  const homeWon = isFinished && match.scoreHome > match.scoreAway;
  const awayWon = isFinished && match.scoreAway > match.scoreHome;

  const homeTeamLine =
    match.homeTeamName.trim() || match.homePlayerName;
  const awayTeamLine =
    match.awayTeamName.trim() || match.awayPlayerName;

  if (isTBD) {
    return (
      <div className="arena-glass-card flex flex-col gap-4 rounded-xl p-5 opacity-60 shadow-[inset_0_0_0_1px_rgba(133,173,255,0.15)]">
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-m3-primary/40" aria-hidden>
            schedule
          </span>
          <p className="font-headline text-xs font-bold tracking-widest uppercase">
            Aguardando definição
          </p>
        </div>
      </div>
    );
  }

  const cardInner = (
    <div
      className={cn(
        "arena-glass-card group relative flex flex-col gap-4 overflow-hidden rounded-xl p-5 shadow-[inset_0_0_0_1px_rgba(133,173,255,0.15)] transition-all",
        isPending && "hover:brightness-110",
        isFinal && "ring-1 ring-m3-secondary/25",
      )}
    >
      <div className="absolute top-0 right-0 p-2 opacity-20 transition-opacity group-hover:opacity-100">
        <span className="material-symbols-outlined text-sm" aria-hidden>
          sports_esports
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest p-1 font-headline text-xs font-bold text-m3-primary">
              {initials(match.homeTeamName, match.homePlayerName)}
            </div>
            <div className="min-w-0">
              <p className="font-label text-[10px] font-bold tracking-widest text-m3-primary uppercase">
                {match.homePlayerName}
              </p>
              <p className="truncate font-headline font-semibold text-on-surface">
                {homeTeamLine}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isFinished && (
              <span className="flex size-4 items-center justify-center">
                {homeWon ? (
                  <CheckCircle2 className="size-3.5 text-neon-green" />
                ) : null}
              </span>
            )}
            <span
              className={cn(
                "font-headline text-2xl font-bold tabular-nums",
                isFinished
                  ? homeWon
                    ? "text-on-surface"
                    : "text-on-surface/70"
                  : "text-on-surface opacity-40",
              )}
            >
              {isFinished ? match.scoreHome : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-outline-variant to-transparent opacity-30" />
          <span className="font-label text-[10px] font-extrabold text-outline italic">
            VS
          </span>
          <div className="h-px flex-1 bg-linear-to-r from-outline-variant via-outline-variant to-transparent opacity-30" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest p-1 font-headline text-xs font-bold text-m3-primary">
              {initials(match.awayTeamName, match.awayPlayerName)}
            </div>
            <div className="min-w-0">
              <p className="font-label text-[10px] font-bold tracking-widest text-m3-primary uppercase">
                {match.awayPlayerName}
              </p>
              <p className="truncate font-headline font-semibold text-on-surface">
                {awayTeamLine}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isFinished && (
              <span className="flex size-4 items-center justify-center">
                {awayWon ? (
                  <CheckCircle2 className="size-3.5 text-neon-green" />
                ) : null}
              </span>
            )}
            <span
              className={cn(
                "font-headline text-2xl font-bold tabular-nums",
                isFinished
                  ? awayWon
                    ? "text-on-surface"
                    : "text-on-surface/70"
                  : "text-on-surface opacity-40",
              )}
            >
              {isFinished ? match.scoreAway : "—"}
            </span>
          </div>
        </div>
      </div>

      {isPending && match.id ? (
        <Link
          href={`/match/${match.id}`}
          className="mt-4 block w-full rounded-xl bg-linear-to-r from-m3-primary to-primary-container py-3 text-center font-headline text-sm font-bold tracking-tight text-on-primary-container shadow-[0_0_12px_rgba(133,173,255,0.2)] transition-transform active:scale-[0.98]"
        >
          LANÇAR PLACAR
        </Link>
      ) : null}
    </div>
  );

  if (isFinished && match.id) {
    return (
      <Link href={`/match/${match.id}`} className="block rounded-xl">
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}
