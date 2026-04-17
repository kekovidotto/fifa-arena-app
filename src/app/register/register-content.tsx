"use client";

import {
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { TeamLibraryRow } from "@/app/actions/teams";
import { generateTournament } from "@/app/actions/tournament";
import { searchAppUsers } from "@/app/actions/users";
import { TeamAutocomplete } from "@/components/register/team-autocomplete";

interface LobbyPlayer {
  name: string;
  team: string;
  teamLogo?: string | null;
  teamLibraryId?: number | null;
  userId?: string | null;
  linkedLabel?: string | null;
}

const MIN_PLAYERS = 4;

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
    });
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#020617]/90 backdrop-blur-sm">
          <Loader2 className="size-12 animate-spin text-neon-green" />
          <p className="animate-pulse text-lg font-semibold tracking-wide text-neon-green">
            Sorteando Grupos...
          </p>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020617]/80 px-4 py-5 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="size-7 text-neon-green" />
            <div>
              <h1 className="text-xl font-black tracking-widest text-white">
                FIFA ARENA
              </h1>
              <p className="text-xs font-medium tracking-[0.3em] text-neon-blue">
                LOBBY
              </p>
            </div>
          </div>

          <div className="neon-badge flex items-center gap-1.5 rounded-full px-3 py-1">
            <Users className="size-3.5" />
            <span className="text-sm font-bold">{players.length}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pt-6 pb-28">
        <section className="glass-card rounded-xl p-4">
          <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground">
            NOVO PARTICIPANTE
          </h2>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nome do Jogador"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="neon-input w-full rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
            />
            <div onKeyDown={handleKeyDown}>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                Time / seleção
              </p>
              <TeamAutocomplete
                teams={teamsLibrary}
                teamName={teamName}
                teamLogo={teamLogo}
                teamLibraryId={teamLibraryId}
                manualMode={manualTeam}
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

            <div className="rounded-lg border border-neon-blue/20 bg-neon-blue/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neon-blue">
                <Link2 className="size-3.5" />
                Vincular conta do app (opcional)
              </div>
              <p className="mb-2 text-[11px] text-muted-foreground">
                O nome e o time acima valem só para esta edição. Busque por nome
                ou e-mail para vincular a um usuário: o histórico (XP, V-E-D,
                gols) segue a conta, usando o apelido e a seleção que você
                definiu aqui.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="neon-input-blue flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none"
                />
                <button
                  type="button"
                  onClick={runUserSearch}
                  disabled={searching || userQuery.trim().length < 2}
                  className="flex shrink-0 items-center justify-center rounded-lg bg-neon-blue/20 px-3 text-neon-blue transition-colors hover:bg-neon-blue/30 disabled:opacity-40"
                >
                  {searching ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                </button>
              </div>
              {linkedUserId && linkedLabel && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white">
                  <span className="flex min-w-0 items-center gap-2">
                    <User className="size-3.5 shrink-0 text-neon-green" />
                    <span className="truncate">{linkedLabel}</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearLinkedUser}
                    className="shrink-0 rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                    aria-label="Remover vínculo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
              {searchResults.length > 0 && (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-[#020617]/80 py-1">
                  {searchResults.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => selectLinkedUser(u)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-white/10"
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
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/50">
                            {u.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-white">
                            {u.name}
                          </span>
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {u.email}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={addPlayer}
              disabled={!canAdd}
              className="flex items-center justify-center gap-2 rounded-lg bg-neon-green px-4 py-3 text-sm font-bold text-[#020617] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:hover:brightness-100"
            >
              <Plus className="size-4" />
              ADICIONAR
            </button>
          </div>
        </section>

        {players.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">
              JOGADORES INSCRITOS
            </h2>

            <ul className="flex flex-col gap-2">
              {players.map((player, index) => (
                <li
                  key={`${player.name}-${player.team}-${index}`}
                  className="glass-card player-card-enter flex items-center justify-between rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neon-green/10 text-xs font-bold text-neon-green">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="flex items-center gap-2 truncate text-xs text-neon-blue">
                        {player.teamLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={player.teamLogo}
                            alt=""
                            className="size-5 shrink-0 rounded border border-white/10 object-contain"
                          />
                        ) : null}
                        <span className="truncate">{player.team}</span>
                      </p>
                      {player.linkedLabel && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-neon-green/80">
                          <Link2 className="size-3 shrink-0" />
                          <span className="truncate">{player.linkedLabel}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="ml-2 flex shrink-0 items-center justify-center rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Remover ${player.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <Users className="size-12 text-white/10" />
            <p className="text-sm text-white/30">
              Adicione pelo menos <strong>{MIN_PLAYERS}</strong> jogadores
              <br />
              para iniciar o torneio
            </p>
          </div>
        )}
      </main>

      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/5 bg-[#020617]/90 p-4 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || isPending}
            className="neon-button-primary flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black tracking-widest transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trophy className="size-5" />
            GERAR COPA DO MUNDO
          </button>

          {!canGenerate && players.length > 0 && (
            <p className="mt-2 text-center text-xs text-white/40">
              Faltam{" "}
              <span className="text-neon-green">
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
