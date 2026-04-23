"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateOwnAvatar } from "@/app/actions/profile";
import { AVATAR_CATALOG } from "@/constants/avatar-catalog";
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

/** Progresso do nível: resto do XP total por 1000 (`xp-system` + `computeUserProfileStats`). */
function profileXpBarTargetPercent(stats: UserProfileStats) {
  if (stats.xpForNextLevel <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, (stats.xpIntoLevel / stats.xpForNextLevel) * 100),
  );
}

/** Frações do preenchimento da barra: esquerda = XP permanente, direita = XP pendente (torneio ativo). */
function xpBarPendingSplit(stats: UserProfileStats, fillPct: number) {
  if (stats.pendingXp <= 0 || stats.totalXp <= 0 || fillPct <= 0) {
    return { permanentFillPct: fillPct, pendingFillPct: 0 };
  }
  const share = stats.pendingXp / stats.totalXp;
  const pendingFillPct = fillPct * share;
  const permanentFillPct = fillPct - pendingFillPct;
  return { permanentFillPct, pendingFillPct };
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
  const [xpWidthPct, setXpWidthPct] = useState(0);
  const [currentImage, setCurrentImage] = useState(user.image);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSavingAvatar, startAvatarTransition] = useTransition();

  useEffect(() => {
    setXpWidthPct(0);
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setXpWidthPct(profileXpBarTargetPercent(stats));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [user.id, stats]);

  useEffect(() => {
    setCurrentImage(user.image);
  }, [user.image]);

  const avatarsByCategory = {
    cartoon: AVATAR_CATALOG.filter((avatar) => avatar.category === "cartoon"),
    gamer: AVATAR_CATALOG.filter((avatar) => avatar.category === "gamer"),
  };

  function handleAvatarSelect(imageUrl: string) {
    if (!isOwnProfile || imageUrl === currentImage) return;
    startAvatarTransition(async () => {
      try {
        await updateOwnAvatar({ imageUrl });
        setCurrentImage(imageUrl);
        toast.success("Avatar atualizado com sucesso.");
        setShowAvatarPicker(false);
      } catch {
        toast.error("Não foi possível atualizar o avatar.");
      }
    });
  }

  const { permanentFillPct, pendingFillPct } = xpBarPendingSplit(
    stats,
    xpWidthPct,
  );
  const fillInner =
    xpWidthPct > 0
      ? {
          permInnerPct: (permanentFillPct / xpWidthPct) * 100,
          pendInnerPct: (pendingFillPct / xpWidthPct) * 100,
        }
      : { permInnerPct: 0, pendInnerPct: 0 };

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
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
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
          {isOwnProfile ? (
            <div className="mt-4 w-full max-w-xl space-y-3 rounded-xl bg-surface-container-low p-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-m3-primary">
                  Avatar do perfil
                </p>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker((v) => !v)}
                  className="rounded-md px-3 py-1.5 font-label text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                >
                  {showAvatarPicker ? "Fechar" : "Alterar avatar"}
                </button>
              </div>
              {showAvatarPicker ? (
                <div className="space-y-3">
                  {(["cartoon", "gamer"] as const).map((categoryKey) => (
                    <div key={categoryKey} className="space-y-2">
                      <p className="font-label text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {categoryKey === "cartoon" ? "Cartoon" : "Gamer"}
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {avatarsByCategory[categoryKey].map((avatar) => {
                          const isSelected = currentImage === avatar.imageUrl;
                          return (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => handleAvatarSelect(avatar.imageUrl)}
                              disabled={isSavingAvatar}
                              className={cn(
                                "rounded-lg border p-0.5 transition-all",
                                isSelected
                                  ? "border-m3-primary shadow-[0_0_12px_rgba(133,173,255,0.45)]"
                                  : "border-outline-variant/20 hover:border-m3-primary/40",
                                isSavingAvatar && "opacity-60",
                              )}
                              aria-label={`Selecionar avatar ${avatar.name}`}
                              aria-pressed={isSelected}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={avatar.imageUrl}
                                alt={avatar.name}
                                className="size-10 rounded-md object-cover"
                                loading="lazy"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
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
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#030712]/90 shadow-inner ring-1 ring-blue-950/40">
            <div
              className="flex h-full max-w-full overflow-hidden rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${xpWidthPct}%` }}
            >
              {pendingFillPct > 0 && permanentFillPct > 0 ? (
                <>
                  <div
                    className={cn(
                      "h-full min-w-0 shrink-0 rounded-l-full bg-linear-to-r from-[#85adff] to-[#3B82F6]",
                      "shadow-[0_0_12px_rgba(133,173,255,0.45),0_0_20px_rgba(59,130,246,0.25)]",
                    )}
                    style={{ width: `${fillInner.permInnerPct}%` }}
                  />
                  <div
                    className={cn(
                      "h-full min-w-0 shrink-0 rounded-r-full bg-linear-to-r from-amber-400/95 to-amber-500",
                      "shadow-[0_0_16px_rgba(251,191,36,0.55),0_0_28px_rgba(245,158,11,0.35)]",
                    )}
                    style={{ width: `${fillInner.pendInnerPct}%` }}
                  />
                </>
              ) : pendingFillPct > 0 ? (
                <div
                  className={cn(
                    "h-full w-full rounded-full bg-linear-to-r from-amber-400/95 to-amber-500",
                    "shadow-[0_0_16px_rgba(251,191,36,0.55),0_0_28px_rgba(245,158,11,0.35)]",
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "h-full w-full rounded-full bg-linear-to-r from-[#85adff] to-[#3B82F6]",
                    "shadow-[0_0_14px_rgba(133,173,255,0.55),6px_0_22px_rgba(59,130,246,0.75),0_0_28px_rgba(59,130,246,0.35)]",
                  )}
                />
              )}
            </div>
          </div>
          {stats.pendingXp > 0 ? (
            <p className="text-center font-label text-[10px] font-semibold uppercase tracking-widest text-amber-400/90">
              +{stats.pendingXp} XP do campeonato atual (não confirmado)
            </p>
          ) : null}
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
