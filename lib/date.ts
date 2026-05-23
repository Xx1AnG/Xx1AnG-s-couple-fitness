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

export function dateRangeAscending(startDate: string, endDate: string) {
  const dates: string[] = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = addDaysISO(cursor, 1);
  }

  return dates;
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

export function formatMonthLabel(monthISO: string) {
  const [year, month] = monthISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
  }).format(date);
}

export function monthFromISO(isoDate: string) {
  return isoDate.slice(0, 7);
}

export function normalizeMonth(month: string | undefined, fallbackDate: string) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return month;
  }

  return monthFromISO(fallbackDate);
}

export function addMonthsISO(monthISO: string, months: number) {
  const [year, month] = monthISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 7);
}

export function daysInMonthISO(monthISO: string) {
  const [year, month] = monthISO.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthBoundsISO(monthISO: string) {
  const start = `${monthISO}-01`;
  const end = `${monthISO}-${String(daysInMonthISO(monthISO)).padStart(2, "0")}`;

  return { start, end };
}

export function calendarGridISO(monthISO: string) {
  const { start } = monthBoundsISO(monthISO);
  const [year, month] = monthISO.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leadingBlankCount = (firstDay + 6) % 7;
  const days = daysInMonthISO(monthISO);
  const cells: Array<string | null> = [
    ...Array.from({ length: leadingBlankCount }, () => null),
    ...Array.from({ length: days }, (_, index) => addDaysISO(start, index)),
  ];
  const trailingBlankCount = (7 - (cells.length % 7)) % 7;

  return [
    ...cells,
    ...Array.from({ length: trailingBlankCount }, () => null),
  ];
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

export function calculateLongestStreak(checkInDates: string[]) {
  const dates = Array.from(new Set(checkInDates)).sort();
  let longest = 0;
  let current = 0;
  let previous: string | null = null;

  dates.forEach((date) => {
    if (!previous || addDaysISO(previous, 1) === date) {
      current += 1;
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
    previous = date;
  });

  return longest;
}

export function intersectDates(firstDates: string[], secondDates: string[]) {
  const secondSet = new Set(secondDates);
  return Array.from(new Set(firstDates.filter((date) => secondSet.has(date))));
}
