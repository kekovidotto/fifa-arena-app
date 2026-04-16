"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { AchievementDeleteButton } from "@/components/profile/achievement-delete-button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ACHIEVEMENT_LABELS,
  type AchievementType,
} from "@/lib/achievement-types";
import { cn } from "@/lib/utils";

function Ms({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}

const TROPHY_CONFIG: {
  type: AchievementType;
  label: string;
  icon: string;
}[] = [
  { type: "CHAMPION", label: "Campeão", icon: "emoji_events" },
  { type: "RUNNER_UP", label: "Vice", icon: "military_tech" },
  { type: "THIRD_PLACE", label: "3º Lugar", icon: "workspace_premium" },
  { type: "TOP_SCORER", label: "Artilheiro", icon: "sports_soccer" },
  { type: "FAN_FAVORITE", label: "Queridinho da torcida", icon: "favorite" },
  { type: "MVP", label: "MVP", icon: "star" },
  { type: "CRAQUE_DA_GALERA", label: "Craque da galera", icon: "groups" },
  { type: "FAIR_PLAY", label: "Fair play", icon: "verified_user" },
];

/** Cor neon do troféu (ícone, anel, badge e lista no drawer). */
const TROPHY_NEON: Record<
  AchievementType,
  {
    ring: string;
    icon: string;
    iconFill: boolean;
    badge: string;
    listBorder: string;
    listIconBg: string;
    drawerHeroBorder: string;
  }
> = {
  CHAMPION: {
    ring: "ring-[#fcc025]/45 shadow-[0_0_14px_rgba(252,192,37,0.35)]",
    icon: "text-[#fcc025] drop-shadow-[0_0_8px_rgba(252,192,37,0.75)]",
    iconFill: true,
    badge:
      "border-[#fcc025] bg-[#0a0d14] text-[#fcc025] shadow-[0_0_12px_rgba(252,192,37,0.55)]",
    listBorder: "border-l-4 border-l-[#fcc025]",
    listIconBg: "bg-[#fcc025]/20",
    drawerHeroBorder: "border-[#fcc025]/25",
  },
  RUNNER_UP: {
    ring: "ring-cyan-300/40 shadow-[0_0_14px_rgba(34,211,238,0.3)]",
    icon: "text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]",
    iconFill: true,
    badge:
      "border-cyan-300 bg-[#0a0d14] text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.45)]",
    listBorder: "border-l-4 border-l-cyan-300",
    listIconBg: "bg-cyan-400/15",
    drawerHeroBorder: "border-cyan-300/25",
  },
  THIRD_PLACE: {
    ring: "ring-amber-600/50 shadow-[0_0_14px_rgba(217,119,6,0.35)]",
    icon: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]",
    iconFill: true,
    badge:
      "border-amber-400 bg-[#0a0d14] text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.45)]",
    listBorder: "border-l-4 border-l-amber-400",
    listIconBg: "bg-amber-500/20",
    drawerHeroBorder: "border-amber-500/25",
  },
  TOP_SCORER: {
    ring: "ring-lime-400/45 shadow-[0_0_14px_rgba(163,230,53,0.3)]",
    icon: "text-lime-300 drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]",
    iconFill: true,
    badge:
      "border-lime-300 bg-[#0a0d14] text-lime-200 shadow-[0_0_12px_rgba(163,230,53,0.45)]",
    listBorder: "border-l-4 border-l-lime-400",
    listIconBg: "bg-lime-400/15",
    drawerHeroBorder: "border-lime-400/25",
  },
  FAN_FAVORITE: {
    ring: "ring-pink-400/45 shadow-[0_0_14px_rgba(244,114,182,0.35)]",
    icon: "text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.65)]",
    iconFill: true,
    badge:
      "border-pink-400 bg-[#0a0d14] text-pink-200 shadow-[0_0_12px_rgba(244,114,182,0.45)]",
    listBorder: "border-l-4 border-l-pink-400",
    listIconBg: "bg-pink-500/15",
    drawerHeroBorder: "border-pink-400/25",
  },
  MVP: {
    ring: "ring-violet-400/45 shadow-[0_0_14px_rgba(167,139,250,0.35)]",
    icon: "text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.65)]",
    iconFill: true,
    badge:
      "border-violet-400 bg-[#0a0d14] text-violet-200 shadow-[0_0_12px_rgba(167,139,250,0.45)]",
    listBorder: "border-l-4 border-l-violet-400",
    listIconBg: "bg-violet-500/15",
    drawerHeroBorder: "border-violet-400/25",
  },
  CRAQUE_DA_GALERA: {
    ring: "ring-[#00f1fe]/50 shadow-[0_0_14px_rgba(0,241,254,0.35)]",
    icon: "text-[#00f1fe] drop-shadow-[0_0_8px_rgba(0,241,254,0.75)]",
    iconFill: true,
    badge:
      "border-[#00f1fe] bg-[#0a0d14] text-[#00f1fe] shadow-[0_0_12px_rgba(0,241,254,0.5)]",
    listBorder: "border-l-4 border-l-[#00f1fe]",
    listIconBg: "bg-[#00f1fe]/15",
    drawerHeroBorder: "border-[#00f1fe]/25",
  },
  FAIR_PLAY: {
    ring: "ring-m3-primary/45 shadow-[0_0_14px_rgba(133,173,255,0.35)]",
    icon: "text-m3-primary drop-shadow-[0_0_8px_rgba(133,173,255,0.65)]",
    iconFill: true,
    badge:
      "border-m3-primary bg-[#0a0d14] text-m3-primary shadow-[0_0_12px_rgba(133,173,255,0.45)]",
    listBorder: "border-l-4 border-l-m3-primary",
    listIconBg: "bg-m3-primary/15",
    drawerHeroBorder: "border-m3-primary/30",
  },
};

