/**
 * Dados para popular `teams_library` (seed).
 * Logos: clubes via API-Sports media; seleções via bandeiras (flagcdn).
 */
export type TeamLibraryCategory = "EUROPE" | "WORLD_CUP";

export interface TeamSeedRow {
  name: string;
  logoUrl: string;
  category: TeamLibraryCategory;
}

/** Clubes europeus de topo (identidade visual tipo UCL). */
export const EUROPEAN_CLUBS_SEED: TeamSeedRow[] = [
  {
    name: "Arsenal",
    logoUrl: "https://media.api-sports.io/football/teams/42.png",
    category: "EUROPE",
  },
  {
    name: "Aston Villa",
    logoUrl: "https://media.api-sports.io/football/teams/66.png",
    category: "EUROPE",
  },
  {
    name: "Atalanta",
    logoUrl: "https://media.api-sports.io/football/teams/499.png",
    category: "EUROPE",
  },
  {
    name: "Atlético de Madrid",
    logoUrl: "https://media.api-sports.io/football/teams/530.png",
    category: "EUROPE",
  },
  {
    name: "Ajax",
    logoUrl: "https://media.api-sports.io/football/teams/194.png",
    category: "EUROPE",
  },
  {
    name: "Barcelona",
    logoUrl: "https://media.api-sports.io/football/teams/529.png",
    category: "EUROPE",
  },
  {
    name: "Bayer Leverkusen",
    logoUrl: "https://media.api-sports.io/football/teams/168.png",
    category: "EUROPE",
  },
  {
    name: "Bayern München",
    logoUrl: "https://media.api-sports.io/football/teams/157.png",
    category: "EUROPE",
  },
  {
    name: "Benfica",
    logoUrl: "https://media.api-sports.io/football/teams/211.png",
    category: "EUROPE",
  },
  {
    name: "Borussia Dortmund",
    logoUrl: "https://media.api-sports.io/football/teams/165.png",
    category: "EUROPE",
  },
  {
    name: "Brighton & Hove Albion",
    logoUrl: "https://media.api-sports.io/football/teams/51.png",
    category: "EUROPE",
  },
  {
    name: "Chelsea",
    logoUrl: "https://media.api-sports.io/football/teams/49.png",
    category: "EUROPE",
  },
  {
    name: "Inter de Milão",
    logoUrl: "https://media.api-sports.io/football/teams/505.png",
    category: "EUROPE",
  },
  {
    name: "Juventus",
    logoUrl: "https://media.api-sports.io/football/teams/496.png",
    category: "EUROPE",
  },
  {
    name: "Lazio",
    logoUrl: "https://media.api-sports.io/football/teams/487.png",
    category: "EUROPE",
  },
  {
    name: "Liverpool",
    logoUrl: "https://media.api-sports.io/football/teams/40.png",
    category: "EUROPE",
  },
  {
    name: "Manchester City",
    logoUrl: "https://media.api-sports.io/football/teams/50.png",
    category: "EUROPE",
  },
  {
    name: "Manchester United",
    logoUrl: "https://media.api-sports.io/football/teams/33.png",
    category: "EUROPE",
  },
  {
    name: "Milan",
    logoUrl: "https://media.api-sports.io/football/teams/489.png",
    category: "EUROPE",
  },
  {
    name: "Napoli",
    logoUrl: "https://media.api-sports.io/football/teams/492.png",
    category: "EUROPE",
  },
  {
    name: "Newcastle United",
    logoUrl: "https://media.api-sports.io/football/teams/34.png",
    category: "EUROPE",
  },
  {
    name: "Olympique de Marseille",
    logoUrl: "https://media.api-sports.io/football/teams/81.png",
    category: "EUROPE",
  },
  {
    name: "Paris Saint-Germain",
    logoUrl: "https://media.api-sports.io/football/teams/85.png",
    category: "EUROPE",
  },
  {
    name: "Porto",
    logoUrl: "https://media.api-sports.io/football/teams/212.png",
    category: "EUROPE",
  },
  {
    name: "PSV Eindhoven",
    logoUrl: "https://media.api-sports.io/football/teams/197.png",
    category: "EUROPE",
  },
  {
    name: "RB Leipzig",
    logoUrl: "https://media.api-sports.io/football/teams/173.png",
    category: "EUROPE",
  },
  {
    name: "Real Madrid",
    logoUrl: "https://media.api-sports.io/football/teams/541.png",
    category: "EUROPE",
  },
  {
    name: "Real Sociedad",
    logoUrl: "https://media.api-sports.io/football/teams/548.png",
    category: "EUROPE",
  },
  {
    name: "Roma",
    logoUrl: "https://media.api-sports.io/football/teams/497.png",
    category: "EUROPE",
  },
  {
    name: "Sporting CP",
    logoUrl: "https://media.api-sports.io/football/teams/228.png",
    category: "EUROPE",
  },
  {
    name: "Tottenham",
    logoUrl: "https://media.api-sports.io/football/teams/47.png",
    category: "EUROPE",
  },
];

