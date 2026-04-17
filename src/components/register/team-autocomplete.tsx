"use client";

import { Check, ChevronsUpDown, Globe, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import type { TeamLibraryRow } from "@/app/actions/teams";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SECTION_LABEL: Record<TeamLibraryRow["category"], string> = {
  EUROPE: "UEFA Champions League",
  WORLD_CUP: "Copa do Mundo",
};

type TeamAutocompleteProps = {
  teams: TeamLibraryRow[];
  teamName: string;
  teamLogo: string | null;
  teamLibraryId: number | null;
  manualMode: boolean;
  onLibraryPick: (team: TeamLibraryRow) => void;
  onEnableManual: () => void;
  onManualNameChange: (name: string) => void;
  /** Classes extras no gatilho do combobox (ex.: tema arena / registro). */
  triggerClassName?: string;
  /** Variante visual do botão-gatilho. */
  triggerVariant?: "outline" | "ghost";
  popoverContentClassName?: string;
  filterInputClassName?: string;
  manualInputClassName?: string;
  /** Classes no wrapper externo (coluna + gatilho + modo manual). */
  rootClassName?: string;
};

export function TeamAutocomplete({
  teams,
  teamName,
  teamLogo,
  teamLibraryId,
  manualMode,
  onLibraryPick,
  onEnableManual,
  onManualNameChange,
  triggerClassName,
  triggerVariant = "outline",
  popoverContentClassName,
  filterInputClassName,
  manualInputClassName,
  rootClassName,
}: TeamAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(q));
  }, [teams, query]);

  const europe = filtered.filter((t) => t.category === "EUROPE");
  const world = filtered.filter((t) => t.category === "WORLD_CUP");

  function pick(team: TeamLibraryRow) {
    onLibraryPick(team);
    setOpen(false);
    setQuery("");
  }

  function pickManual() {
    onEnableManual();
    setOpen(false);
    setQuery("");
  }

  const ghostTrigger = triggerVariant === "ghost";

  return (
    <div className={cn("flex flex-col gap-2", rootClassName)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={triggerVariant}
            role="combobox"
            aria-expanded={open}
            className={cn(
              triggerVariant === "outline" &&
                "h-auto min-h-11 w-full justify-between rounded-lg border-white/15 bg-white/5 px-4 py-2.5 font-normal text-white hover:bg-white/10",
              ghostTrigger &&
                "h-auto min-h-12 w-full justify-between rounded-lg border-0 px-4 py-3 font-body font-normal text-on-surface shadow-none hover:bg-transparent",
              !teamName &&
                (triggerVariant === "outline"
                  ? "text-white/35"
                  : "text-on-surface-variant/70"),
              triggerClassName,
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
              {!manualMode && teamLogo && teamLibraryId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teamLogo}
                  alt=""
                  className={cn(
                    "size-7 shrink-0 rounded-md border object-contain",
                    ghostTrigger
                      ? "border-outline-variant/30 bg-surface-container-highest"
                      : "border-white/10 bg-white/5",
                  )}
                />
              ) : (
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border border-dashed",
                    ghostTrigger
                      ? "border-outline-variant/40 bg-transparent"
                      : "border-white/20 bg-white/5",
                  )}
                >
                  <Globe
                    className={cn(
                      "size-3.5",
                      ghostTrigger ? "text-m3-primary" : "text-white/40",
                    )}
                  />
                </span>
              )}
              <span
                className={cn(
                  "truncate text-sm",
                  ghostTrigger && !teamName.trim() && "text-on-surface-variant/50",
                )}
              >
                {teamName.trim()
                  ? teamName
                  : "Buscar clube ou seleção…"}
              </span>
            </span>
            <ChevronsUpDown
              className={cn(
                "ml-2 size-4 shrink-0",
                ghostTrigger ? "text-on-surface-variant" : "text-white/40",
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-[min(100vw-2rem,22rem)] border-white/10 bg-[#070b14] p-0 shadow-[0_0_32px_rgba(59,130,246,0.15)]",
            popoverContentClassName,
          )}
          align="start"
        >
          <div className="border-b border-white/10 p-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite para filtrar…"
              className={cn(
                "neon-input w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none",
                filterInputClassName,
              )}
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            <button
              type="button"
              onClick={pickManual}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-amber-300/95 transition-colors hover:bg-amber-500/10"
            >
              <Sparkles className="size-4 shrink-0" />
              <span className="font-semibold">Outro (digitar manualmente)</span>
            </button>

            {teams.length === 0 && (
              <p className="mx-3 my-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100/90">
                Biblioteca vazia. Rode{" "}
                <code className="rounded bg-black/30 px-1 font-mono text-[10px]">
                  yarn db:seed:teams
                </code>{" "}
                após aplicar migrações.
              </p>
            )}

            {europe.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-widest text-neon-blue/90">
                  {SECTION_LABEL.EUROPE}
                </p>
                {europe.map((t) => (
                  <TeamRow
                    key={t.id}
                    team={t}
                    selected={!manualMode && teamLibraryId === t.id}
                    onPick={() => pick(t)}
                  />
                ))}
              </>
            )}

            {world.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-widest text-neon-green/90">
                  {SECTION_LABEL.WORLD_CUP}
                </p>
                {world.map((t) => (
                  <TeamRow
                    key={t.id}
                    team={t}
                    selected={!manualMode && teamLibraryId === t.id}
                    onPick={() => pick(t)}
                  />
                ))}
              </>
            )}

            {teams.length > 0 && filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                Nenhum time encontrado. Use “Outro” para digitar.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {manualMode && (
        <input
          type="text"
          placeholder="Nome do time / seleção"
          value={teamName}
          onChange={(e) => onManualNameChange(e.target.value)}
          className={cn(
            "neon-input w-full rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all",
            manualInputClassName,
          )}
        />
      )}
    </div>
  );
}

function TeamRow({
  team,
  selected,
  onPick,
}: {
  team: TeamLibraryRow;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-white/10",
        selected && "bg-neon-green/10",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={team.logoUrl}
        alt=""
        className="size-8 shrink-0 rounded-md border border-white/10 bg-white/5 object-contain"
      />
      <span className="min-w-0 flex-1 truncate font-medium text-white">
        {team.name}
      </span>
      {selected && (
        <Check className="size-4 shrink-0 text-neon-green" aria-hidden />
      )}
    </button>
  );
}
