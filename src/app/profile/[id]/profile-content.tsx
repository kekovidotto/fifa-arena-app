"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CSSProperties } from "react";

import { GrantTrophyDialog } from "@/components/profile/grant-trophy-dialog";
import { TrophyRoomGrid } from "@/components/profile/trophy-room-grid";
import type { AchievementType } from "@/lib/achievement-types";
import type { UserProfileStats } from "@/lib/profile-stats";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

function Ms({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}

function xpBarPercent(stats: UserProfileStats) {
  if (stats.xpForNextLevel <= 0) return 0;
  const raw = (stats.xpIntoLevel / stats.xpForNextLevel) * 100;
  if (stats.totalXp === 0) return 5;
  return Math.min(100, Math.max(2, raw));
}

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  stats: UserProfileStats;
  achievementCounts: Record<AchievementType, number>;
  achievementRecords: {
    id: number;
    type: AchievementType;
    tournamentName: string;
    earnedAt: string;
  }[];
  viewerIsAdmin: boolean;
  /** E-mail só para o próprio usuário ou admin (perfil público oculta). */
  canViewEmail: boolean;
  isOwnProfile: boolean;
}

export function ProfileContent({
  user,
  stats,
  achievementCounts,
  achievementRecords,
  viewerIsAdmin,
  canViewEmail,
  isOwnProfile,
}: ProfileContentProps) {
  const xpPct = xpBarPercent(stats);

  return (
    <div className="bg-m3-background text-on-surface min-h-dvh font-body">
      <header className="sticky top-16 z-40 flex h-14 items-center justify-between border-b border-outline-variant/10 bg-[#080e1c]/95 px-4 backdrop-blur-md supports-backdrop-filter:bg-[#080e1c]/80">
        <Link
          href="/players"
          className="flex items-center gap-3 text-m3-primary transition-colors active:scale-95"
        >
          <Ms name="arrow_back" className="text-[22px]" />
          <span className="font-headline text-lg font-bold uppercase tracking-widest text-on-surface">
            {isOwnProfile ? "Meu perfil" : "Perfil"}
          </span>
        </Link>
      </header>

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-2xl space-y-8 px-6 pb-28 pt-8"
      >
        <motion.section variants={fadeUp} className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-linear-to-tr from-m3-primary to-[#00f1fe] p-1 shadow-[0_0_15px_rgba(133,173,255,0.35)]">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full rounded-full border-4 border-m3-background object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-m3-background bg-surface-container-highest font-headline text-4xl font-bold text-m3-primary">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 right-0 rounded-full bg-m3-secondary px-3 py-1 font-headline text-sm font-bold text-on-secondary shadow-lg">
              PRO
            </div>
          </div>
          <div className="mt-5 space-y-1">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              {user.name}
            </h2>
            {canViewEmail ? (
              <p className="font-label text-sm text-on-surface-variant">
                {user.email}
              </p>
            ) : null}
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          className="space-y-4 rounded-xl bg-surface-container-low p-6"
        >
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-m3-primary/30 bg-primary-container/20">
                <span className="font-headline text-2xl font-bold text-m3-primary [text-shadow:0_0_8px_rgba(133,173,255,0.55)]">
                  {stats.level}
                </span>
              </div>
              <div className="min-w-0 text-left">
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Nível atual
                </p>
                <p className="font-headline font-bold text-on-surface">
                  LEVEL {stats.level}
                </p>
              </div>
            </div>
            <p className="shrink-0 font-label text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
              {stats.xpIntoLevel} / {stats.xpForNextLevel} XP
            </p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <div
              className="h-full rounded-full bg-linear-to-r from-m3-primary to-[#00f1fe] shadow-[0_0_12px_#3B82F6] transition-[width] duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <p className="text-center font-label text-[10px] font-bold uppercase tracking-[0.2em] text-m3-primary">
            {stats.levelTitle}
          </p>
        </motion.section>

        <motion.section variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border-l-4 border-m3-primary bg-surface-container-low p-5">
            <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Gols totais
            </p>
            <p className="font-headline text-4xl font-bold tabular-nums text-on-surface">
              {stats.totalGoals}
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-[#00f1fe] bg-surface-container-low p-5">
            <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Aproveitamento
            </p>
            <p className="font-headline text-4xl font-bold tabular-nums text-on-surface">
              {stats.winRatePercent}
              <span className="text-xl opacity-50">%</span>
            </p>
          </div>

          <div className="relative col-span-2 overflow-hidden rounded-xl bg-surface-container-low p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  V - E - D
                </h3>
                <p className="font-label text-xs text-on-surface-variant">
                  {stats.gamesPlayed} jogos computados
                </p>
              </div>
              <Ms
                name="query_stats"
                className="text-4xl text-on-surface-variant opacity-20"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col items-center rounded-lg border-b-2 border-green-500/50 bg-surface-container/50 py-3">
                <span className="font-headline text-2xl font-bold text-on-surface">
                  {stats.wins}
                </span>
                <span className="font-label text-[10px] font-bold uppercase text-green-400">
                  Vitórias
                </span>
              </div>
              <div className="flex flex-1 flex-col items-center rounded-lg border-b-2 border-yellow-500/50 bg-surface-container/50 py-3">
                <span className="font-headline text-2xl font-bold text-on-surface">
                  {stats.draws}
                </span>
                <span className="font-label text-[10px] font-bold uppercase text-yellow-400">
                  Empates
                </span>
              </div>
              <div className="flex flex-1 flex-col items-center rounded-lg border-b-2 border-red-500/50 bg-surface-container/50 py-3">
                <span className="font-headline text-2xl font-bold text-on-surface">
                  {stats.losses}
                </span>
                <span className="font-label text-[10px] font-bold uppercase text-red-400">
                  Derrotas
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="space-y-4">
          <div className="mb-2 flex items-center gap-2">
            <Ms
              name="military_tech"
              className="text-m3-secondary text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            />
            <h3 className="font-headline text-xl font-bold uppercase tracking-tight">
              Sala de troféus
            </h3>
          </div>
          <TrophyRoomGrid
            profileUserId={user.id}
            achievementCounts={achievementCounts}
            achievementRecords={achievementRecords}
            viewerIsAdmin={viewerIsAdmin}
          />
        </motion.section>

        {viewerIsAdmin ? (
          <motion.section variants={fadeUp} className="pt-2">
            <GrantTrophyDialog
              targetUserId={user.id}
              triggerClassName="flex h-auto items-center justify-center gap-3 rounded-xl border border-m3-primary/20 bg-surface-container-low py-4 font-headline text-sm font-bold uppercase tracking-widest text-on-surface hover:bg-m3-primary/5 active:scale-[0.98]"
            />
          </motion.section>
        ) : null}
      </motion.main>
    </div>
  );
}
