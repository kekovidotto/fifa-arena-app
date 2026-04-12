"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";

import type { AchievementType } from "@/lib/achievement-types";
import { TrophyTypeIcon } from "@/lib/trophy-icons";
import { cn } from "@/lib/utils";

export type HallPlayer = {
  id: string;
  name: string;
  image: string | null;
  trophyTypes: AchievementType[];
};

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

export function HallOfFameGrid({ players }: { players: HallPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="glass-card mx-auto max-w-md rounded-2xl p-10 text-center">
        <Users className="mx-auto size-12 text-white/25" />
        <p className="mt-4 text-sm text-muted-foreground">
          Ainda não há jogadores cadastrados.
        </p>
      </div>
    );
  }

  return (
    <motion.ul
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {players.map((p) => (
        <motion.li key={p.id} variants={fadeUp}>
          <Link
            href={`/profile/${p.id}`}
            className={cn(
              "glass-card group block overflow-hidden rounded-2xl p-5 transition-all",
              "border border-white/10 shadow-[0_0_0_1px_rgba(34,197,94,0.08)]",
              "hover:border-neon-green/35 hover:shadow-[0_0_28px_rgba(34,197,94,0.18)]",
            )}
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-1 rounded-full bg-linear-to-br from-neon-green/25 to-neon-blue/20 opacity-0 blur-md transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="relative size-16 rounded-full border border-white/15 object-cover ring-2 ring-neon-green/25"
                  />
                ) : (
                  <div className="relative flex size-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xl font-black text-white/45">
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-black tracking-tight text-white group-hover:text-neon-green/95">
                  {p.name}
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.trophyTypes.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground">
                      Sem troféus ainda
                    </span>
                  ) : (
                    p.trophyTypes.map((t) => (
                      <span
                        key={t}
                        title={t}
                        className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/[0.04] p-1 text-amber-300/95 shadow-[0_0_12px_rgba(251,191,36,0.12)]"
                      >
                        <TrophyTypeIcon type={t} className="size-3.5" />
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
