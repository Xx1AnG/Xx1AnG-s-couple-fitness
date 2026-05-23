import type { WorkoutLog } from "@/lib/database.types";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  intersectDates,
} from "@/lib/date";
import { getIntensityPoints } from "@/lib/workouts";

export function logsForUser(logs: WorkoutLog[], userId: string | undefined) {
  if (!userId) {
    return [];
  }

  return logs.filter((log) => log.user_id === userId);
}

export function datesForLogs(logs: WorkoutLog[]) {
  return logs.map((log) => log.workout_date);
}

export function calculateUserStreaks(logs: WorkoutLog[], todayISO: string) {
  const dates = datesForLogs(logs);

  return {
    current: calculateCurrentStreak(dates, todayISO),
    longest: calculateLongestStreak(dates),
  };
}

export function calculateSharedStreaks(
  firstLogs: WorkoutLog[],
  secondLogs: WorkoutLog[],
  todayISO: string,
) {
  const sharedDates = intersectDates(datesForLogs(firstLogs), datesForLogs(secondLogs));

  return {
    current: calculateCurrentStreak(sharedDates, todayISO),
    longest: calculateLongestStreak(sharedDates),
  };
}

export function calculateWeeklyPoints(
  logs: WorkoutLog[],
  weekStartISO: string,
  todayISO: string,
) {
  return logs
    .filter((log) => log.workout_date >= weekStartISO && log.workout_date <= todayISO)
    .reduce((sum, log) => sum + getIntensityPoints(log.intensity_level), 0);
}
