import {
  Award,
  Crosshair,
  Handshake,
  Heart,
  type LucideIcon,
  Medal,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import type { AchievementType } from "@/lib/achievement-types";

/** Ícone pequeno por tipo de conquista (Hall da Fama, resumos). */
export function TrophyTypeIcon({
  type,
  className,
}: {
  type: AchievementType;
  className?: string;
}) {
  const Icon = TROPHY_ICONS[type];
  return <Icon className={className ?? "size-3.5"} strokeWidth={2} />;
}

const TROPHY_ICONS: Record<AchievementType, LucideIcon> = {
  CHAMPION: Trophy,
  RUNNER_UP: Medal,
  THIRD_PLACE: Award,
  TOP_SCORER: Crosshair,
  FAN_FAVORITE: Heart,
  MVP: Star,
  CRAQUE_DA_GALERA: Sparkles,
  FAIR_PLAY: Handshake,
};
