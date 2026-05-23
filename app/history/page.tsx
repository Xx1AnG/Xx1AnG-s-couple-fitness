import { CalendarHistory } from "@/components/calendar-history";
import { PageShell } from "@/components/page-shell";
import type { Profile } from "@/lib/database.types";
import {
  addMonthsISO,
  monthBoundsISO,
  normalizeMonth,
} from "@/lib/date";
import { getOrCreateProfile, requireUser } from "@/lib/auth";
import { getTodayISO } from "@/lib/server-date";
import { getWorkoutImageUrlMap } from "@/lib/workout-images";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

function getSelectedDate(
  day: string | undefined,
  month: string,
  today: string,
  monthEnd: string,
) {
  if (day && /^\d{4}-\d{2}-\d{2}$/.test(day) && day.startsWith(month)) {
    return day;
  }

  if (today.startsWith(month)) {
    return today;
  }

  if (monthEnd < today) {
    return monthEnd;
  }

  return `${month}-01`;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const { supabase, user } = await requireUser();
  const profile = await getOrCreateProfile(user);
  const today = await getTodayISO();
  const month = normalizeMonth(getParam(params, "month"), today);
  const { start: monthStart, end: monthEnd } = monthBoundsISO(month);
  const selectedDate = getSelectedDate(
    getParam(params, "day"),
    month,
    today,
    monthEnd,
  );

  let partnerProfile: Profile | null = null;

  if (profile.partner_id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profile.partner_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    partnerProfile = data;
  }

  const userIds = [profile.id, partnerProfile?.id].filter(Boolean) as string[];
  const { data: checkInsData, error } = await supabase
    .from("workout_logs")
    .select("*")
    .in("user_id", userIds)
    .gte("workout_date", monthStart)
    .lte("workout_date", monthEnd)
    .order("workout_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const checkIns = checkInsData ?? [];
  const imageUrls = await getWorkoutImageUrlMap(supabase, checkIns);

  return (
    <PageShell
      active="history"
      subtitle="按月份查看双方打卡状态"
      title="历史日历"
    >
      <CalendarHistory
        checkIns={checkIns}
        currentProfile={profile}
        imageUrls={imageUrls}
        month={month}
        nextMonth={addMonthsISO(month, 1)}
        partnerProfile={partnerProfile}
        previousMonth={addMonthsISO(month, -1)}
        selectedDate={selectedDate}
      />
    </PageShell>
  );
}
