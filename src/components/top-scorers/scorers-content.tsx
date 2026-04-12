"use client";

import { motion } from "framer-motion";
import { Crown, Target, Trophy, User } from "lucide-react";

import type { Scorer } from "@/lib/tournament-utils";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function ScorersContent({ scorers }: { scorers: Scorer[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-lg px-4"
    >
      {/* Header */}
      <motion.header variants={fadeUp} className="py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Target className="size-6 text-neon-green" />
          <h1 className="text-xl font-black tracking-widest text-white">
            ARTILHARIA
          </h1>
        </div>
        <p className="text-xs tracking-[0.3em] text-neon-blue">
          RANKING DE GOLS
        </p>
      </motion.header>

      {/* Leaderboard */}
      {scorers.length > 0 ? (
        <div className="flex flex-col gap-3 pb-4">
          {scorers.map((scorer, index) => (
            <motion.div
              key={scorer.playerId}
              variants={fadeUp}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 ${
                index === 0 ? "gold-card" : "glass-card"
              }`}
            >
              <PositionBadge position={index + 1} />

              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  index === 0
                    ? "bg-amber-400/20 text-amber-400"
                    : index === 1
                      ? "bg-gray-300/20 text-gray-300"
                      : index === 2
                        ? "bg-orange-400/20 text-orange-400"
                        : "bg-white/5 text-white/40"
                }`}
              >
                {index === 0 ? (
                  <Crown className="size-5" />
                ) : (
                  <User className="size-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate font-semibold ${
                    index === 0 ? "text-amber-100" : "text-white"
                  }`}
                >
                  {scorer.playerName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {scorer.teamName}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <span
                  className={`text-xl font-black tabular-nums ${
                    index === 0 ? "text-amber-400" : "text-neon-green"
                  }`}
                >
                  {scorer.totalGoals}
                </span>
                <span className="text-[9px] text-muted-foreground">GOLS</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center gap-3 py-20 text-center"
        >
          <Trophy className="size-12 text-white/10" />
          <p className="text-sm text-white/30">
            Nenhum gol registrado ainda.
            <br />
            Lance resultados para ver a artilharia!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function PositionBadge({ position }: { position: number }) {
  const styles: Record<number, string> = {
    1: "bg-amber-400/20 text-amber-400 border-amber-400/30",
    2: "bg-gray-300/20 text-gray-300 border-gray-300/30",
    3: "bg-orange-400/20 text-orange-400 border-orange-400/30",
  };

  const cls =
    styles[position] ?? "bg-white/5 text-muted-foreground border-white/10";

  return (
    <span
      className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${cls}`}
    >
      {position}
    </span>
  );
}
