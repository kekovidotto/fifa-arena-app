"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  Search,
  Swords,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { MatchCardData } from "@/lib/tournament-utils";

type Tab = "pending" | "finished" | "all";

const tabs: { value: Tab; label: string }[] = [
  { value: "pending", label: "Pendentes" },
  { value: "finished", label: "Encerradas" },
  { value: "all", label: "Todas" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function MatchesContent({ matches }: { matches: MatchCardData[] }) {
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

  const grouped = useMemo(() => {
    const map = new Map<string, MatchCardData[]>();
    for (const m of filtered) {
      const key = m.groupName || "Outros";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-lg px-4">
      {/* Header */}
      <header className="py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className="size-6 text-neon-green" />
          <h1 className="text-xl font-black tracking-widest text-white">
            PARTIDAS
          </h1>
        </div>
        <p className="text-xs tracking-[0.3em] text-neon-blue">
          CENTRAL DE JOGOS
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Buscar jogador ou time..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="neon-input w-full rounded-xl bg-white/5 py-3 pr-10 pl-10 text-sm text-white placeholder-white/30 outline-none transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-white/30 hover:text-white/60"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === tab.value
                ? "bg-neon-green/10 text-neon-green"
                : "bg-white/5 text-white/40 hover:text-white/60"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                activeTab === tab.value
                  ? "bg-neon-green/20"
                  : "bg-white/10"
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Match List */}
      {grouped.length > 0 ? (
        <motion.div
          key={activeTab + search}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-6 pb-4"
        >
          {grouped.map(([groupName, groupMatches]) => (
            <motion.section key={groupName} variants={fadeUp}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded bg-neon-green/10 text-xs font-bold text-neon-green">
                  {groupName.replace("Grupo ", "")}
                </span>
                <h2 className="text-sm font-bold text-white">{groupName}</h2>
                <span className="text-xs text-muted-foreground">
                  ({groupMatches.length})
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {groupMatches.map((match) => (
                  <motion.div key={match.id} variants={fadeUp}>
                    <MatchListCard match={match} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Search className="size-10 text-white/10" />
          <p className="text-sm text-white/30">
            Nenhuma partida encontrada
            {search && " para esta busca"}.
          </p>
        </div>
      )}
    </div>
  );
}

function MatchListCard({ match }: { match: MatchCardData }) {
  const isPending = match.status === "PENDING";

  return (
    <div
      className="glass-card rounded-xl p-4"
      style={
        isPending
          ? { borderColor: "rgba(245, 158, 11, 0.15)" }
          : { borderColor: "rgba(34, 197, 94, 0.12)" }
      }
    >
      {/* Players & Score */}
      <div className="flex items-center">
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold text-white">
            {match.homePlayer.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {match.homePlayer.teamName}
          </p>
        </div>

        {isPending ? (
          <span className="shrink-0 px-3 text-xs font-black text-white/20">
            VS
          </span>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5 px-3">
            <span className="text-xl font-black tabular-nums text-white">
              {match.scoreHome}
            </span>
            <span className="text-xs text-white/20">-</span>
            <span className="text-xl font-black tabular-nums text-white">
              {match.scoreAway}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold text-white">
            {match.awayPlayer.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {match.awayPlayer.teamName}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="mt-3">
        {isPending ? (
          <Link
            href={`/match/${match.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500/10 py-2.5 text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500/15"
          >
            <Swords className="size-3.5" />
            Lançar Placar
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center justify-center gap-1.5 py-1 text-xs text-neon-green">
              <CheckCircle2 className="size-3.5" />
              Finalizada
            </div>
            <Link
              href={`/match/${match.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Pencil className="size-3" />
              Editar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
