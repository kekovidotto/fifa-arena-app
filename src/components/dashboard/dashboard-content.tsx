"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Crown,
  Flag,
  Loader2,
  Plus,
  Settings,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { generateKnockoutPhase } from "@/app/actions/knockout";
import { finalizeTournament } from "@/app/actions/tournament-finalize";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type GroupData,
  type MatchCardData,
  QUALIFYING_POSITIONS,
} from "@/lib/tournament-utils";

interface DashboardContentProps {
  groups: GroupData[];
  upcomingMatches: MatchCardData[];
  totalPending: number;
  groupPhaseComplete: boolean;
  knockoutExists: boolean;
  canFinalizeTournament: boolean;
  viewerIsAdmin: boolean;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function DashboardContent({
  groups,
  upcomingMatches,
  totalPending,
  groupPhaseComplete,
  knockoutExists,
  canFinalizeTournament,
  viewerIsAdmin,
}: DashboardContentProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-lg px-4"
    >
      {/* Admin bar */}
      {viewerIsAdmin && (
        <motion.div
          variants={fadeUp}
          className="mb-4 mt-2 flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-500/[0.07] p-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black tracking-widest text-amber-300">
              ADMIN
            </span>
            <span className="text-xs text-amber-200/80">Barra rápida</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/register"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-400/35 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/25 sm:flex-none"
            >
              <Plus className="size-3.5" />
              Novo registro
            </Link>
            <Link
              href="/settings"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/90 transition-colors hover:bg-white/10 sm:flex-none"
            >
              <Settings className="size-3.5" />
              Configurações
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 border-white/20 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
                >
                  Mais
                  <ChevronDown className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[200px] border-white/10 bg-[#0a0f1a] text-white"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Ações rápidas
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="focus:bg-white/10">
                  <Link href="/matches" className="cursor-pointer">
                    <CalendarDays className="mr-2 size-4" />
                    Partidas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10">
                  <Link href="/classificacao" className="cursor-pointer">
                    <BarChart3 className="mr-2 size-4" />
                    Classificação geral
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10">
                  <Link href="/artilheria" className="cursor-pointer">
                    <Trophy className="mr-2 size-4" />
                    Artilharia
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.header variants={fadeUp} className="py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="size-6 text-neon-green" />
          <h1 className="text-xl font-black tracking-widest text-white">
            FIFA ARENA
          </h1>
        </div>
        <p className="text-xs tracking-[0.3em] text-neon-blue">
          COPA DO MUNDO
        </p>
      </motion.header>

      {/* Top Action Section */}
      <motion.section variants={fadeUp} className="mb-6">
        {groupPhaseComplete && !knockoutExists ? (
          <AdminGuard
            fallback={
              <div className="glass-card rounded-xl p-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-10 text-neon-green" />
                <p className="text-lg font-bold text-white">
                  Fase de Grupos Finalizada!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aguardando o administrador gerar o mata-mata.
                </p>
              </div>
            }
          >
            <GenerateKnockoutCTA />
          </AdminGuard>
        ) : upcomingMatches.length > 0 ? (
          <UpcomingMatchesSection
            matches={upcomingMatches}
            totalPending={totalPending}
            knockoutExists={knockoutExists}
          />
        ) : knockoutExists ? (
          <TournamentComplete />
        ) : (
          <div className="glass-card rounded-xl p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-10 text-neon-green" />
            <p className="font-bold text-white">
              Todas as partidas foram realizadas!
            </p>
          </div>
        )}
      </motion.section>

      {/* Bracket Link */}
      {knockoutExists && (
        <motion.div variants={fadeUp} className="mb-6">
          <Link
            href="/knockout"
            className="neon-button-blue flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider"
          >
            <Crown className="size-4" />
            VER CHAVEAMENTO
          </Link>
        </motion.div>
      )}

      {canFinalizeTournament && (
        <motion.div variants={fadeUp} className="mb-6">
          <AdminGuard>
            <FinalizeTournamentCTA />
          </AdminGuard>
        </motion.div>
      )}

      {/* Group Standings */}
      <section className="space-y-4 pb-4">
        <motion.h2
          variants={fadeUp}
          className="text-sm font-semibold tracking-wider text-muted-foreground"
        >
          CLASSIFICAÇÃO DOS GRUPOS
        </motion.h2>

        {groups.map((group) => (
          <motion.div
            key={group.id}
            variants={fadeUp}
            className="glass-card overflow-hidden rounded-xl"
          >
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="flex size-6 items-center justify-center rounded bg-neon-green/10 text-xs font-bold text-neon-green">
                {group.name.replace("Grupo ", "")}
              </span>
              <h3 className="text-sm font-bold text-white">{group.name}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="w-8 py-2 pl-4 text-left">#</th>
                    <th className="py-2 text-left">Jogador</th>
                    <th className="w-8 py-2 text-center">P</th>
                    <th className="w-8 py-2 text-center">J</th>
                    <th className="w-8 py-2 text-center">V</th>
                    <th className="w-8 py-2 text-center">E</th>
                    <th className="w-8 py-2 text-center">D</th>
                    <th className="w-10 py-2 pr-4 text-center">SG</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings.map((s, pos) => {
                    const qualified = pos < QUALIFYING_POSITIONS;
                    return (
                      <tr
                        key={s.playerId}
                        className={`border-t border-white/5 ${qualified ? "bg-neon-green/5" : ""}`}
                      >
                        <td className="py-2.5 pl-4">
                          <PositionBadge
                            pos={pos + 1}
                            qualified={qualified}
                          />
                        </td>
                        <td className="py-2.5">
                          <p
                            className={`font-semibold ${qualified ? "text-white" : "text-white/60"}`}
                          >
                            {s.playerName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.teamName}
                          </p>
                        </td>
                        <td
                          className={`py-2.5 text-center font-bold ${qualified ? "text-neon-green" : "text-white/60"}`}
                        >
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
                          <GoalDifference value={s.goalDifference} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </section>
    </motion.div>
  );
}

function FinalizeTournamentCTA() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleFinalize() {
    startTransition(async () => {
      try {
        await finalizeTournament();
        toast.success("Campeonato finalizado! Conquistas registradas.");
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Não foi possível finalizar.",
        );
      }
    });
  }

  return (
    <div
      className="glass-card overflow-hidden rounded-xl"
      style={{ borderColor: "rgba(251, 191, 36, 0.25)" }}
    >
      <div className="p-5 text-center">
        <Flag className="mx-auto mb-2 size-9 text-amber-400" />
        <p className="text-sm font-bold text-white">Encerrar campeonato</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Registra campeão, vice, 3º lugar e artilheiro nos perfis vinculados.
        </p>
      </div>
      <div className="px-4 pb-5">
        <button
          type="button"
          onClick={handleFinalize}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 py-3.5 text-sm font-black tracking-widest text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              FINALIZANDO...
            </>
          ) : (
            <>
              <Trophy className="size-5" />
              FINALIZAR CAMPEONATO
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function GenerateKnockoutCTA() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleGenerate() {
    startTransition(async () => {
      await generateKnockoutPhase();
      router.push("/knockout");
    });
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card overflow-hidden rounded-xl"
      style={{ borderColor: "rgba(34, 197, 94, 0.2)" }}
    >
      <div className="p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-10 text-neon-green" />
        <p className="text-lg font-bold text-white">
          Fase de Grupos Finalizada!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Todos os jogos foram realizados. Gere o mata-mata!
        </p>
      </div>
      <div className="px-4 pb-5">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="neon-button-primary flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black tracking-widest transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              GERANDO...
            </>
          ) : (
            <>
              <Swords className="size-5" />
              GERAR FASE FINAL
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function UpcomingMatchesSection({
  matches,
  totalPending,
  knockoutExists,
}: {
  matches: MatchCardData[];
  totalPending: number;
  knockoutExists: boolean;
}) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-neon-blue" />
          <h2 className="text-sm font-semibold tracking-wider text-white">
            {knockoutExists ? "MATA-MATA" : "PRÓXIMAS RODADAS"}
          </h2>
        </div>
        <Link
          href="/matches"
          className="flex items-center gap-1 text-xs text-neon-blue transition-colors hover:text-neon-blue/80"
        >
          {totalPending > 4 && (
            <span className="rounded-full bg-neon-blue/10 px-2 py-0.5 text-[10px]">
              +{totalPending - 4}
            </span>
          )}
          Ver todas
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {matches.map((match) => (
          <UpcomingMatchCard key={match.id} match={match} />
        ))}
      </div>
    </>
  );
}

function UpcomingMatchCard({ match }: { match: MatchCardData }) {
  const isKnockout = match.type === "KNOCKOUT";
  return (
    <Link
      href={`/match/${match.id}`}
      className="glass-card flex min-w-[220px] shrink-0 snap-start flex-col rounded-xl p-4 transition-all hover:brightness-110"
      style={{
        borderColor: isKnockout
          ? "rgba(168, 85, 247, 0.2)"
          : "rgba(59, 130, 246, 0.15)",
      }}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <Swords
          className={`size-3 ${isKnockout ? "text-purple-400" : "text-neon-blue"}`}
        />
        <span
          className={`text-[10px] font-semibold tracking-wider ${isKnockout ? "text-purple-400" : "text-neon-blue"}`}
        >
          {match.groupName || match.stage.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs font-bold text-white">
            {match.homePlayer.name}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {match.homePlayer.teamName}
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-black text-white/20">
          VS
        </span>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs font-bold text-white">
            {match.awayPlayer.name}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {match.awayPlayer.teamName}
          </p>
        </div>
      </div>

      <AdminGuard>
        <div className="mt-3 rounded-md bg-amber-500/10 py-1.5 text-center text-[10px] font-bold text-amber-400">
          LANÇAR PLACAR
        </div>
      </AdminGuard>
    </Link>
  );
}

function TournamentComplete() {
  return (
    <div className="glass-card rounded-xl p-6 text-center">
      <Trophy className="mx-auto mb-3 size-10 text-amber-400" />
      <p className="text-lg font-bold text-white">Torneio Finalizado!</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Confira o chaveamento para ver o campeão.
      </p>
    </div>
  );
}

function PositionBadge({
  pos,
  qualified,
}: {
  pos: number;
  qualified: boolean;
}) {
  if (qualified) {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-neon-green/20 text-[10px] font-bold text-neon-green">
        {pos}
      </span>
    );
  }
  return (
    <span className="flex size-5 items-center justify-center text-muted-foreground">
      {pos}
    </span>
  );
}

function GoalDifference({ value }: { value: number }) {
  const color =
    value > 0
      ? "text-neon-green"
      : value < 0
        ? "text-red-400"
        : "text-muted-foreground";
  const label = value > 0 ? `+${value}` : String(value);
  return <span className={color}>{label}</span>;
}
