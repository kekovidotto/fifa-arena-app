"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Loader2, Plus, Trash2, Trophy, Users } from "lucide-react";

import { generateTournament } from "@/app/actions/tournament";

interface Player {
  name: string;
  team: string;
}

const MIN_PLAYERS = 4;

export default function RegisterPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canAdd = playerName.trim().length > 0 && teamName.trim().length > 0;
  const canGenerate = players.length >= MIN_PLAYERS;

  function addPlayer() {
    if (!canAdd) return;
    setPlayers((prev) => [
      ...prev,
      { name: playerName.trim(), team: teamName.trim() },
    ]);
    setPlayerName("");
    setTeamName("");
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
      await generateTournament(players);
      router.push("/dashboard");
    });
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#020617]/90 backdrop-blur-sm">
          <Loader2 className="size-12 animate-spin text-neon-green" />
          <p className="animate-pulse text-lg font-semibold tracking-wide text-neon-green">
            Sorteando Grupos...
          </p>
        </div>
      )}

      {/* Header */}
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

          {/* Player count badge */}
          <div className="neon-badge flex items-center gap-1.5 rounded-full px-3 py-1">
            <Users className="size-3.5" />
            <span className="text-sm font-bold">{players.length}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pt-6 pb-28">
        {/* Form */}
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
            <input
              type="text"
              placeholder="Time / Seleção"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="neon-input w-full rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
            />
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

        {/* Players List */}
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
                      <p className="truncate text-xs text-neon-blue">
                        {player.team}
                      </p>
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

      {/* Sticky bottom CTA */}
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
