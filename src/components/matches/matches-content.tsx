"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { MatchCardData } from "@/lib/tournament-utils";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/tournament-utils";
import { cn } from "@/lib/utils";

type Tab = "pending" | "finished" | "all";

const tabs: { value: Tab; label: string }[] = [
  { value: "pending", label: "Pendentes" },
  { value: "finished", label: "Encerradas" },
  { value: "all", label: "Todas" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
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

function sectionKey(m: MatchCardData) {
  return m.type === "GROUP"
    ? `g:${m.groupName || "Grupo"}`
    : `k:${m.stage}`;
}

function sectionTitle(first: MatchCardData) {
  if (first.type === "GROUP") {
    return first.groupName || "Grupo";
  }
  return STAGE_LABELS[first.stage] ?? first.stage.replaceAll("_", " ");
}

function stageSortIndex(stage: string) {
  const i = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
  return i === -1 ? 999 : i;
}

type GroupedSection = {
  key: string;
  title: string;
  matches: MatchCardData[];
};

export function MatchesContent({
  matches,
  viewerIsAdmin,
}: {
  matches: MatchCardData[];
  viewerIsAdmin: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      pending: matches.filter((m) => m.status === "PENDING").length,
      finished: matches.filter((m) => m.status === "FINISHED").length,
      all: matches.length,
    }),
    [matches],
  );

  const filtered = useMemo(() => {
    let result = matches;

    if (activeTab === "pending")
      result = result.filter((m) => m.status === "PENDING");
    else if (activeTab === "finished")
      result = result.filter((m) => m.status === "FINISHED");

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.homePlayer.name.toLowerCase().includes(q) ||
          m.awayPlayer.name.toLowerCase().includes(q) ||
          m.homePlayer.teamName.toLowerCase().includes(q) ||
          m.awayPlayer.teamName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [matches, activeTab, search]);

  const groupedSections = useMemo((): GroupedSection[] => {
    const map = new Map<string, MatchCardData[]>();
    for (const m of filtered) {
      const k = sectionKey(m);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }

    const entries: GroupedSection[] = [];
    for (const [key, list] of map.entries()) {
      const sorted = [...list].sort((a, b) => a.id - b.id);
      entries.push({
        key,
        title: sectionTitle(sorted[0]!),
        matches: sorted,
      });
    }

    entries.sort((a, b) => {
      const ga = a.key.startsWith("g:");
      const gb = b.key.startsWith("g:");
      if (ga && !gb) return -1;
      if (!ga && gb) return 1;
      if (ga && gb) return a.title.localeCompare(b.title, "pt");
      const sa = a.matches[0]?.stage ?? "";
      const sb = b.matches[0]?.stage ?? "";
      return stageSortIndex(sa) - stageSortIndex(sb);
    });

    return entries;
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-8 md:pt-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <MaterialSymbol
            name="sports_soccer"
            className="text-3xl text-m3-primary"
          />
          <div className="min-w-0">
            <h1 className="font-headline text-xl font-black uppercase tracking-tight text-m3-primary md:text-2xl">
              Match center
            </h1>
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Agenda oficial · FIFA Arena
            </p>
          </div>
        </div>
        <div
          className="hidden shrink-0 rounded-full border border-m3-primary/20 bg-surface-container-low p-2 sm:flex"
          aria-hidden
        >
          <MaterialSymbol name="emoji_events" className="text-m3-primary/80" />
        </div>
      </header>

      <section className="mb-8 space-y-4">
        <div className="relative">
          <MaterialSymbol
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant"
          />
          <input
            type="search"
            placeholder="Buscar jogador ou clube..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-label w-full rounded-xl border-0 bg-surface-container-low py-4 pr-4 pl-12 text-sm text-on-surface placeholder:text-outline outline-none ring-m3-primary/50 focus:ring-2"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              aria-label="Limpar busca"
            >
              <MaterialSymbol name="close" className="text-lg" />
            </button>
          ) : null}
        </div>

        <div className="flex rounded-xl bg-surface-container-low p-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2.5 font-label text-[10px] font-bold uppercase tracking-widest transition-all sm:flex-row sm:justify-center sm:gap-1.5 sm:text-xs",
                  active
                    ? "bg-surface-container-highest text-m3-primary shadow-sm glow-primary-soft"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] tabular-nums",
                    active ? "bg-m3-primary/15" : "bg-surface-container/80",
                  )}
                >
                  {counts[tab.value]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {groupedSections.length > 0 ? (
        <motion.div
          key={`${activeTab}-${search}`}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {groupedSections.map((section) => (
            <motion.section key={section.key} variants={fadeUp}>
              <div className="mb-4 flex items-baseline justify-between px-1">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                  {section.title}
                </h2>
                <span className="rounded-full border border-m3-primary/15 bg-surface-container-high px-3 py-1 font-label text-xs font-black uppercase tracking-wider text-m3-primary">
                  {String(section.matches.length).padStart(2, "0")} jogos
                </span>
              </div>

              <div className="space-y-4">
                {section.matches.map((match, idx) => (
                  <motion.div key={match.id} variants={fadeUp}>
                    <MatchEsportsCard
                      match={match}
                      roundIndex={idx}
                      viewerIsAdmin={viewerIsAdmin}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <MaterialSymbol
            name="search_off"
            className="text-5xl text-on-surface-variant/40"
          />
          <p className="font-body text-sm text-on-surface-variant">
            Nenhuma partida encontrada
            {search.trim() ? " para esta busca" : ""}.
          </p>
        </div>
      )}
    </div>
  );
}

function TeamShield({
  logoUrl,
  label,
}: {
  logoUrl: string | null | undefined;
  label: string;
}) {
  const initial = label.slice(0, 1).toUpperCase() || "?";
  return (
    <div className="mb-3 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-highest p-2 md:size-18">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="font-headline text-2xl font-black text-m3-primary">
          {initial}
        </span>
      )}
    </div>
  );
}

function MatchEsportsCard({
  match,
  roundIndex,
  viewerIsAdmin,
}: {
  match: MatchCardData;
  roundIndex: number;
  viewerIsAdmin: boolean;
}) {
  const isPending = match.status === "PENDING";
  const groupBadge =
    match.type === "GROUP"
      ? match.groupName || "Grupo"
      : "Mata-mata";
  const roundLabel =
    match.type === "GROUP"
      ? `Rodada ${String(roundIndex + 1).padStart(2, "0")}`
      : STAGE_LABELS[match.stage] ?? match.stage.replaceAll("_", " ");

  return (
    <div
      className={cn(
        "arena-glass-card editorial-shadow overflow-hidden rounded-2xl border border-outline-variant/10 p-5",
        !isPending && "border-m3-primary/15",
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 font-label text-[10px] font-black uppercase tracking-widest",
            match.type === "GROUP"
              ? "border border-m3-primary/25 bg-m3-primary/15 text-m3-primary"
              : "border border-purple-500/25 bg-purple-500/10 text-purple-300",
          )}
        >
          {groupBadge}
        </span>
        <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {roundLabel}
        </span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-1 md:items-center">
        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <TeamShield
            logoUrl={match.homePlayer.teamLogo}
            label={match.homePlayer.teamName}
          />
          <span className="line-clamp-2 font-headline text-sm font-bold text-on-surface">
            {match.homePlayer.name}
          </span>
          <span className="mt-0.5 line-clamp-1 font-label text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
            {match.homePlayer.teamName}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center px-1 pt-10 md:px-4 md:pt-0">
          {isPending ? (
            <span className="font-headline text-3xl font-black italic text-outline-variant/40">
              VS
            </span>
          ) : (
            <div className="flex items-center gap-2 tabular-nums">
              <span className="font-headline text-4xl font-black text-m3-primary drop-shadow-[0_0_12px_rgba(133,173,255,0.45)]">
                {match.scoreHome}
              </span>
              <span className="font-headline text-xl font-light text-on-surface-variant">
                —
              </span>
              <span className="font-headline text-4xl font-black text-m3-primary drop-shadow-[0_0_12px_rgba(133,173,255,0.45)]">
                {match.scoreAway}
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
          <TeamShield
            logoUrl={match.awayPlayer.teamLogo}
            label={match.awayPlayer.teamName}
          />
          <span className="line-clamp-2 font-headline text-sm font-bold text-on-surface">
            {match.awayPlayer.name}
          </span>
          <span className="mt-0.5 line-clamp-1 font-label text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
            {match.awayPlayer.teamName}
          </span>
        </div>
      </div>

      {isPending ? (
        viewerIsAdmin ? (
          <Link
            href={`/match/${match.id}`}
            className="glow-primary-soft flex w-full items-center justify-center rounded-xl bg-linear-to-r from-m3-primary to-primary-container py-4 font-headline text-sm font-black uppercase tracking-widest text-on-primary transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Lançar placar
          </Link>
        ) : (
          <div className="rounded-xl bg-surface-container-highest py-4 text-center font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Aguardando resultado
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-2 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-m3-primary/90">
            <MaterialSymbol name="check_circle" className="text-base" />
            Encerrada
          </div>
          {viewerIsAdmin ? (
            <Link
              href={`/match/${match.id}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-high py-3 font-headline text-xs font-semibold text-on-surface transition-colors hover:border-m3-primary/40 hover:text-m3-primary sm:px-6"
            >
              <MaterialSymbol name="edit" className="text-lg" />
              Ajustar placar
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