/** 32 seleções da Copa do Mundo FIFA 2022 (bandeiras). */
export const WORLD_CUP_2022_SEED: TeamSeedRow[] = [
  { name: "Alemanha", logoUrl: "https://flagcdn.com/w80/de.png", category: "WORLD_CUP" },
  { name: "Arábia Saudita", logoUrl: "https://flagcdn.com/w80/sa.png", category: "WORLD_CUP" },
  { name: "Argentina", logoUrl: "https://flagcdn.com/w80/ar.png", category: "WORLD_CUP" },
  { name: "Austrália", logoUrl: "https://flagcdn.com/w80/au.png", category: "WORLD_CUP" },
  { name: "Bélgica", logoUrl: "https://flagcdn.com/w80/be.png", category: "WORLD_CUP" },
  { name: "Brasil", logoUrl: "https://flagcdn.com/w80/br.png", category: "WORLD_CUP" },
  { name: "Camarões", logoUrl: "https://flagcdn.com/w80/cm.png", category: "WORLD_CUP" },
  { name: "Canadá", logoUrl: "https://flagcdn.com/w80/ca.png", category: "WORLD_CUP" },
  { name: "Catar", logoUrl: "https://flagcdn.com/w80/qa.png", category: "WORLD_CUP" },
  { name: "Coreia do Sul", logoUrl: "https://flagcdn.com/w80/kr.png", category: "WORLD_CUP" },
  { name: "Costa Rica", logoUrl: "https://flagcdn.com/w80/cr.png", category: "WORLD_CUP" },
  { name: "Croácia", logoUrl: "https://flagcdn.com/w80/hr.png", category: "WORLD_CUP" },
  { name: "Dinamarca", logoUrl: "https://flagcdn.com/w80/dk.png", category: "WORLD_CUP" },
  { name: "Equador", logoUrl: "https://flagcdn.com/w80/ec.png", category: "WORLD_CUP" },
  { name: "Espanha", logoUrl: "https://flagcdn.com/w80/es.png", category: "WORLD_CUP" },
  { name: "Estados Unidos", logoUrl: "https://flagcdn.com/w80/us.png", category: "WORLD_CUP" },
  { name: "França", logoUrl: "https://flagcdn.com/w80/fr.png", category: "WORLD_CUP" },
  { name: "Gana", logoUrl: "https://flagcdn.com/w80/gh.png", category: "WORLD_CUP" },
  { name: "Holanda", logoUrl: "https://flagcdn.com/w80/nl.png", category: "WORLD_CUP" },
  { name: "Inglaterra", logoUrl: "https://flagcdn.com/w80/gb-eng.png", category: "WORLD_CUP" },
  { name: "Irã", logoUrl: "https://flagcdn.com/w80/ir.png", category: "WORLD_CUP" },
  { name: "Japão", logoUrl: "https://flagcdn.com/w80/jp.png", category: "WORLD_CUP" },
  { name: "Marrocos", logoUrl: "https://flagcdn.com/w80/ma.png", category: "WORLD_CUP" },
  { name: "México", logoUrl: "https://flagcdn.com/w80/mx.png", category: "WORLD_CUP" },
  { name: "País de Gales", logoUrl: "https://flagcdn.com/w80/gb-wls.png", category: "WORLD_CUP" },
  { name: "Polônia", logoUrl: "https://flagcdn.com/w80/pl.png", category: "WORLD_CUP" },
  { name: "Portugal", logoUrl: "https://flagcdn.com/w80/pt.png", category: "WORLD_CUP" },
  { name: "Senegal", logoUrl: "https://flagcdn.com/w80/sn.png", category: "WORLD_CUP" },
  { name: "Sérvia", logoUrl: "https://flagcdn.com/w80/rs.png", category: "WORLD_CUP" },
  { name: "Suíça", logoUrl: "https://flagcdn.com/w80/ch.png", category: "WORLD_CUP" },
  { name: "Tunísia", logoUrl: "https://flagcdn.com/w80/tn.png", category: "WORLD_CUP" },
  { name: "Uruguai", logoUrl: "https://flagcdn.com/w80/uy.png", category: "WORLD_CUP" },
];

export const ALL_TEAMS_SEED: TeamSeedRow[] = [
  ...EUROPEAN_CLUBS_SEED,
  ...WORLD_CUP_2022_SEED,
];
