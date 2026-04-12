"use client";

import { motion } from "framer-motion";
import {
  Award,
  Crosshair,
  Handshake,
  Heart,
  Medal,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { AchievementDeleteButton } from "@/components/profile/achievement-delete-button";
import { GrantTrophyDialog } from "@/components/profile/grant-trophy-dialog";
import {
  ACHIEVEMENT_LABELS,
  type AchievementType,
} from "@/lib/achievement-types";
import type { UserProfileStats } from "@/lib/profile-stats";

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

const TROPHY_CONFIG: {
  type: AchievementType;
  label: string;
  Icon: typeof Trophy;
  activeClass: string;
  glow: string;
}[] = [
  {
    type: "CHAMPION",
    label: "Campeão",
    Icon: Trophy,
    activeClass: "text-amber-400",
    glow: "shadow-[0_0_24px_rgba(251,191,36,0.45)] border-amber-400/40",
  },
  {
    type: "RUNNER_UP",
    label: "Vice",
    Icon: Medal,
    activeClass: "text-slate-200",
    glow: "shadow-[0_0_22px_rgba(226,232,240,0.35)] border-slate-300/35",
  },
  {
    type: "THIRD_PLACE",
    label: "3º Lugar",
    Icon: Award,
    activeClass: "text-amber-700",
    glow: "shadow-[0_0_20px_rgba(180,83,9,0.4)] border-amber-700/40",
  },
  {
    type: "TOP_SCORER",
    label: "Artilheiro",
    Icon: Crosshair,
    activeClass: "text-neon-green",
    glow: "shadow-[0_0_24px_rgba(34,197,94,0.45)] border-neon-green/40",
  },
  {
    type: "FAN_FAVORITE",
    label: "Queridinho da torcida",
    Icon: Heart,
    activeClass: "text-pink-400",
    glow: "shadow-[0_0_22px_rgba(244,114,182,0.4)] border-pink-400/40",
  },
  {
    type: "MVP",
    label: "MVP",
    Icon: Star,
    activeClass: "text-yellow-300",
    glow: "shadow-[0_0_22px_rgba(253,224,71,0.4)] border-yellow-300/40",
  },
  {
    type: "CRAQUE_DA_GALERA",
    label: "Craque da galera",
    Icon: Sparkles,
    activeClass: "text-cyan-300",
    glow: "shadow-[0_0_22px_rgba(103,232,249,0.4)] border-cyan-300/40",
  },
  {
    type: "FAIR_PLAY",
    label: "Fair play",
    Icon: Handshake,
    activeClass: "text-emerald-300",
    glow: "shadow-[0_0_22px_rgba(110,231,183,0.35)] border-emerald-300/40",
  },
];

function levelFromGames(games: number) {
  return Math.min(99, Math.floor(games / 3) + 1);
}

function xpLabel(games: number) {
  const xp = games * 25;
  return `${xp} XP`;
}

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  stats: UserProfileStats;
  unlockedAchievements: AchievementType[];
  achievementRecords: {
    id: number;
    type: AchievementType;
    tournamentName: string;
  }[];
  viewerIsAdmin: boolean;
  /** E-mail só para o próprio usuário ou admin (perfil público oculta). */
  canViewEmail: boolean;
}