function formatEarnedAt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export type TrophyAchievementRecord = {
  id: number;
  type: AchievementType;
  tournamentName: string;
  earnedAt: string;
};

export function TrophyRoomGrid({
  profileUserId,
  achievementCounts,
  achievementRecords,
  viewerIsAdmin,
}: {
  profileUserId: string;
  achievementCounts: Record<AchievementType, number>;
  achievementRecords: TrophyAchievementRecord[];
  viewerIsAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AchievementType | null>(
    null,
  );

  const neon = selectedType ? TROPHY_NEON[selectedType] : null;
  const selectedLabel = selectedType
    ? ACHIEVEMENT_LABELS[selectedType]
    : "";
  const selectedIcon = selectedType
    ? TROPHY_CONFIG.find((t) => t.type === selectedType)?.icon
    : undefined;

  const recordsForDrawer = useMemo(() => {
    if (!selectedType) return [];
    return achievementRecords
      .filter((r) => r.type === selectedType)
      .sort(
        (a, b) =>
          new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime(),
      );
  }, [achievementRecords, selectedType]);

  function openForType(type: AchievementType) {
    const count = achievementCounts[type] ?? 0;
    if (count < 1) return;
    setSelectedType(type);
    setOpen(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSelectedType(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        {TROPHY_CONFIG.map(({ type, label, icon }) => {
          const count = achievementCounts[type] ?? 0;
          const unlocked = count > 0;
          const accent = TROPHY_NEON[type];
          return (
            <button
              key={type}
              type="button"
              disabled={!unlocked}
              onClick={() => openForType(type)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-xl bg-surface-container-low p-3 text-left transition-all",
                unlocked &&
                  "cursor-pointer hover:bg-surface-container-highest hover:ring-1 hover:ring-[#85adff]/20 active:scale-[0.98]",
                !unlocked && "cursor-default opacity-90",
              )}
            >
              <div className="relative flex shrink-0">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border bg-surface-container transition-all",
                    unlocked
                      ? cn("border-white/10", accent.ring)
                      : "border-outline-variant/20",
                  )}
                >
                  <Ms
                    name={icon}
                    className={cn(
                      "text-2xl",
                      unlocked
                        ? accent.icon
                        : "text-on-surface-variant/30",
                    )}
                    style={
                      unlocked && accent.iconFill
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  />
                </div>
                {unlocked && count > 1 ? (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 px-1 font-headline text-[8px] font-bold leading-none tracking-tight",
                      accent.badge,
                    )}
                    aria-label={`${count} conquistas`}
                  >
                    {count}x
                  </span>
                ) : null}
              </div>
              <span
                className={cn(
                  "text-center font-label text-[9px] font-bold uppercase leading-tight",
                  unlocked ? "text-on-surface" : "text-on-surface-variant",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="border-[#85adff]/20 bg-surface-container p-0 shadow-[0_-12px_40px_rgba(133,173,255,0.12)]">
          <div className="flex max-h-[min(85dvh,800px)] flex-col overflow-hidden">
            {selectedType && neon ? (
              <>
                <DrawerHeader
                  className={cn(
                    "relative mx-4 mt-2 overflow-hidden rounded-xl border bg-surface-container-low px-4 py-8 pb-6 pt-6",
                    neon.drawerHeroBorder,
                  )}
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#85adff]/10 to-transparent opacity-40"
                  />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={cn(
                        "mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-black/25 p-4",
                        neon.drawerHeroBorder,
                      )}
                    >
                      {selectedIcon ? (
                        <Ms
                          name={selectedIcon}
                          className={cn("text-4xl", neon.icon)}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        />
                      ) : null}
                    </div>
                    <DrawerDescription className="sr-only">
                      Lista de torneios e datas em que este troféu foi conquistado
                      neste perfil.
                    </DrawerDescription>
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.25em] text-[#85adff]/90">
                      Histórico de conquistas
                    </p>
                    <DrawerTitle className="font-headline mt-1 text-2xl font-extrabold uppercase tracking-tight text-on-surface">
                      {TROPHY_CONFIG.find((t) => t.type === selectedType)?.label.toUpperCase()}
                    </DrawerTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-px w-6 bg-[#85adff]/35" />
                      <span className="font-headline text-[11px] font-bold uppercase tracking-widest text-m3-secondary">
                        {selectedLabel}
                      </span>
                      <span className="h-px w-6 bg-[#85adff]/35" />
                    </div>
                  </div>
                </DrawerHeader>

                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-8">
                  {recordsForDrawer.map((rec) => (
                    <article
                      key={rec.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-surface-container-highest p-4 shadow-lg transition-colors hover:bg-surface-bright/40",
                        neon.listBorder,
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            neon.listIconBg,
                          )}
                        >
                          {selectedIcon ? (
                            <Ms
                              name={selectedIcon}
                              className={cn("text-2xl", neon.icon)}
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline text-base font-bold leading-tight text-on-surface">
                            {rec.tournamentName}
                          </h3>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Ms
                              name="calendar_today"
                              className="text-xs text-on-surface-variant"
                            />
                            <p className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                              {formatEarnedAt(rec.earnedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {viewerIsAdmin ? (
                        <AchievementDeleteButton
                          achievementId={rec.id}
                          profileUserId={profileUserId}
                          title={`${ACHIEVEMENT_LABELS[rec.type]} — ${rec.tournamentName}`}
                        />
                      ) : null}
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
