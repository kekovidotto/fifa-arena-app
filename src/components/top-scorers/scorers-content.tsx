"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import type { Scorer } from "@/lib/tournament-utils";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" as const },
  },
};

function MaterialSymbol({
  name,
  className,
  filled,
}: {
  name: string;
  className?: string;
  /** Ícone preenchido (Material Symbols). */
  filled?: boolean;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={
        filled
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : undefined
      }
      aria-hidden
    >
      {name}
    </span>
  );
}

function GoalLabel({ count }: { count: number }) {
  return (
    <span className="font-label text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
      {count === 1 ? "GOL" : "GOLS"}
    </span>
  );
}

function PlayerNameLink({
  scorer,
  className,
}: {
  scorer: Scorer;
  className?: string;
}) {
  const nameClass = "font-body font-semibold text-on-surface";

  if (!scorer.userId) {
    return (
      <span className={cn(nameClass, className)}>{scorer.playerName}</span>
    );
  }

  return (
    <Link
      href={`/profile/${scorer.userId}`}
      className={cn(
        nameClass,
        "rounded-sm outline-none transition-colors hover:text-m3-primary focus-visible:ring-2 focus-visible:ring-m3-primary/50",
        className,
      )}
    >
      {scorer.playerName}
    </Link>
  );
}

export function ScorersContent({ scorers }: { scorers: Scorer[] }) {
  const leader = scorers[0];
  const runnersUp = scorers.slice(1);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-lg px-6 pt-6"
    >
      <motion.div
        variants={fadeUp}
        className="glass-card rounded-2xl p-6 pb-8 editorial-shadow"
      >
        {/* Cabeçalho editorial (template) */}
        <header className="mb-10">
          <h2 className="font-headline text-4xl font-bold leading-none tracking-tighter text-on-surface sm:text-5xl">
            ARTILHARIA
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-0.5 w-8 bg-m3-primary" />
            <span className="font-label text-xs font-extrabold uppercase tracking-[0.2em] text-m3-primary">
              RANKING DE GOLS
            </span>
          </div>
        </header>

        {scorers.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center gap-4 py-16 text-center"
          >
            <MaterialSymbol
              name="emoji_events"
              className="text-5xl text-on-surface-variant/40"
            />
            <p className="max-w-xs font-body text-sm text-on-surface-variant">
              Nenhum jogador cadastrado ainda. Quando houver inscrições e gols, a
              artilharia aparece aqui.
            </p>
          </motion.div>
        ) : (
          <>
            {/* 1º lugar — bento / neon dourado */}
            <motion.section variants={fadeUp} className="relative mb-8">
              <div className="absolute -top-4 -right-1 z-10 sm:-right-2">
                <MaterialSymbol
                  name="workspace_premium"
                  filled
                  className="text-5xl text-m3-secondary drop-shadow-lg"
                />
              </div>

              <div
                className={cn(
                  "glass-card scorers-leader-neon relative overflow-hidden rounded-xl border border-m3-secondary/40",
                )}
              >
                <div className="absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-m3-secondary/10 to-transparent" />
                <div className="relative z-10 flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center">
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="rounded-full bg-linear-to-br from-m3-primary to-primary-dim p-1 glow-primary-soft">
                        <div className="size-20 overflow-hidden rounded-full bg-surface-container-highest">
                          {leader.teamLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={leader.teamLogo}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <MaterialSymbol
                                name="shield"
                                className="text-3xl text-m3-primary"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -right-1 -bottom-1 rounded px-2 py-0.5 font-headline text-sm font-bold text-on-primary glow-secondary bg-m3-secondary">
                        #1
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 font-label text-[10px] font-bold tracking-widest text-m3-secondary uppercase">
                        Top Scorer
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl">
                          <PlayerNameLink scorer={leader} />
                        </h3>
                        <MaterialSymbol
                          name="sports_soccer"
                          filled
                          className="text-2xl text-m3-secondary"
                          aria-label="Artilheiro"
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <MaterialSymbol
                          name="shield"
                          className="text-sm text-m3-primary"
                        />
                        <span className="font-body text-sm font-medium text-on-surface-variant uppercase">
                          {leader.teamName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end md:shrink-0">
                    <div className="font-headline text-6xl font-bold leading-none text-m3-primary sm:text-7xl">
                      {leader.totalGoals}
                    </div>
                    <div className="font-label text-[10px] font-extrabold tracking-widest text-m3-primary/60 uppercase">
                      Gols marcados
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Demais posições */}
            {runnersUp.length > 0 ? (
              <motion.section variants={fadeUp} className="space-y-3">
                {runnersUp.map((scorer, i) => {
                  const rank = i + 2;
                  const isSilver = rank === 2;
                  const isBronze = rank === 3;

                  return (
                    <div
                      key={scorer.playerId}
                      className={cn(
                        "group flex items-center justify-between rounded-xl p-4 transition-colors",
                        "bg-surface-container-low hover:bg-surface-container-high",
                        isSilver &&
                          "ring-1 ring-slate-400/30 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)] hover:ring-slate-300/45",
                        isBronze &&
                          "ring-1 ring-amber-800/40 shadow-[inset_0_0_0_1px_rgba(180,83,9,0.15)] hover:ring-amber-700/55",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span className="font-headline w-6 shrink-0 text-center text-xl font-bold text-on-surface-variant">
                          {rank}
                        </span>
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-highest">
                          {scorer.teamLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={scorer.teamLogo}
                              alt=""
                              className="size-full object-contain p-0.5"
                            />
                          ) : (
                            <MaterialSymbol
                              name="person"
                              className="text-on-surface-variant transition-colors group-hover:text-m3-primary"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate">
                            <PlayerNameLink scorer={scorer} />
                          </h4>
                          <p className="font-label text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                            {scorer.teamName}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 pl-2 text-right">
                        <span className="font-headline text-2xl font-bold text-on-surface">
                          {scorer.totalGoals}
                        </span>
                        <GoalLabel count={scorer.totalGoals} />
                      </div>
                    </div>
                  );
                })}
              </motion.section>
            ) : null}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
