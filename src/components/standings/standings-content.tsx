"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

import type { Standing } from "@/lib/tournament-utils";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function StandingsContent({ standings }: { standings: Standing[] }) {
  const withGames = standings.filter((s) => s.played > 0);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <motion.header
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="mb-6 text-center"
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <BarChart3 className="size-6 text-neon-blue" />
          <h1 className="text-xl font-black tracking-widest text-white">
            CLASSIFICAÇÃO GERAL
          </h1>
        </div>
        <p className="text-xs tracking-wide text-muted-foreground">
          Todas as partidas finalizadas, todos os campeonatos
        </p>
      </motion.header>

      {withGames.length === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="glass-card rounded-xl p-8 text-center text-sm text-muted-foreground"
        >
          Ainda não há jogos finalizados para montar a tabela.
        </motion.div>
      ) : (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="glass-card overflow-hidden rounded-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="w-8 py-3 pl-4 text-left">#</th>
                  <th className="py-3 text-left">Jogador</th>
                  <th className="w-8 py-3 text-center">P</th>
                  <th className="w-8 py-3 text-center">J</th>
                  <th className="w-8 py-3 text-center">V</th>
                  <th className="w-8 py-3 text-center">E</th>
                  <th className="w-8 py-3 text-center">D</th>
                  <th className="w-10 py-3 pr-4 text-center">SG</th>
                </tr>
              </thead>
              <tbody>
                {withGames.map((s, i) => (
                  <tr key={s.playerId} className="border-t border-white/5">
                    <td className="py-2.5 pl-4 font-bold text-neon-green">
                      {i + 1}
                    </td>
                    <td className="py-2.5">
                      <p className="font-semibold text-white">{s.playerName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.teamName}
                      </p>
                    </td>
                    <td className="py-2.5 text-center font-bold text-neon-green">
                      {s.points}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">
                      {s.played}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">
                      {s.wins}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">
                      {s.draws}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">
                      {s.losses}
                    </td>
                    <td className="py-2.5 pr-4 text-center">
                      <span
                        className={
                          s.goalDifference > 0
                            ? "text-neon-green"
                            : s.goalDifference < 0
                              ? "text-red-400"
                              : "text-muted-foreground"
                        }
                      >
                        {s.goalDifference > 0
                          ? `+${s.goalDifference}`
                          : s.goalDifference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
