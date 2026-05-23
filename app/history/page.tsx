import { HistoryList } from "@/components/history-list";
import { PageShell } from "@/components/page-shell";
import type { Profile } from "@/lib/database.types";
import { addDaysISO, dateRangeDescending } from "@/lib/date";
import { getOrCreateProfile, requireUser } from "@/lib/auth";
import { getTodayISO } from "@/lib/server-date";

export default async function HistoryPage() {
  const { supabase, user } = await requireUser();
  const profile = await getOrCreateProfile(user);
  const today = await getTodayISO();
  const fromDate = addDaysISO(today, -29);

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
    .gte("workout_date", fromDate)
    .lte("workout_date", today)
    .order("workout_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const checkIns = checkInsData ?? [];

  return (
    <PageShell
      active="history"
      subtitle="最近 30 天双方打卡概览"
      title="历史记录"
    >
      <HistoryList
        checkIns={checkIns}
        currentProfile={profile}
        dates={dateRangeDescending(today, 30)}
        partnerProfile={partnerProfile}
      />
    </PageShell>
  );
}
