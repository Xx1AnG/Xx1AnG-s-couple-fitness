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
