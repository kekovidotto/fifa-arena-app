export const ACHIEVEMENT_TYPES = [
  "CHAMPION",
  "RUNNER_UP",
  "THIRD_PLACE",
  "TOP_SCORER",
  "FAN_FAVORITE",
  "MVP",
  "CRAQUE_DA_GALERA",
  "FAIR_PLAY",
] as const;

export type AchievementType = (typeof ACHIEVEMENT_TYPES)[number];

export const ACHIEVEMENT_LABELS: Record<AchievementType, string> = {
  CHAMPION: "Campeão",
  RUNNER_UP: "Vice-campeão",
  THIRD_PLACE: "3º lugar",
  TOP_SCORER: "Artilheiro",
  FAN_FAVORITE: "Queridinho da torcida",
  MVP: "MVP / Melhor em campo",
  CRAQUE_DA_GALERA: "Craque da galera",
  FAIR_PLAY: "Fair play",
};
