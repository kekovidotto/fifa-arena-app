"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
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
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
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

function sectionTag(section: GroupedSection) {
  const allPending = section.matches.every((m) => m.status === "PENDING");
  return allPending ? "Tournament phase" : "Encerradas";
}

function StatusTabs({
  activeTab,
  counts,
  onChange,
}: {
  activeTab: Tab;
  counts: Record<Tab, number>;
  onChange: (tab: Tab) => void;
}) {
  return (
    <section className="rounded-xl bg-surface-container-low p-1">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const active = tab.value === activeTab;
          return (
            <Button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              variant="ghost"
              className={cn(
                "h-auto flex-1 rounded-lg px-3 py-2 font-label text-[10px] font-black uppercase tracking-widest",
                active
                  ? "glow-primary-soft bg-surface-container-highest text-m3-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[9px] tabular-nums",
                  active ? "bg-m3-primary/15" : "bg-surface-container",
                )}
              >
                {counts[tab.value]}
              </span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}

function StageChips({
  sections,
  selected,
  onSelect,
}: {
  sections: GroupedSection[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Button
        type="button"
        onClick={() => onSelect("all")}
        className={cn(
          "h-auto shrink-0 rounded-full px-5 py-2 font-label text-[10px] font-black uppercase tracking-widest",
          selected === "all"
            ? "bg-m3-primary text-on-primary"
            : "bg-surface-container-highest text-on-surface-variant hover:bg-m3-primary/15 hover:text-m3-primary",
        )}
      >
        Todas
      </Button>

      {sections.map((section) => (
        <Button
          key={section.key}
          type="button"
          onClick={() => onSelect(section.key)}
          className={cn(
            "h-auto shrink-0 rounded-full px-5 py-2 font-label text-[10px] font-black uppercase tracking-widest",
            selected === section.key
              ? "bg-m3-primary text-on-primary"
              : "bg-surface-container-highest text-on-surface-variant hover:bg-m3-primary/15 hover:text-m3-primary",
          )}
        >
          {section.title}
        </Button>
      ))}
    </section>
  );
}

export function MatchesContent({
  matches,
  viewerIsAdmin,
  hasActiveTournament = true,
}: {
  matches: MatchCardData[];
  viewerIsAdmin: boolean;
  hasActiveTournament?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [selectedSection, setSelectedSection] = useState("all");

  const counts = useMemo(
    () => ({
      pending: matches.filter((m) => m.status === "PENDING").length,
      finished: matches.filter((m) => m.status === "FINISHED").length,
      all: matches.length,
    }),
    [matches],
  );

  const filtered = useMemo(() => {
    if (activeTab === "pending") {
      return matches.filter((m) => m.status === "PENDING");
    }

    if (activeTab === "finished") {
      return matches.filter((m) => m.status === "FINISHED");
    }

    return matches;
  }, [matches, activeTab]);

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

  const visibleSections = useMemo(() => {
    if (selectedSection === "all") return groupedSections;

    const exists = groupedSections.some((section) => section.key === selectedSection);
    if (!exists) return groupedSections;

    return groupedSections.filter((section) => section.key === selectedSection);
  }, [groupedSections, selectedSection]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-8 md:pt-6">
      {!hasActiveTournament ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low/40 py-16 text-center">
          <MaterialSymbol
            name="event_busy"
            className="text-5xl text-m3-primary/50"
          />
          <div className="max-w-sm space-y-2 px-4">
            <p className="font-headline text-lg font-bold text-on-surface">
              Nenhum campeonato ativo
            </p>
            <p className="font-body text-sm text-on-surface-variant">
              Quando um administrador iniciar uma nova Copa, as partidas aparecerão
              aqui.
            </p>
          </div>
        </div>
      ) : null}

      {hasActiveTournament ? (
        <div className="space-y-4">
          <StatusTabs
            activeTab={activeTab}
            counts={counts}
            onChange={(tab) => {
              setActiveTab(tab);
              setSelectedSection("all");
            }}
          />
          <StageChips
            sections={groupedSections}
            selected={selectedSection}
            onSelect={setSelectedSection}
          />
        </div>
      ) : null}

      {hasActiveTournament && visibleSections.length > 0 ? (
        <motion.div
          key={`${activeTab}-${selectedSection}`}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-5 space-y-4"
        >
          {visibleSections.map((section) => (
            <RoundSection
              key={section.key}
              section={section}
              viewerIsAdmin={viewerIsAdmin}
            />
          ))}
        </motion.div>
      ) : hasActiveTournament ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <MaterialSymbol
            name="search_off"
            className="text-5xl text-on-surface-variant/40"
          />
          <p className="font-body text-sm text-on-surface-variant">
            Nenhuma partida encontrada.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function RoundSection({
  section,
  viewerIsAdmin,
}: {
  section: GroupedSection;
  viewerIsAdmin: boolean;
}) {
  return (
    <motion.section
      variants={fadeUp}
      className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-low"
    >
      <div className="flex items-center justify-between bg-surface-container-high/60 p-4">
        <div>
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-m3-primary/80">
            {sectionTag(section)}
          </span>
          <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-on-surface">
            {section.title}
          </h2>
        </div>
        <MaterialSymbol name="expand_less" className="text-2xl text-m3-primary" />
      </div>

      <div className="space-y-3 p-4">
        {section.matches.map((match, idx) => (
          <motion.div key={match.id} variants={fadeUp}>
            <MatchRowCard
              match={match}
              roundIndex={idx}
              viewerIsAdmin={viewerIsAdmin}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function TeamBadge({
  role,
  name,
  team,
  logoUrl,
  align = "left",
}: {
  role: "Casa" | "Fora";
  name: string;
  team: string;
  logoUrl?: string | null;
  align?: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div
      className={cn("flex w-5/12 items-center gap-2", isRight && "justify-end text-right")}
    >
      {!isRight ? (
        <TeamShield logoUrl={logoUrl} label={team} className="size-11 rounded-lg" />
      ) : null}

      <div className="min-w-0 overflow-hidden">
        <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {role}
        </p>
        <h3 className="truncate font-headline text-sm font-bold uppercase tracking-tight text-on-surface">
          {name}
        </h3>
      </div>

      {isRight ? (
        <TeamShield logoUrl={logoUrl} label={team} className="size-11 rounded-lg" />
      ) : null}
    </div>
  );
}

function TeamShield({
  logoUrl,
  label,
  className,
}: {
  logoUrl: string | null | undefined;
  label: string;
  className?: string;
}) {
  const initial = label.slice(0, 1).toUpperCase() || "?";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-high p-2",
        className,
      )}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="font-headline text-lg font-black text-m3-primary">
          {initial}
        </span>
      )}
    </div>
  );
}

function MatchRowCard({
  match,
  roundIndex,
  viewerIsAdmin,
}: {
  match: MatchCardData;
  roundIndex: number;
  viewerIsAdmin: boolean;
}) {
  const isPending = match.status === "PENDING";
  const roundLabel =
    match.type === "GROUP"
      ? `Rodada ${String(roundIndex + 1).padStart(2, "0")}`
      : STAGE_LABELS[match.stage] ?? match.stage.replaceAll("_", " ");

  return (
    <div
      className={cn(
        "arena-glass-card overflow-hidden rounded-xl border-l-4 border-m3-primary bg-surface-container-high/35 p-3",
        !isPending && "border-l-m3-primary/25",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <TeamBadge
          role="Casa"
          name={match.homePlayer.teamName}
          team={match.homePlayer.teamName}
          logoUrl={match.homePlayer.teamLogo}
        />

        <div className="flex shrink-0 flex-col items-center px-1">
          {isPending ? (
            <span className="font-headline text-lg font-black italic text-m3-primary/40">VS</span>
          ) : (
            <div className="flex items-center gap-1 tabular-nums">
              <span className="font-headline text-2xl font-black text-m3-primary">
                {match.scoreHome}
              </span>
              <span className="text-sm text-on-surface-variant">-</span>
              <span className="font-headline text-2xl font-black text-m3-primary">
                {match.scoreAway}
              </span>
            </div>
          )}
          <div className="mt-1 rounded-full bg-m3-primary/10 px-2 py-0.5 font-label text-[8px] font-bold uppercase text-m3-primary">
            {roundLabel}
          </div>
        </div>

        <TeamBadge
          role="Fora"
          name={match.awayPlayer.teamName}
          team={match.awayPlayer.teamName}
          logoUrl={match.awayPlayer.teamLogo}
          align="right"
        />
      </div>

      {isPending ? (
        viewerIsAdmin ? (
          <Button
            asChild
            className="glow-primary-soft h-auto w-full rounded-lg bg-linear-to-r from-m3-primary to-primary-container py-2.5 font-headline text-[11px] font-black uppercase tracking-[0.2em] text-on-primary hover:brightness-105"
          >
            <Link href={`/match/${match.id}`}>Lançar placar</Link>
          </Button>
        ) : (
          <div className="rounded-lg bg-surface-container-highest py-2.5 text-center font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
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
            <Button
              asChild
              variant="outline"
              className="h-auto rounded-lg border-outline-variant/20 bg-surface-container-high py-2.5 font-headline text-[11px] font-semibold uppercase tracking-wide text-on-surface hover:border-m3-primary/40 hover:text-m3-primary sm:px-4"
            >
              <Link href={`/match/${match.id}`}>Ajustar placar</Link>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
