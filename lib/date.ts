export const TIME_ZONE_COOKIE = "couple_fitness_tz";

export function dateInTimeZone(date = new Date(), timeZone = "UTC") {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function addDaysISO(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function startOfWeekISO(isoDate: string, weekStartsOn = 1) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const diff = (weekday - weekStartsOn + 7) % 7;
  return addDaysISO(isoDate, -diff);
}

export function dateRangeDescending(endDate: string, days: number) {
  return Array.from({ length: days }, (_, index) => addDaysISO(endDate, -index));
}

export function formatDateLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function calculateCurrentStreak(
  checkInDates: string[],
  todayISO: string,
) {
  const completedDates = new Set(checkInDates);
  let cursor = completedDates.has(todayISO) ? todayISO : addDaysISO(todayISO, -1);
  let streak = 0;

  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }

  return streak;
}
