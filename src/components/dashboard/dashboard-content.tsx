"use client";

import { motion } from "framer-motion";
import { BarChart3, CalendarDays, Loader2, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { generateKnockoutPhase } from "@/app/actions/knockout";
import { finalizeTournament } from "@/app/actions/tournament-finalize";
import { AdminGuard } from "@/components/admin-guard";
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
  STAGE_LABELS,
} from "@/lib/tournament-utils";
import { cn } from "@/lib/utils";

interface DashboardContentProps {
  /** Dados abaixo refletem apenas o torneio com status ACTIVE. */
  hasActiveTournament: boolean;
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

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function DashboardContent({
  hasActiveTournament,
  groups,
  upcomingMatches,
  totalPending,
  groupPhaseComplete,
  knockoutExists,
  canFinalizeTournament,
  viewerIsAdmin,
}: DashboardContentProps) {
  const [activeGroupId, setActiveGroupId] = useState<number | null>(
    groups[0]?.id ?? null,
  );
  const activeGroup =
    groups.find((g) => g.id === activeGroupId) ?? groups[0] ?? null;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-7xl space-y-12 px-4 pb-28 pt-2 md:px-8 md:pb-16"
    >
      {viewerIsAdmin && (
        <motion.section
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Console de Administração
            </p>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
              Painel de Controle
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="arena-neon-glow flex items-center gap-2 rounded-xl bg-linear-to-r from-m3-primary to-primary-container px-6 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all active:scale-95"
            >
              <MaterialSymbol name="add_circle" className="text-sm" />
              Novo registro
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-highest px-6 py-3 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-m3-primary active:scale-95"
            >
              <MaterialSymbol name="settings" className="text-sm" />
              Configurações
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-highest p-3 text-on-surface-variant transition-colors hover:text-m3-primary active:scale-95"
                  aria-label="Mais ações"
                >
                  <MaterialSymbol name="more_horiz" className="text-sm" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[200px] border-outline-variant/20 bg-surface-container-highest text-on-surface"
              >
                <DropdownMenuLabel className="font-label text-xs text-on-surface-variant">
                  Ações rápidas
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-outline-variant/20" />
                <DropdownMenuItem asChild className="focus:bg-m3-primary/10">
                  <Link href="/matches" className="cursor-pointer">
                    <CalendarDays className="mr-2 size-4 opacity-80" />
                    Partidas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-m3-primary/10">
                  <Link href="/classificacao" className="cursor-pointer">
                    <BarChart3 className="mr-2 size-4 opacity-80" />
                    Classificação geral
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-m3-primary/10">
                  <Link href="/artilheria" className="cursor-pointer">
                    <Trophy className="mr-2 size-4 opacity-80" />
                    Artilharia
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.section>
      )}

      {!hasActiveTournament ? (
        <motion.section variants={fadeUp} className="space-y-6">
          <div className="arena-glass-card rounded-2xl border border-outline-variant/10 p-10 text-center">
            <MaterialSymbol
              name="sports_soccer"
              className="mx-auto mb-4 text-5xl text-m3-primary [filter:drop-shadow(0_0_12px_rgba(59,130,246,0.45))]"
            />
            <p className="font-headline text-xl font-bold tracking-tight text-on-surface">
              Nenhum campeonato ativo
            </p>
            <p className="mx-auto mt-3 max-w-md font-body text-sm text-on-surface-variant">
              Quando um administrador criar um novo torneio pelo lobby, grupos,
              partidas e classificação aparecem aqui automaticamente.
            </p>
            {viewerIsAdmin ? (
              <Link
                href="/register"
                className="arena-neon-glow mt-8 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-m3-primary to-primary-container px-8 py-3.5 font-label text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all active:scale-95"
              >
                <MaterialSymbol name="add_circle" className="text-base" />
                Abrir lobby de registro
              </Link>
            ) : null}
          </div>
        </motion.section>
      ) : null}

      {hasActiveTournament ? (
      <motion.section variants={fadeUp} className="space-y-6">
        {groupPhaseComplete && !knockoutExists ? (
          <AdminGuard
            fallback={
              <div className="arena-glass-card rounded-2xl border border-outline-variant/10 p-8 text-center">
                <MaterialSymbol
                  name="check_circle"
                  className="mx-auto mb-3 text-4xl text-m3-primary"
                />
                <p className="font-headline text-lg font-bold text-on-surface">
                  Fase de Grupos Finalizada!
                </p>
                <p className="mt-2 font-body text-sm text-on-surface-variant">
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
          <div className="arena-glass-card rounded-2xl border border-outline-variant/10 p-8 text-center">
            <MaterialSymbol
              name="check_circle"
              className="mx-auto mb-3 text-4xl text-m3-primary"
            />
            <p className="font-headline font-bold text-on-surface">
              Todas as partidas foram realizadas!
            </p>
          </div>
        )}
      </motion.section>
      ) : null}

      {hasActiveTournament && knockoutExists ? (
        <motion.div variants={fadeUp}>
          <Link
            href="/knockout"
            className="arena-neon-glow flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-m3-primary to-primary-container py-4 font-headline text-sm font-bold uppercase tracking-wider text-on-primary-container transition-transform active:scale-[0.98]"
          >
            <MaterialSymbol name="emoji_events" className="text-xl" />
            Ver chaveamento
          </Link>
        </motion.div>
      ) : null}

      {hasActiveTournament && canFinalizeTournament ? (
        <motion.div variants={fadeUp}>
          <AdminGuard>
            <FinalizeTournamentCTA />
          </AdminGuard>
        </motion.div>
      ) : null}

      {hasActiveTournament && groups.length > 0 && activeGroup ? (
        <motion.section variants={fadeUp} className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-m3-secondary" />
              <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-on-surface">
                Classificação dos Grupos
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl bg-surface-container-low p-1">
              {groups.map((g) => {
                const active = g.id === activeGroup.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGroupId(g.id)}
                    className={cn(
                      "rounded-lg px-4 py-2 font-label text-xs font-bold uppercase tracking-widest transition-colors",
                      active
                        ? "bg-surface-container-highest text-m3-primary"
                        : "text-on-surface-variant hover:text-on-surface",
                    )}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="arena-glass-card overflow-hidden rounded-2xl border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-5 font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      #
                    </th>
                    <th className="px-6 py-5 font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      Jogador
                    </th>
                    <th className="px-4 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      P
                    </th>
                    <th className="px-4 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      J
                    </th>
                    <th className="px-4 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      V
                    </th>
                    <th className="px-4 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      E
                    </th>
                    <th className="px-4 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      D
                    </th>
                    <th className="px-4 py-5 text-center font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
                      SG
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {activeGroup.standings.map((s, pos) => {
                    const qualified = pos < QUALIFYING_POSITIONS;
                    return (
                      <tr
                        key={s.playerId}
                        className="transition-colors hover:bg-m3-primary/5"
                      >
                        <td className="px-6 py-4">
                          <PositionBadge pos={pos + 1} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-full border-2 p-0.5 font-headline text-xs font-bold text-on-surface",
                                pos === 0 &&
                                  "border-m3-secondary/50 bg-m3-secondary/10",
                                pos === 1 &&
                                  "border-m3-primary/50 bg-m3-primary/10",
                                pos > 1 && "border-outline-variant/30",
                              )}
                            >
                              <span className="leading-none">
                                {initialsFromName(s.playerName)}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span className="font-headline text-sm font-bold text-on-surface">
                                {s.playerName}
                              </span>
                              <span
                                className={cn(
                                  "font-label text-[10px] font-bold uppercase tracking-widest",
                                  qualified
                                    ? pos === 0
                                      ? "text-m3-secondary"
                                      : "text-m3-primary"
                                    : "text-on-surface-variant",
                                )}
                              >
                                {qualified ? "Promoção" : "Permanência"}
                              </span>
                              <span className="truncate font-body text-[10px] text-on-surface-variant/80">
                                {s.teamName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td
                          className={cn(
                            "px-4 py-4 text-center font-headline text-sm font-bold",
                            qualified ? "text-m3-primary" : "text-on-surface-variant",
                          )}
                        >
                          {s.points}
                        </td>
                        <td className="px-4 py-4 text-center font-headline text-sm font-medium text-on-surface">
                          {s.played}
                        </td>
                        <td className="px-4 py-4 text-center font-headline text-sm font-medium text-on-surface">
                          {s.wins}
                        </td>
                        <td className="px-4 py-4 text-center font-headline text-sm font-medium text-on-surface">
                          {s.draws}
                        </td>
                        <td className="px-4 py-4 text-center font-headline text-sm font-medium text-on-surface">
                          {s.losses}
                        </td>
                        <td className="px-4 py-4 text-center font-headline text-sm font-medium">
                          <GoalDifference value={s.goalDifference} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>
      ) : null}

      {hasActiveTournament ? (
        <Link
          href="/matches"
          className="arena-neon-glow fixed bottom-6 right-4 z-40 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-m3-primary to-primary-container text-on-primary-container transition-transform active:scale-90 sm:bottom-8 sm:right-8"
          aria-label="Ver todas as partidas"
        >
          <MaterialSymbol name="sports_soccer" className="text-3xl" />
        </Link>
      ) : null}
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
    <div className="arena-glass-card overflow-hidden rounded-2xl border border-m3-secondary/30">
      <div className="p-6 text-center">
        <MaterialSymbol
          name="flag"
          className="mx-auto mb-2 text-4xl text-m3-secondary"
        />
        <p className="font-headline text-sm font-bold text-on-surface">
          Encerrar campeonato
        </p>
        <p className="mt-1 font-body text-xs text-on-surface-variant">
          Registra campeão, vice, 3º lugar e artilheiro nos perfis vinculados.
        </p>
      </div>
      <div className="px-4 pb-5">
        <button
          type="button"
          onClick={handleFinalize}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-m3-secondary/50 bg-m3-secondary/15 py-3.5 font-headline text-sm font-black uppercase tracking-widest text-m3-secondary shadow-[0_0_20px_rgba(252,192,37,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Finalizando…
            </>
          ) : (
            <>
              <MaterialSymbol name="emoji_events" className="text-xl" />
              Finalizar campeonato
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
      className="arena-glass-card overflow-hidden rounded-2xl border border-m3-primary/25"
    >
      <div className="p-8 text-center">
        <MaterialSymbol
          name="check_circle"
          className="mx-auto mb-3 text-5xl text-m3-primary"
        />
        <p className="font-headline text-lg font-bold text-on-surface">
          Fase de grupos finalizada!
        </p>
        <p className="mt-2 font-body text-sm text-on-surface-variant">
          Todos os jogos foram realizados. Gere o mata-mata.
        </p>
      </div>
      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="arena-neon-glow flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-m3-primary to-primary-container py-4 font-headline text-sm font-black uppercase tracking-widest text-on-primary-container transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Gerando…
            </>
          ) : (
            <>
              <MaterialSymbol name="swords" className="text-xl" />
              Gerar fase final
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-m3-primary" />
          <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-on-surface">
            {knockoutExists ? "Mata-mata" : "Próximas rodadas"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/matches"
            className="mr-1 hidden items-center gap-1 font-label text-xs font-bold uppercase tracking-widest text-m3-primary hover:text-primary-dim sm:flex"
          >
            {totalPending > matches.length && (
              <span className="rounded-full bg-m3-primary/15 px-2 py-0.5 text-[10px] text-m3-primary">
                +{totalPending - matches.length}
              </span>
            )}
            Ver todas
            <MaterialSymbol name="chevron_right" className="text-sm" />
          </Link>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="flex size-10 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container-low text-on-surface-variant transition-colors hover:text-m3-primary"
            aria-label="Anterior"
          >
            <MaterialSymbol name="chevron_left" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="flex size-10 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container-low text-on-surface-variant transition-colors hover:text-m3-primary"
            aria-label="Seguinte"
          >
            <MaterialSymbol name="chevron_right" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x gap-6 overflow-x-auto pb-2"
      >
        {matches.map((match) => (
          <UpcomingMatchCard key={match.id} match={match} />
        ))}
      </div>

      <Link
        href="/matches"
        className="flex items-center justify-center gap-1 font-label text-xs font-bold uppercase tracking-widest text-m3-primary sm:hidden"
      >
        {totalPending > matches.length && (
          <span className="rounded-full bg-m3-primary/15 px-2 py-0.5 text-[10px]">
            +{totalPending - matches.length}
          </span>
        )}
        Ver todas as partidas
      </Link>
    </div>
  );
}

function matchRoundLabel(match: MatchCardData) {
  if (match.type === "KNOCKOUT") {
    return STAGE_LABELS[match.stage] ?? match.stage.replaceAll("_", " ");
  }
  return match.groupName || "Grupo";
}

function UpcomingMatchCard({ match }: { match: MatchCardData }) {
  const isKnockout = match.type === "KNOCKOUT";
  return (
    <Link
      href={`/match/${match.id}`}
      className={cn(
        "arena-glass-card flex w-80 max-w-[85vw] shrink-0 snap-center flex-col rounded-2xl border p-5 transition-all hover:border-m3-primary/20",
        isKnockout
          ? "border-purple-500/20"
          : "border-outline-variant/10",
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest",
            isKnockout
              ? "bg-purple-500/15 text-purple-300"
              : "bg-m3-primary/10 text-m3-primary",
          )}
        >
          {matchRoundLabel(match)}
        </span>
        <span className="font-label text-[10px] font-medium uppercase text-on-surface-variant">
          {isKnockout ? "Eliminatória" : "Pendente"}
        </span>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-1 flex-col items-center gap-3">
          <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-highest">
            <span className="font-headline text-lg font-bold text-m3-primary">
              {initialsFromName(match.homePlayer.teamName)}
            </span>
          </div>
          <span className="text-center font-headline text-sm font-bold tracking-tight text-on-surface">
            {match.homePlayer.name}
          </span>
          <span className="-mt-1 line-clamp-1 text-center font-body text-[10px] text-on-surface-variant">
            {match.homePlayer.teamName}
          </span>
        </div>
        <div className="px-4">
          <span className="font-headline text-2xl font-light italic text-on-surface-variant">
            VS
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-3">
          <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-highest">
            <span className="font-headline text-lg font-bold text-m3-primary">
              {initialsFromName(match.awayPlayer.teamName)}
            </span>
          </div>
          <span className="text-center font-headline text-sm font-bold tracking-tight text-on-surface">
            {match.awayPlayer.name}
          </span>
          <span className="-mt-1 line-clamp-1 text-center font-body text-[10px] text-on-surface-variant">
            {match.awayPlayer.teamName}
          </span>
        </div>
      </div>

      <AdminGuard>
        <span className="flex w-full items-center justify-center rounded-xl bg-surface-container-highest py-4 font-label text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant">
          Lançar placar
        </span>
      </AdminGuard>
    </Link>
  );
}

function TournamentComplete() {
  return (
    <div className="arena-glass-card rounded-2xl border border-outline-variant/10 p-8 text-center">
      <MaterialSymbol
        name="emoji_events"
        className="mx-auto mb-3 text-5xl text-m3-secondary"
      />
      <p className="font-headline text-lg font-bold text-on-surface">
        Torneio finalizado!
      </p>
      <p className="mt-2 font-body text-sm text-on-surface-variant">
        Confira o chaveamento para ver o campeão.
      </p>
    </div>
  );
}

function PositionBadge({ pos }: { pos: number }) {
  const label = String(pos).padStart(2, "0");
  if (pos === 1) {
    return (
      <div className="flex size-8 items-center justify-center rounded-lg bg-m3-secondary/10 font-headline text-sm font-bold text-m3-secondary">
        {label}
      </div>
    );
  }
  if (pos === 2) {
    return (
      <div className="flex size-8 items-center justify-center rounded-lg bg-m3-primary/10 font-headline text-sm font-bold text-m3-primary">
        {label}
      </div>
    );
  }
  return (
    <div className="flex size-8 items-center justify-center rounded-lg bg-surface-container-highest font-headline text-sm font-bold text-on-surface-variant">
      {label}
    </div>
  );
}

function GoalDifference({ value }: { value: number }) {
  const color =
    value > 0
      ? "text-m3-primary"
      : value < 0
        ? "text-m3-error"
        : "text-on-surface-variant";
  const label = value > 0 ? `+${value}` : String(value);
  return <span className={color}>{label}</span>;
}