export function ProfileContent({
  user,
  stats,
  unlockedAchievements,
  achievementRecords,
  viewerIsAdmin,
  canViewEmail,
}: ProfileContentProps) {
  const unlocked = new Set(unlockedAchievements);
  const level = levelFromGames(stats.gamesPlayed);

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-10 pt-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.header variants={fadeUp} className="text-center">
          <Link
            href="/players"
            className="mb-6 inline-flex text-xs font-semibold text-neon-blue hover:text-neon-blue/80"
          >
            ← Hall da Fama
          </Link>

          <div className="relative mx-auto mb-4 size-28">
            <div
              className="absolute inset-0 rounded-full bg-linear-to-br from-neon-green/30 to-neon-blue/20 blur-xl"
              aria-hidden
            />
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                referrerPolicy="no-referrer"
                className="relative size-full rounded-full border-2 border-white/10 object-cover ring-2 ring-neon-green/30"
              />
            ) : (
              <div className="relative flex size-full items-center justify-center rounded-full border-2 border-white/10 bg-white/5 text-3xl font-black text-white/40">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            {user.name}
          </h1>
          {canViewEmail && (
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="neon-badge inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold">
              <Shield className="size-3.5" />
              NÍVEL {level}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-4 py-1.5 text-xs font-bold text-neon-blue">
              <Zap className="size-3.5" />
              {xpLabel(stats.gamesPlayed)}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Nível baseado em partidas disputadas vinculadas à sua conta.
          </p>

          {viewerIsAdmin && (
            <div className="mx-auto mt-6 w-full max-w-xs">
              <GrantTrophyDialog targetUserId={user.id} />
            </div>
          )}
        </motion.header>

        {/* Stats grid */}
        <motion.section variants={fadeUp}>
          <h2 className="mb-3 text-xs font-bold tracking-widest text-muted-foreground">
            ESTATÍSTICAS
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                GOLS TOTAIS
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-neon-green">
                {stats.totalGoals}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                APROVEITAMENTO
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-neon-blue">
                {stats.winRatePercent}%
              </p>
            </div>
            <div className="glass-card col-span-2 rounded-xl p-4">
              <p className="mb-3 text-center text-[10px] font-semibold tracking-wider text-muted-foreground">
                V · E · D
              </p>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-black text-neon-green">
                    {stats.wins}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Vitórias</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-400">
                    {stats.draws}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Empates</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-red-400">
                    {stats.losses}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Derrotas</p>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                {stats.gamesPlayed} jogos computados
              </p>
            </div>
          </div>
        </motion.section>

        {/* Trophy room */}
        <motion.section variants={fadeUp}>
          <h2 className="mb-4 flex items-center justify-center gap-2 text-sm font-black tracking-widest text-white">
            <Trophy className="size-4 text-amber-400" />
            SALA DE TROFÉUS
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {TROPHY_CONFIG.map(({ type, label, Icon, activeClass, glow }) => {
              const on = unlocked.has(type);
              const recordsForType = achievementRecords.filter(
                (a) => a.type === type,
              );
              return (
                <div
                  key={type}
                  className={`glass-card relative flex flex-col items-center rounded-xl p-4 transition-all ${
                    on
                      ? glow
                      : "border-white/5 opacity-50 grayscale"
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={
                      on
                        ? { scale: [1, 1.06, 1], filter: "brightness(1.15)" }
                        : {}
                    }
                    transition={{ duration: 0.5 }}
                  >
                    <Icon
                      className={`size-12 ${on ? activeClass : "text-white/25"}`}
                      strokeWidth={on ? 2 : 1.5}
                    />
                  </motion.div>
                  <p
                    className={`mt-2 text-center text-xs font-bold ${on ? "text-white" : "text-white/35"}`}
                  >
                    {label}
                  </p>
                  {!on && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Bloqueado
                    </p>
                  )}
                  {viewerIsAdmin && on && recordsForType.length > 0 && (
                    <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-1 border-t border-white/10 pt-2">
                      {recordsForType.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex max-w-full items-center gap-0.5 rounded-md bg-white/5 px-1 py-0.5"
                          title={`${ACHIEVEMENT_LABELS[rec.type]} — ${rec.tournamentName}`}
                        >
                          <span className="max-w-[100px] truncate text-[9px] text-muted-foreground">
                            {rec.tournamentName}
                          </span>
                          <AchievementDeleteButton
                            achievementId={rec.id}
                            profileUserId={user.id}
                            title={`${ACHIEVEMENT_LABELS[rec.type]} — ${rec.tournamentName}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
