"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Standing } from "@/lib/tournament-utils";
import { QUALIFYING_POSITIONS } from "@/lib/tournament-utils";
import { cn } from "@/lib/utils";

export type StandingRow = Standing & {
  avatarUrl: string | null;
  /** Perfil Better Auth (`/profile/[id]`). */
  linkedUserId?: string | null;
};

export type StandingsGroupBlock = {
  id: number;
  name: string;
  standings: StandingRow[];
};

function MaterialSymbol({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn("select-none", className, "material-symbols-outlined")}
      aria-hidden
    >
      {name}
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function PositionBadge({ rank }: { rank: number }) {
  const label = String(rank).padStart(2, "0");
  const isFirst = rank === 1;
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-lg font-headline text-lg font-bold",
        isFirst
          ? "bg-m3-secondary/10 text-m3-secondary"
          : "bg-m3-primary/10 text-m3-primary",
      )}
    >
      {label}
    </div>
  );
}

function GoalDiffCell({ value }: { value: number }) {
  const cls =
    value > 0
      ? "text-tertiary"
      : value < 0
        ? "text-error-dim"
        : "text-on-surface-variant";
  const text = value > 0 ? `+${value}` : String(value);
  return (
    <span className={cn("font-headline text-lg font-medium", cls)}>{text}</span>
  );
}

