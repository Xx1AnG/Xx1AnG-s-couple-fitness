export const WORKOUT_TYPES = [
  "力量训练",
  "有氧运动",
  "瑜伽/拉伸",
  "跑步",
  "骑行",
  "游泳",
  "其他",
] as const;

export const WORKOUT_TYPE_SET = new Set<string>(WORKOUT_TYPES);

export const INTENSITY_LEVELS = ["light", "standard", "challenge"] as const;

export type IntensityLevel = (typeof INTENSITY_LEVELS)[number];

export const INTENSITY_LEVEL_SET = new Set<string>(INTENSITY_LEVELS);

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  light: "轻量",
  standard: "标准",
  challenge: "挑战",
};

export const INTENSITY_POINTS: Record<IntensityLevel, number> = {
  light: 1,
  standard: 2,
  challenge: 3,
};

export function getIntensityLabel(level: string | null | undefined) {
  if (level && INTENSITY_LEVEL_SET.has(level)) {
    return INTENSITY_LABELS[level as IntensityLevel];
  }

  return INTENSITY_LABELS.standard;
}

export function getIntensityPoints(level: string | null | undefined) {
  if (level && INTENSITY_LEVEL_SET.has(level)) {
    return INTENSITY_POINTS[level as IntensityLevel];
  }

  return INTENSITY_POINTS.standard;
}
