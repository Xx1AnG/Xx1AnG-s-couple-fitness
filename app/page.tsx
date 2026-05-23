import Link from "next/link";
import { Dumbbell, HeartHandshake } from "lucide-react";

import { ConnectPartnerForm } from "@/components/connect-partner-form";
import { MetricCard } from "@/components/metric-card";
import { Notice } from "@/components/notice";
import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { StatusCard } from "@/components/status-card";
import type { Profile, WorkoutLog } from "@/lib/database.types";
import { startOfWeekISO } from "@/lib/date";
import { getOrCreateProfile, requireUser } from "@/lib/auth";
import { getTodayISO } from "@/lib/server-date";
import { getWorkoutImageUrlMap } from "@/lib/workout-images";
import {
  calculateSharedStreaks,
  calculateUserStreaks,
  calculateWeeklyPoints,
  logsForUser,
} from "@/lib/workout-stats";

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

function findCheckIn(
  checkIns: WorkoutLog[],
  userId: string | undefined,
  date: string,
) {
  return checkIns.find(
    (checkIn) => checkIn.user_id === userId && checkIn.workout_date === date,
  );
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const { supabase, user } = await requireUser();
  const profile = await getOrCreateProfile(user);
  const today = await getTodayISO();
  const weekStart = startOfWeekISO(today);

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
  const { data: checkInsData, error: checkInsError } = await supabase
    .from("workout_logs")
    .select("*")
    .in("user_id", userIds)
    .lte("workout_date", today)
    .order("workout_date", { ascending: false });

  if (checkInsError) {
    throw new Error(checkInsError.message);
  }

  const checkIns = checkInsData ?? [];
  const ownToday = findCheckIn(checkIns, profile.id, today) || null;
  const partnerToday =
    findCheckIn(checkIns, partnerProfile?.id, today) || null;
  const ownLogs = logsForUser(checkIns, profile.id);
  const partnerLogs = logsForUser(checkIns, partnerProfile?.id);
  const ownStreaks = calculateUserStreaks(ownLogs, today);
  const partnerStreaks = partnerProfile
    ? calculateUserStreaks(partnerLogs, today)
    : { current: 0, longest: 0 };
  const sharedStreaks = partnerProfile
    ? calculateSharedStreaks(ownLogs, partnerLogs, today)
    : { current: 0, longest: 0 };
  const weekCompletionCount = ownLogs.filter(
    (log) => log.workout_date >= weekStart && log.workout_date <= today,
  ).length;
  const ownWeeklyPoints = calculateWeeklyPoints(ownLogs, weekStart, today);
  const partnerWeeklyPoints = calculateWeeklyPoints(partnerLogs, weekStart, today);
  const todayLogs = [ownToday, partnerToday].filter(Boolean) as WorkoutLog[];
  const todayImageUrls = await getWorkoutImageUrlMap(supabase, todayLogs);

  return (
    <PageShell
      active="home"
      subtitle={`今天是 ${today}`}
      title={`你好，${profile.display_name}`}
    >
      <Notice
        error={getParam(params, "error")}
        message={getParam(params, "message")}
      />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="我的连续" suffix="天" value={ownStreaks.current} />
        <MetricCard label="我的最长" suffix="天" value={ownStreaks.longest} />
        <MetricCard label="伴侣连续" suffix="天" value={partnerStreaks.current} />
        <MetricCard label="伴侣最长" suffix="天" value={partnerStreaks.longest} />
        <MetricCard label="共同连续" suffix="天" value={sharedStreaks.current} />
        <MetricCard label="共同最长" suffix="天" value={sharedStreaks.longest} />
        <MetricCard label="本周完成" suffix="次" value={weekCompletionCount} />
        <MetricCard label="我的周积分" suffix="分" value={ownWeeklyPoints} />
        <MetricCard label="伴侣周积分" suffix="分" value={partnerWeeklyPoints} />
      </div>

      <div className="grid gap-3">
        <StatusCard
          checkIn={ownToday}
          imageSrc={
            ownToday?.image_url ? todayImageUrls.get(ownToday.image_url) : undefined
          }
          label="我的今日状态"
          name="我"
        />
        {partnerProfile ? (
          <StatusCard
            checkIn={partnerToday}
            imageSrc={
              partnerToday?.image_url
                ? todayImageUrls.get(partnerToday.image_url)
                : undefined
            }
            label="伴侣今日状态"
            name={partnerProfile.display_name}
          />
        ) : (
          <SectionCard>
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                <HeartHandshake aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-950">连接你的伴侣</h2>
                <p className="mt-1 text-sm leading-5 text-stone-600">
                  输入对方的邀请码后，双方都可以查看彼此的资料和打卡记录。
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ConnectPartnerForm />
            </div>
          </SectionCard>
        )}
      </div>

      <Link
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-orange-700"
        href="/check-in"
      >
        <Dumbbell aria-hidden className="h-4 w-4" />
        {ownToday ? "编辑今天打卡" : "去完成今天打卡"}
      </Link>
    </PageShell>
  );
}