export function StandingsContent({ groups }: { groups: StandingsGroupBlock[] }) {
  const [activeId, setActiveId] = useState<number | null>(
    groups[0]?.id ?? null,
  );

  const active = useMemo(
    () => groups.find((g) => g.id === activeId) ?? groups[0] ?? null,
    [groups, activeId],
  );

  const hasAnyPlayer = active && active.standings.length > 0;
  const withPlayed =
    active?.standings.filter((s) => s.played > 0) ?? [];
  const first = withPlayed[0];
  const second = withPlayed[1];

  if (groups.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <p className="text-center font-body text-on-surface-variant">
          Nenhum grupo cadastrado.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <motion.header
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mb-8 md:mb-10"
      >
        <div className="mb-2 flex items-center gap-3">
          <MaterialSymbol
            name="leaderboard"
            className="text-3xl text-m3-primary"
          />
          <div>
            <h1 className="font-headline text-3xl font-bold uppercase tracking-tight text-on-surface md:text-4xl lg:text-5xl">
              Classificação geral
            </h1>
            <p className="mt-1 font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant">
              Fase de grupos · FIFA Arena
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl bg-surface-container-low p-1 md:mt-8">
          {groups.map((g) => {
            const selected = g.id === active?.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveId(g.id)}
                className={cn(
                  "min-h-[40px] flex-1 rounded-lg px-4 py-2.5 font-label text-[10px] font-bold uppercase tracking-widest transition-all sm:min-w-0 sm:flex-none sm:text-xs",
                  selected
                    ? "bg-surface-container-highest text-m3-primary shadow-sm glow-primary-soft"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </motion.header>

      {!hasAnyPlayer ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="arena-glass-card editorial-shadow rounded-2xl border border-outline-variant/10 p-10 text-center font-body text-on-surface-variant"
        >
          <MaterialSymbol
            name="sports_soccer"
            className="mx-auto mb-3 text-4xl text-m3-primary/40"
          />
          Nenhum jogador neste grupo.
        </motion.div>
      ) : (
        <>
          {first ? (
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              <div className="arena-glass-card editorial-shadow relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-xl border border-outline-variant/10 p-8 md:col-span-2">
                <div className="pointer-events-none absolute right-0 top-0 p-6 font-headline text-8xl font-extrabold text-m3-primary/10 select-none">
                  #1
                </div>
                <div className="relative z-1">
                  <div className="mb-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "size-16 shrink-0 overflow-hidden rounded-full border-2 bg-surface-container-highest glow-primary-soft",
                        "border-m3-secondary/60",
                      )}
                    >
                      {first.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={first.avatarUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <MaterialSymbol
                            name="person"
                            className="text-3xl text-m3-secondary"
                          />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      {first.linkedUserId ? (
                        <Link
                          href={`/profile/${first.linkedUserId}`}
                          className="font-headline text-2xl font-bold italic text-m3-primary hover:underline"
                        >
                          {first.playerName}
                        </Link>
                      ) : (
                        <h3 className="font-headline text-2xl font-bold italic text-m3-primary">
                          {first.playerName}
                        </h3>
                      )}
                      <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                        {first.teamName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative z-1 flex flex-wrap gap-8">
                  <div>
                    <p className="mb-1 font-label text-[10px] uppercase text-on-surface-variant">
                      Pontos totais
                    </p>
                    <p className="font-headline text-4xl font-bold tracking-tighter text-m3-primary">
                      {first.points} P
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-label text-[10px] uppercase text-on-surface-variant">
                      Saldo de gols
                    </p>
                    <p className="font-headline text-4xl font-bold tracking-tighter text-on-surface">
                      {first.goalDifference > 0 ? "+" : ""}
                      {first.goalDifference}
                    </p>
                  </div>
                </div>
              </div>

              {second ? (
                <div className="flex flex-col justify-center rounded-xl border border-outline-variant/10 border-l-4 border-l-m3-secondary/50 bg-surface-container-low p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-headline text-2xl font-bold text-m3-secondary">
                      #2
                    </span>
                    <MaterialSymbol
                      name="emoji_events"
                      className="text-m3-secondary"
                    />
                  </div>
                  {second.linkedUserId ? (
                    <Link
                      href={`/profile/${second.linkedUserId}`}
                      className="font-headline text-xl font-bold text-on-surface hover:text-m3-primary"
                    >
                      {second.playerName}
                    </Link>
                  ) : (
                    <h4 className="font-headline text-xl font-bold text-on-surface">
                      {second.playerName}
                    </h4>
                  )}
                  <p className="mb-4 font-label text-xs uppercase text-on-surface-variant">
                    {second.teamName}
                  </p>
                  <div className="flex items-end justify-between gap-2">
                    <p className="font-headline text-3xl font-bold text-m3-secondary">
                      {second.points} P
                    </p>
                    <p className="text-right font-label text-xs text-on-surface-variant">
                      V: {second.wins} / E: {second.draws} / D: {second.losses}
                    </p>
                  </div>
                </div>
              ) : null}
            </motion.section>
          ) : null}

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="arena-glass-card editorial-shadow overflow-hidden rounded-2xl border border-outline-variant/10"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-highest/50">
                    <th className="px-4 py-5 font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-6">
                      #
                    </th>
                    <th className="px-4 py-5 font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-6">
                      Jogador
                    </th>
                    <th className="px-3 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-4">
                      P
                    </th>
                    <th className="px-3 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-4">
                      J
                    </th>
                    <th className="px-3 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-4">
                      V
                    </th>
                    <th className="px-3 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-4">
                      E
                    </th>
                    <th className="px-3 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-4">
                      D
                    </th>
                    <th className="px-3 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant md:px-4">
                      SG
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {active!.standings.map((s, i) => {
                    const rank = i + 1;
                    const qualified = i < QUALIFYING_POSITIONS;
                    const isLeader = rank === 1;
                    const pointsClass =
                      isLeader
                        ? "text-m3-secondary"
                        : "text-m3-primary";
                    return (
                      <tr
                        key={s.playerId}
                        className="transition-colors hover:bg-surface-container-highest/80"
                      >
                        <td className="py-5 pl-4 md:py-6 md:pl-6">
                          <PositionBadge rank={rank} />
                        </td>
                        <td className="py-5 pr-2 md:py-6 md:pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-surface-container-high",
                                isLeader
                                  ? "border-m3-secondary/70"
                                  : "border-m3-primary/50",
                              )}
                            >
                              {s.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={s.avatarUrl}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="size-full object-cover"
                                />
                              ) : (
                                <MaterialSymbol
                                  name="person"
                                  className={cn(
                                    "text-xl",
                                    isLeader
                                      ? "text-m3-secondary"
                                      : "text-on-surface-variant",
                                  )}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              {s.linkedUserId ? (
                                <Link
                                  href={`/profile/${s.linkedUserId}`}
                                  className="block truncate font-headline font-bold text-on-surface hover:text-m3-primary"
                                >
                                  {s.playerName}
                                </Link>
                              ) : (
                                <div className="truncate font-headline font-bold text-on-surface">
                                  {s.playerName}
                                </div>
                              )}
                              <div className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                                {s.teamName}
                              </div>
                              <div
                                className={cn(
                                  "mt-0.5 font-label text-[10px] font-bold uppercase tracking-widest",
                                  qualified
                                    ? i === 0
                                      ? "text-m3-secondary"
                                      : "text-m3-primary"
                                    : "text-on-surface-variant",
                                )}
                              >
                                {qualified ? "Promoção" : "Permanência"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          className={cn(
                            "px-3 py-5 text-center font-headline text-xl font-bold md:py-6 md:px-4",
                            pointsClass,
                          )}
                        >
                          {s.points}
                        </td>
                        <td className="px-3 py-5 text-center font-body text-on-surface md:py-6 md:px-4">
                          {s.played}
                        </td>
                        <td className="px-3 py-5 text-center font-body text-on-surface md:py-6 md:px-4">
                          {s.wins}
                        </td>
                        <td className="px-3 py-5 text-center font-body text-on-surface md:py-6 md:px-4">
                          {s.draws}
                        </td>
                        <td className="px-3 py-5 text-center font-body text-on-surface md:py-6 md:px-4">
                          {s.losses}
                        </td>
                        <td className="px-3 py-5 text-center md:py-6 md:px-4">
                          <GoalDiffCell value={s.goalDifference} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>

          {withPlayed.length === 0 ? (
            <p className="mt-6 text-center font-body text-sm text-on-surface-variant">
              Ainda não há partidas finalizadas neste grupo — a tabela reflete
              zeros até os jogos serem encerrados.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
