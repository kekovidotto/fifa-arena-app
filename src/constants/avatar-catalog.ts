export type AvatarCategory = "cartoon" | "gamer";

export interface AvatarOption {
  id: string;
  name: string;
  category: AvatarCategory;
  imageUrl: string;
}

const cartoonSeeds = [
  "Finn",
  "Marceline",
  "Aang",
  "Toph",
  "Raven",
  "Starfire",
  "Ben10",
  "Mabel",
  "Dipper",
  "Gumball",
  "Darwin",
  "BMO",
  "Jake",
  "Steven",
  "Garnet",
  "Amethyst",
  "Pearl",
  "Mordecai",
  "Rigby",
  "Pops",
  "Skips",
  "MuscleMan",
  "Robin",
  "BeastBoy",
  "Cyborg",
];

const gamerSeeds = [
  "Ryu",
  "ChunLi",
  "Link",
  "Samus",
  "Cloud",
  "Tifa",
  "Sonic",
  "Shadow",
  "Lara",
  "Kratos",
  "Scorpion",
  "SubZero",
  "Mario",
  "Luigi",
  "Pikachu",
  "Kirby",
  "MasterChief",
  "Cortana",
  "Aloy",
  "Geralt",
  "Triss",
  "Yennefer",
  "Jinx",
  "Vi",
  "Ezio",
];

function build(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export const AVATAR_CATALOG: AvatarOption[] = [
  ...cartoonSeeds.map((seed) => ({
    id: `cartoon-${seed.toLowerCase()}`,
    name: seed,
    category: "cartoon" as const,
    imageUrl: build("fun-emoji", seed),
  })),
  ...gamerSeeds.map((seed) => ({
    id: `gamer-${seed.toLowerCase()}`,
    name: seed,
    category: "gamer" as const,
    imageUrl: build("pixel-art", seed),
  })),
];

const AVATAR_URL_SET = new Set(AVATAR_CATALOG.map((avatar) => avatar.imageUrl));

export function isAvatarUrlAllowed(url: string) {
  return AVATAR_URL_SET.has(url);
}
