/** Chave estável para detectar o mesmo time (biblioteca ou digitado). */
export function normalizeTeamKey(team: string): string {
  return team.trim().toLowerCase().replace(/\s+/g, " ");
}

export interface LobbyUniquenessInput {
  team: string;
  userId?: string | null | undefined;
}

export function assertUniqueLobbyPlayers(inputs: LobbyUniquenessInput[]): void {
  const seenUserIds = new Set<string>();
  const seenTeams = new Set<string>();

  for (const p of inputs) {
    const uid = p.userId?.trim();
    if (uid) {
      if (seenUserIds.has(uid)) {
        throw new Error(
          "Não é permitido inscrever a mesma conta (e-mail) duas vezes.",
        );
      }
      seenUserIds.add(uid);
    }

    const teamKey = normalizeTeamKey(p.team);
    if (seenTeams.has(teamKey)) {
      throw new Error("Não é permitido repetir o mesmo time entre os inscritos.");
    }
    seenTeams.add(teamKey);
  }
}
