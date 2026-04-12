"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Crown,
  Swords,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { type BracketMatch, type BracketRound } from "@/lib/tournament-utils";

interface BracketContentProps {
  rounds: BracketRound[];
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
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function BracketContent({ rounds }: BracketContentProps) {
  const finalRound = rounds.find((r) => r.stage === "FINAL");
  const finalMatch = finalRound?.matches[0];
  const champion =
    finalMatch?.status === "FINISHED"
      ? finalMatch.scoreHome > finalMatch.scoreAway
        ? { name: finalMatch.homePlayerName, team: finalMatch.homeTeamName }
        : { name: finalMatch.awayPlayerName, team: finalMatch.awayTeamName }
      : null;

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
          <Crown className="size-6 text-amber-400" />
          <h1 className="text-xl font-black tracking-widest text-white">
            CHAVEAMENTO
          </h1>
        </div>
        <p className="text-xs tracking-[0.3em] text-purple-400">
          FASE ELIMINATÓRIA
        </p>
      </motion.header>

      {/* Champion Banner */}
      {champion && (
        <motion.div
          variants={fadeUp}
          className="gold-card mb-6 rounded-2xl p-6 text-center"
        >
          <Trophy className="mx-auto mb-2 size-12 text-amber-400" />
          <p className="text-xs font-bold tracking-widest text-amber-400/80">
            CAMPEÃO
          </p>
          <p className="mt-1 text-2xl font-black text-white">
            {champion.name}
          </p>
          <p className="text-sm text-amber-400/60">{champion.team}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {rounds.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="glass-card rounded-xl p-8 text-center"
        >
          <Swords className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-bold text-white">Mata-mata não iniciado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Finalize todas as partidas da fase de grupos para gerar o
            chaveamento.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-neon-blue"
          >
            Ir para o Dashboard
          </Link>
        </motion.div>
      )}

      {/* Bracket Rounds */}
      <div className="space-y-6 pb-4">
        {rounds.map((round) => (
          <motion.section key={round.stage} variants={fadeUp}>
            <div className="mb-3 flex items-center gap-2">
              <div
                className={`h-px flex-1 ${
                  round.stage === "FINAL"
                    ? "bg-linear-to-r from-transparent to-amber-500/30"
                    : "bg-linear-to-r from-transparent to-purple-500/20"
                }`}
              />
              <h2
                className={`text-xs font-bold tracking-widest ${
                  round.stage === "FINAL"
                    ? "text-amber-400"
                    : "text-purple-400"
                }`}
              >
                {round.label.toUpperCase()}
              </h2>
              <div
                className={`h-px flex-1 ${
                  round.stage === "FINAL"
                    ? "bg-linear-to-l from-transparent to-amber-500/30"
                    : "bg-linear-to-l from-transparent to-purple-500/20"
                }`}
              />
            </div>

            <div className="space-y-2.5">
              {round.matches.map((match, idx) => (
                <BracketMatchCard
                  key={match.id ?? `tbd-${round.stage}-${idx}`}
                  match={match}
                  isFinal={round.stage === "FINAL"}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>
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

  const cardStyle = isFinal
    ? { borderColor: "rgba(251, 191, 36, 0.15)" }
    : { borderColor: "rgba(168, 85, 247, 0.12)" };

  const inner = (
    <div
      className={`glass-card overflow-hidden rounded-xl transition-all ${
        isPending ? "hover:brightness-110" : ""
      } ${isTBD ? "opacity-50" : ""}`}
      style={cardStyle}
    >
      {/* Match Row */}
      <div className="flex items-stretch">
        {/* Home */}
        <div
          className={`flex flex-1 items-center gap-2 px-3 py-3 ${
            homeWon ? "bg-neon-green/5" : ""
          }`}
        >
          {isFinished && (
            <span className="flex size-4 shrink-0 items-center justify-center">
              {homeWon ? (
                <CheckCircle2 className="size-3.5 text-neon-green" />
              ) : (
                <span className="size-1.5 rounded-full bg-white/20" />
              )}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-xs font-bold ${
                homeWon
                  ? "text-white"
                  : isTBD
                    ? "text-white/30"
                    : "text-white/80"
              }`}
            >
              {match.homePlayerName}
            </p>
            {match.homeTeamName && (
              <p className="truncate text-[10px] text-muted-foreground">
                {match.homeTeamName}
              </p>
            )}
          </div>
        </div>

        {/* Score / VS */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center border-x border-white/5">
          {isFinished ? (
            <div className="flex items-center gap-1 text-sm font-black">
              <span className={homeWon ? "text-neon-green" : "text-white/50"}>
                {match.scoreHome}
              </span>
              <span className="text-white/20">:</span>
              <span className={awayWon ? "text-neon-green" : "text-white/50"}>
                {match.scoreAway}
              </span>
            </div>
          ) : isTBD ? (
            <Clock className="size-3.5 text-white/20" />
          ) : (
            <span className="text-[10px] font-black text-amber-400">VS</span>
          )}
        </div>

        {/* Away */}
        <div
          className={`flex flex-1 items-center gap-2 px-3 py-3 ${
            awayWon ? "bg-neon-green/5" : ""
          }`}
        >
          <div className="min-w-0 flex-1 text-right">
            <p
              className={`truncate text-xs font-bold ${
                awayWon
                  ? "text-white"
                  : isTBD
                    ? "text-white/30"
                    : "text-white/80"
              }`}
            >
              {match.awayPlayerName}
            </p>
            {match.awayTeamName && (
              <p className="truncate text-[10px] text-muted-foreground">
                {match.awayTeamName}
              </p>
            )}
          </div>
          {isFinished && (
            <span className="flex size-4 shrink-0 items-center justify-center">
              {awayWon ? (
                <CheckCircle2 className="size-3.5 text-neon-green" />
              ) : (
                <span className="size-1.5 rounded-full bg-white/20" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {isPending && (
        <div className="border-t border-white/5 bg-amber-500/5 py-1.5 text-center text-[10px] font-bold text-amber-400">
          LANÇAR PLACAR
        </div>
      )}
    </div>
  );

  if (isPending && match.id) {
    return <Link href={`/match/${match.id}`}>{inner}</Link>;
  }

  if (isFinished && match.id) {
    return <Link href={`/match/${match.id}`}>{inner}</Link>;
  }

  return inner;
}
