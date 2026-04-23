"use client";

import {
  Loader2,
  Plus,
  Trash2,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { TeamLibraryRow } from "@/app/actions/teams";
import { generateTournament } from "@/app/actions/tournament";
import { searchAppUsers } from "@/app/actions/users";
import { TeamAutocomplete } from "@/components/register/team-autocomplete";
import { normalizeTeamKey } from "@/lib/lobby-player-uniqueness";
import { cn } from "@/lib/utils";

interface LobbyPlayer {
  name: string;
  team: string;
  teamLogo?: string | null;
  teamLibraryId?: number | null;
  userId?: string | null;
  linkedLabel?: string | null;
}

const MIN_PLAYERS = 4;

function MaterialSymbol({
  name,
  className,
  filled,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={cn("select-none material-symbols-outlined", className)}
      style={
        filled
          ? {
              fontVariationSettings:
                "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }
          : undefined
      }
      aria-hidden
    >
      {name}
    </span>
  );
}

export function RegisterContent({
  teamsLibrary,
}: {
  teamsLibrary: TeamLibraryRow[];
}) {
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [teamLibraryId, setTeamLibraryId] = useState<number | null>(null);
  const [manualTeam, setManualTeam] = useState(false);
  const [linkedUserId, setLinkedUserId] = useState<string | null>(null);
  const [linkedLabel, setLinkedLabel] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; email: string; image: string | null }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canAdd = playerName.trim().length > 0 && teamName.trim().length > 0;
  const canGenerate = players.length >= MIN_PLAYERS;

  async function runUserSearch() {
    const q = userQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const rows = await searchAppUsers(q);
      setSearchResults(rows);
    } finally {
      setSearching(false);
    }
  }

  function selectLinkedUser(u: {
    id: string;
    name: string;
    email: string;
  }) {
    setLinkedUserId(u.id);
    setLinkedLabel(`${u.name} · ${u.email}`);
    setSearchResults([]);
    setUserQuery("");
  }

  function clearLinkedUser() {
    setLinkedUserId(null);
    setLinkedLabel(null);
  }

  function addPlayer() {
    if (!canAdd) return;

    const uid = linkedUserId?.trim();
    if (uid && players.some((p) => p.userId?.trim() === uid)) {
      toast.error("Esta conta já está na lista de inscritos.");
      return;
    }

    const nextTeamKey = normalizeTeamKey(teamName);
    if (players.some((p) => normalizeTeamKey(p.team) === nextTeamKey)) {
      toast.error("Este time já foi escolhido por outro inscrito.");
      return;
    }

    setPlayers((prev) => [
      ...prev,
      {
        name: playerName.trim(),
        team: teamName.trim(),
        teamLogo: teamLogo ?? null,
        teamLibraryId: teamLibraryId ?? null,
        userId: linkedUserId,
        linkedLabel: linkedLabel,
      },
    ]);
    setPlayerName("");
    setTeamName("");
    setTeamLogo(null);
    setTeamLibraryId(null);
    setManualTeam(false);
    clearLinkedUser();
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlayer();
    }
  }

  function handleGenerate() {
    if (!canGenerate) return;
    startTransition(async () => {
      try {
        await generateTournament(
          players.map((p) => ({
            name: p.name,
            team: p.team,
            userId: p.userId ?? undefined,
            teamLogo: p.teamLogo ?? null,
            teamLibraryId: p.teamLibraryId ?? null,
          })),
        );
        router.push("/dashboard");
      } catch (e) {
        toast.error(
          e instanceof Error
            ? e.message
            : "Não foi possível gerar o torneio. Tente de novo.",
        );
      }
    });
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-m3-background text-on-surface">
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-m3-background/92 backdrop-blur-sm">
          <Loader2 className="size-12 animate-spin text-m3-primary" />
          <p className="animate-pulse font-headline text-lg font-semibold tracking-wide text-m3-primary">
            Sorteando grupos…
          </p>
        </div>
      )}

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-4 pb-36">
        <div className="mb-8">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-background">
            FIFA ARENA LOBBY
          </h2>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1">
            <span className="size-2 animate-pulse rounded-full bg-m3-error" />
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {players.length} jogador{players.length === 1 ? "" : "es"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border-l-4 border-m3-primary bg-surface-container-low p-6 shadow-lg">
            <h3 className="mb-4 font-headline text-sm font-bold uppercase tracking-widest text-m3-primary">
              Novo participante
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Nome do jogador
                </label>
                <input
                  type="text"
                  placeholder="Ex: victor_br"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-lg border-0 bg-surface-container-highest px-4 py-3 font-body text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-m3-primary focus:outline-none"
                />
              </div>

              <div onKeyDown={handleKeyDown}>
                <label className="mb-2 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Time / seleção
                </label>
                <div className="relative rounded-lg bg-surface-container-highest focus-within:ring-2 focus-within:ring-m3-primary">
                  <span
                    className="pointer-events-none absolute top-0 left-0 flex h-12 w-11 items-center justify-center"
                    aria-hidden
                  >
                    <MaterialSymbol name="public" className="text-m3-primary" />
                  </span>
                  <TeamAutocomplete
                    teams={teamsLibrary}
                    teamName={teamName}
                    teamLogo={teamLogo}
                    teamLibraryId={teamLibraryId}
                    manualMode={manualTeam}
                    triggerVariant="ghost"
                    rootClassName="gap-0 rounded-lg"
                    triggerClassName="min-h-12 w-full rounded-lg border-0 bg-transparent py-3 pr-3 pl-11 font-body hover:bg-transparent focus-visible:ring-0"
                    popoverContentClassName="border-outline-variant/20 bg-surface-container text-on-surface shadow-xl"
                    filterInputClassName="border-outline-variant/20 bg-surface-container-highest text-on-surface placeholder:text-on-surface-variant/40"
                    manualInputClassName="rounded-b-lg border-0 border-t border-outline-variant/20 bg-surface-container-highest px-4 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-m3-primary"
                    onLibraryPick={(t) => {
                      setManualTeam(false);
                      setTeamName(t.name);
                      setTeamLogo(t.logoUrl);
                      setTeamLibraryId(t.id);
                    }}
                    onEnableManual={() => {
                      setManualTeam(true);
                      setTeamLibraryId(null);
                      setTeamLogo(null);
                      setTeamName("");
                    }}
                    onManualNameChange={setTeamName}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addPlayer}
                disabled={!canAdd}
                className="glow-primary-soft flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-m3-primary to-primary-container py-4 font-headline font-bold text-on-primary transition-all active:scale-[0.98] disabled:opacity-30"
              >
                <Plus className="size-5" />
                + Adicionar
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <MaterialSymbol
                  name="link"
                  className="shrink-0 text-m3-secondary"
                />
                <span className="truncate font-label text-[11px] font-bold uppercase tracking-wider text-on-surface">
                  Vincular conta do app
                </span>
              </div>
              <span className="shrink-0 rounded bg-secondary-container px-2 py-0.5 font-label text-[9px] font-bold uppercase tracking-tighter text-m3-secondary">
                Opcional
              </span>
            </div>
            <p className="mb-3 font-body text-[11px] leading-relaxed text-on-surface-variant">
              O apelido e o time valem só nesta edição. Busque por nome ou e-mail
              para associar o histórico (XP, V-E-D) à conta.
            </p>
            <div className="relative">
              <MaterialSymbol
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/50"
              />
              <input
                type="text"
                placeholder="Buscar por @username ou e-mail"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full rounded-lg border-0 bg-surface-container-low py-2.5 pr-12 pl-10 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-m3-secondary/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={runUserSearch}
                disabled={searching || userQuery.trim().length < 2}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-m3-secondary transition-colors hover:bg-m3-secondary/10 disabled:opacity-40"
                aria-label="Buscar usuário"
              >
                {searching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MaterialSymbol name="search" className="text-lg" />
                )}
              </button>
            </div>
            {linkedUserId && linkedLabel && (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-surface-container-highest px-3 py-2 font-body text-xs text-on-surface">
                <span className="flex min-w-0 items-center gap-2">
                  <User className="size-3.5 shrink-0 text-m3-primary" />
                  <span className="truncate">{linkedLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={clearLinkedUser}
                  className="shrink-0 rounded p-1 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  aria-label="Remover vínculo"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            {searchResults.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-outline-variant/20 bg-surface-container-low py-1">
                {searchResults.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => selectLinkedUser(u)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-surface-container-highest"
                    >
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.image}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="size-7 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-highest font-headline text-[10px] font-bold text-on-surface-variant">
                          {u.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-on-surface">
                          {u.name}
                        </span>
                        <span className="block truncate text-[10px] text-on-surface-variant">
                          {u.email}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {players.length > 0 ? (
            <section className="space-y-3">
              <h3 className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Inscritos
              </h3>
              <ul className="flex flex-col gap-2">
                {players.map((player, index) => (
                  <li
                    key={`${player.name}-${player.team}-${index}`}
                    className="player-card-enter flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-m3-primary/15 font-headline text-xs font-bold text-m3-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-headline text-sm font-semibold text-on-surface">
                          {player.name}
                        </p>
                        <p className="flex min-w-0 items-center gap-2 truncate font-body text-xs text-on-surface-variant">
                          {player.teamLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={player.teamLogo}
                              alt=""
                              className="size-5 shrink-0 rounded border border-outline-variant/30 object-contain"
                            />
                          ) : null}
                          <span className="truncate">{player.team}</span>
                        </p>
                        {player.linkedLabel && (
                          <p className="mt-0.5 flex min-w-0 items-center gap-1 font-body text-[10px] text-m3-secondary/90">
                            <MaterialSymbol
                              name="link"
                              className="shrink-0 text-[12px] leading-none"
                            />
                            <span className="truncate">{player.linkedLabel}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlayer(index)}
                      className="ml-2 flex shrink-0 items-center justify-center rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-m3-error/10 hover:text-m3-error"
                      aria-label={`Remover ${player.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div
            className={cn(
              "flex flex-col items-center text-center",
              players.length === 0 ? "py-12" : "py-6",
            )}
          >
            {players.length === 0 ? (
              <div className="relative mb-6">
                <div className="flex size-24 items-center justify-center rounded-full bg-surface-container-highest">
                  <MaterialSymbol
                    name="group"
                    filled
                    className="text-4xl text-m3-primary/40"
                  />
                </div>
                <div className="absolute -right-2 -bottom-2 flex size-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low">
                  <MaterialSymbol
                    name="sports_soccer"
                    className="text-xl text-m3-secondary"
                  />
                </div>
              </div>
            ) : null}
            <p
              className={cn(
                "max-w-[220px] font-body text-sm leading-relaxed text-on-surface-variant",
                players.length === 0 ? "mb-6" : "mb-4",
              )}
            >
              Adicione pelo menos {MIN_PLAYERS} jogadores para iniciar o torneio
            </p>
            <div className="flex gap-2">
              {Array.from({ length: MIN_PLAYERS }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i < players.length
                      ? "w-6 bg-m3-primary shadow-[0_0_8px_#3B82F6]"
                      : "w-2 bg-surface-container-highest",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-m3-primary/10 bg-surface-container-low/90 px-4 pt-3 pb-8 backdrop-blur-xl shadow-[0_-4px_20px_rgba(133,173,255,0.05)]">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isPending}
            className="arena-neon-glow flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-m3-primary to-primary-container py-4 font-headline text-sm font-black uppercase tracking-widest text-on-primary transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trophy className="size-5" />
            Gerar copa do mundo
          </button>
          {!canGenerate && players.length > 0 && (
            <p className="mt-2 text-center font-body text-xs text-on-surface-variant">
              Faltam{" "}
              <span className="font-semibold text-m3-primary">
                {MIN_PLAYERS - players.length}
              </span>{" "}
              jogador(es) para habilitar o sorteio
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
