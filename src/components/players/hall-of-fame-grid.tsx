"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type { AchievementType } from "@/lib/achievement-types";
import { ACHIEVEMENT_LABELS } from "@/lib/achievement-types";
import { cn } from "@/lib/utils";

const INITIAL_COMPETITORS = 5;

function normalizeHallSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export type HallPlayer = {
  id: string;
  name: string;
  image: string | null;
  /** Tipos distintos de conquista (para badges). */
  trophyTypes: AchievementType[];
  /** Total de linhas em `achievements` (troféus conquistados). */
  totalTrophies: number;
  /** Quantidade de conquistas do tipo Campeão. */
  championCount: number;
  /** Soma de gols na carreira (todos os `players` vinculados ao usuário). */
  totalGoals: number;
};

function fmtPt(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

function MaterialSymbol({
  name,
  className,
  filled,
  sizePx,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  sizePx?: number;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontSize: sizePx ? `${sizePx}px` : undefined,
        ...(filled
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : {}),
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}

function FeaturedPodium({ player }: { player: HallPlayer }) {
  const badgeTypes = player.trophyTypes.slice(0, 2);

  return (
    <Link
      href={`/profile/${player.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-surface-container-high p-8 editorial-shadow transition-all",
        "hover:bg-surface-container-highest",
      )}
    >
      <div className="absolute top-0 right-0 p-6" aria-hidden>
        <span className="font-headline text-8xl font-bold text-m3-secondary/10 italic">
          #1
        </span>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start">
        <div className="relative shrink-0">
          <div
            className={cn(
              "size-32 overflow-hidden rounded-2xl ring-4 ring-m3-secondary/20 glow-secondary",
              "shadow-[0_0_20px_rgba(252,192,37,0.3)]",
            )}
          >
            {player.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.image}
                alt=""
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-surface-container-highest font-headline text-4xl font-bold text-on-surface-variant">
                {player.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div
            className={cn(
              "absolute -right-2 -bottom-2 flex size-10 items-center justify-center rounded-full",
              "bg-m3-secondary text-on-secondary shadow-lg",
            )}
          >
            <MaterialSymbol name="military_tech" filled className="text-[22px]" />
          </div>
        </div>
        <div className="min-w-0 flex-1 text-center md:text-left">
          <h3 className="font-headline mb-2 text-3xl font-bold tracking-tight text-on-surface">
            {player.name}
          </h3>
          <div className="mb-6 flex flex-wrap justify-center gap-3 md:justify-start">
            {badgeTypes.length === 0 ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full bg-m3-primary/10 px-3 py-1",
                  "font-label text-xs font-bold tracking-wider text-m3-primary uppercase",
                )}
              >
                <MaterialSymbol name="workspace_premium" sizePx={16} />
                Na arena
              </span>
            ) : (
              badgeTypes.map((t) => (
                <span
                  key={t}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full bg-m3-secondary/10 px-3 py-1",
                    "font-label text-xs font-bold tracking-wider text-m3-secondary uppercase",
                  )}
                >
                  <MaterialSymbol name="workspace_premium" sizePx={16} />
                  {ACHIEVEMENT_LABELS[t]}
                </span>
              ))
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/20 pt-6">
            <div>
              <p className="font-label mb-1 text-[10px] tracking-widest text-on-surface-variant uppercase">
                Campeonatos
              </p>
              <p className="font-headline text-2xl font-bold text-on-surface">
                {fmtPt(player.championCount)}
              </p>
            </div>
            <div>
              <p className="font-label mb-1 text-[10px] tracking-widest text-on-surface-variant uppercase">
                Troféus
              </p>
              <p className="font-headline text-2xl font-bold text-m3-secondary">
                {fmtPt(player.totalTrophies)}
              </p>
            </div>
            <div>
              <p className="font-label mb-1 text-[10px] tracking-widest text-on-surface-variant uppercase">
                Gols
              </p>
              <p className="font-headline text-2xl font-bold text-tertiary">
                {fmtPt(player.totalGoals)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SideBento() {
  return (
    <div className="flex flex-col gap-6 md:col-span-4">
      <div className="arena-glass-card flex flex-1 flex-col justify-between rounded-xl border border-m3-primary/10 bg-m3-primary/5 p-6">
        <MaterialSymbol name="insights" className="text-4xl text-m3-primary" />
        <div className="mt-6">
          <h4 className="font-headline mb-1 text-lg font-bold text-m3-primary">
            Meta global
          </h4>
          <p className="font-body text-xs leading-relaxed text-on-surface-variant">
            Ordenação: quem tem mais títulos de campeão; em empate, quem tem mais
            gols na carreira. Explore perfis e conquistas.
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between rounded-xl border border-outline-variant/10 bg-surface-container-low p-6">
        <h4 className="font-label mb-4 text-[10px] tracking-widest text-on-surface-variant uppercase">
          Temporada atual
        </h4>
        <div className="flex items-end justify-between gap-4">
          <span className="font-headline text-3xl font-bold text-on-surface">
            S1
          </span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-container-highest">
            <div className="h-full w-2/3 rounded-full bg-m3-primary glow-primary-soft" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerListCard({ player }: { player: HallPlayer }) {
  const hasTrophies = player.totalTrophies > 0;
  const inactive = player.totalTrophies === 0 && player.totalGoals === 0;
  const trophyPart =
    player.totalTrophies === 0
      ? null
      : player.totalTrophies === 1
        ? "1 troféu"
        : `${fmtPt(player.totalTrophies)} troféus`;
  const goalsPart =
    player.totalGoals === 0
      ? null
      : player.totalGoals === 1
        ? "1 gol"
        : `${fmtPt(player.totalGoals)} gols`;
  const statsLine =
    trophyPart && goalsPart
      ? `${trophyPart} · ${goalsPart}`
      : trophyPart ?? goalsPart;

  return (
    <motion.li variants={fadeUp} className="min-w-0">
      <Link
        href={`/profile/${player.id}`}
        className={cn(
          "arena-glass-card group block cursor-pointer rounded-xl border border-outline-variant/15 p-5 transition-all",
          "hover:border-m3-primary/40",
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "size-14 shrink-0 overflow-hidden rounded-lg",
              inactive &&
                "grayscale transition-all group-hover:grayscale-0",
            )}
          >
            {player.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.image}
                alt=""
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-surface-container-highest font-headline text-lg font-bold text-on-surface-variant">
                {player.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-headline truncate font-bold text-on-surface">
              {player.name}
            </h4>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              {inactive ? (
                <>
                  <MaterialSymbol
                    name="emoji_events"
                    className="shrink-0 text-on-surface-variant"
                    sizePx={16}
                  />
                  <span className="font-body truncate text-xs italic text-on-surface-variant">
                    Ainda sem conquistas na arena
                  </span>
                </>
              ) : hasTrophies ? (
                <>
                  <MaterialSymbol
                    name="military_tech"
                    className="shrink-0 text-m3-secondary"
                    sizePx={16}
                  />
                  <span className="font-label min-w-0 truncate text-[10px] font-bold tracking-tight text-m3-secondary uppercase">
                    {statsLine}
                  </span>
                </>
              ) : (
                <>
                  <MaterialSymbol
                    name="sports_soccer"
                    className="shrink-0 text-tertiary"
                    sizePx={16}
                  />
                  <span className="font-label text-[10px] font-bold tracking-tight text-tertiary uppercase">
                    {goalsPart}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}

export function HallOfFameGrid({ players }: { players: HallPlayer[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryNorm = useMemo(() => normalizeHallSearch(searchQuery), [searchQuery]);
  const hasActiveSearch = queryNorm.length > 0;

  const filteredRest = useMemo(() => {
    if (players.length <= 1) {
      return [];
    }
    const r = players.slice(1);
    if (!queryNorm) {
      return r;
    }
    return r.filter((p) => normalizeHallSearch(p.name).includes(queryNorm));
  }, [players, queryNorm]);

  const displayedList = useMemo(() => {
    if (hasActiveSearch) {
      return filteredRest;
    }
    if (showAllCompetitors) {
      return filteredRest;
    }
    return filteredRest.slice(0, INITIAL_COMPETITORS);
  }, [filteredRest, hasActiveSearch, showAllCompetitors]);

  const needsInternalScroll = displayedList.length > INITIAL_COMPETITORS;

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  if (players.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-12">
          <span className="font-label mb-2 block text-[10px] font-bold tracking-[0.2em] text-m3-primary/70 uppercase">
            Comunidade
          </span>
          <h2 className="font-headline mb-4 text-4xl font-bold tracking-tighter text-on-surface md:text-5xl">
            Hall da Fama
          </h2>
          <p className="font-body max-w-lg text-sm leading-relaxed text-on-surface-variant md:text-base">
            Jogadores cadastrados. Toque em um card para ver o perfil público e
            conquistas.
          </p>
        </header>
        <div className="arena-glass-card mx-auto max-w-md rounded-xl p-10 text-center">
          <Users className="mx-auto size-12 text-on-surface-variant/40" />
          <p className="mt-4 font-body text-sm text-on-surface-variant">
            Ainda não há jogadores cadastrados.
          </p>
        </div>
      </div>
    );
  }

  const featured = players[0]!;

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const toggleSearch = () => {
    if (searchOpen) {
      closeSearch();
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-12">
        <span className="font-label mb-2 block text-[10px] font-bold tracking-[0.2em] text-m3-primary/70 uppercase">
          Comunidade
        </span>
        <h2 className="font-headline mb-4 text-4xl font-bold tracking-tighter text-on-surface md:text-5xl">
          Hall da Fama
        </h2>
        <p className="font-body max-w-lg text-sm leading-relaxed text-on-surface-variant md:text-base">
          Jogadores cadastrados. Toque em um card para ver o perfil público e
          conquistas.
        </p>
      </header>

      <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <FeaturedPodium player={featured} />
        </div>
        <SideBento />
      </section>

      <div className="relative mb-8 h-11 w-full shrink-0">
        <h3
          className={cn(
            "pointer-events-none absolute left-0 top-1/2 z-0 max-w-[calc(100%-3.5rem)] -translate-y-1/2 truncate font-headline text-xl font-bold tracking-tight text-on-surface transition-opacity duration-200 ease-out",
            searchOpen && "opacity-0",
          )}
        >
          Competidores
        </h3>
        <AnimatePresence initial={false}>
          {searchOpen ? (
            <motion.div
              key="search-panel"
              id="hall-competitors-search"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "calc(100% - 3rem)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 z-10 flex min-w-0 justify-start overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-low/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm dark:bg-surface-container-low/80"
            >
              <div className="flex h-full min-w-0 max-w-full flex-1 items-center gap-0.5 pl-2.5 pr-1">
                <Input
                  ref={searchInputRef}
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar competidor…"
                  aria-label="Buscar competidor por nome"
                  className={cn(
                    "h-full min-h-0 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-sm shadow-none",
                    "text-on-surface placeholder:text-on-surface-variant/55",
                    "outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  )}
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className={cn(
                    "inline-flex size-7 shrink-0 items-center justify-center rounded-md",
                    "text-on-surface-variant/80 transition-colors",
                    "hover:bg-surface-container-highest/80 hover:text-on-surface",
                  )}
                  aria-label="Fechar busca"
                >
                  <MaterialSymbol name="close" sizePx={18} />
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <button
          type="button"
          onClick={toggleSearch}
          aria-expanded={searchOpen}
          aria-controls="hall-competitors-search"
          className={cn(
            "absolute top-1/2 right-0 z-20 inline-flex size-9 -translate-y-1/2 shrink-0 items-center justify-center rounded-lg",
            "bg-surface-container-highest text-on-surface-variant transition-colors",
            "hover:bg-surface-container-high hover:text-on-surface",
            searchOpen && "text-m3-primary",
          )}
          aria-label={searchOpen ? "Fechar busca" : "Buscar competidor"}
        >
          <MaterialSymbol name="search" sizePx={20} />
        </button>
      </div>

      {players.length > 1 ? (
        hasActiveSearch && filteredRest.length === 0 ? (
          <p className="font-body rounded-xl border border-outline-variant/10 bg-surface-container-low/80 px-4 py-6 text-center text-sm text-on-surface-variant">
            Nenhum competidor encontrado para essa busca.
          </p>
        ) : (
          <div className="space-y-4">
            <div
              className={cn(
                needsInternalScroll &&
                  "max-h-[min(32rem,70vh)] overflow-y-auto overflow-x-hidden pr-1 [scrollbar-gutter:stable]",
              )}
            >
              <motion.ul
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {displayedList.map((p) => (
                  <PlayerListCard key={p.id} player={p} />
                ))}
              </motion.ul>
            </div>
            {!hasActiveSearch && filteredRest.length > INITIAL_COMPETITORS ? (
              <button
                type="button"
                onClick={() => setShowAllCompetitors((v) => !v)}
                className={cn(
                  "font-body w-full rounded-xl border border-outline-variant/20 bg-surface-container-low/80 px-4 py-3",
                  "text-sm text-on-surface-variant transition-colors",
                  "hover:border-m3-primary/30 hover:text-on-surface",
                )}
              >
                {showAllCompetitors
                  ? "Mostrar menos"
                  : `Ver todos (${filteredRest.length})`}
              </button>
            ) : null}
          </div>
        )
      ) : (
        <p className="font-body rounded-xl border border-outline-variant/10 bg-surface-container-low/80 px-4 py-6 text-center text-sm text-on-surface-variant">
          Você está vendo o destaque #1. Cadastre mais jogadores para preencher
          a grade.
        </p>
      )}
    </div>
  );
}
