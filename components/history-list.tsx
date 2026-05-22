import { CheckCircle2, MinusCircle } from "lucide-react";

import type { Profile, WorkoutLog } from "@/lib/database.types";
import { formatDateLabel } from "@/lib/date";

type HistoryListProps = {
  dates: string[];
  currentProfile: Profile;
  partnerProfile: Profile | null;
  checkIns: WorkoutLog[];
};

function statusFor(log?: WorkoutLog) {
  if (!log) {
    return (
      <span className="inline-flex items-center gap-1 text-stone-400">
        <MinusCircle aria-hidden className="h-4 w-4" />
        未打卡
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-emerald-700">
      <CheckCircle2 aria-hidden className="h-4 w-4" />
      {log.workout_type} · {log.duration_minutes} 分钟
    </span>
  );
}

export function HistoryList({
  dates,
  currentProfile,
  partnerProfile,
  checkIns,
}: HistoryListProps) {
  const byUserAndDate = new Map<string, WorkoutLog>();

  checkIns.forEach((checkIn) => {
    byUserAndDate.set(`${checkIn.user_id}:${checkIn.workout_date}`, checkIn);
  });

  return (
    <div className="flex flex-col gap-3">
      {dates.map((date) => {
        const ownLog = byUserAndDate.get(`${currentProfile.id}:${date}`);
        const partnerLog = partnerProfile
          ? byUserAndDate.get(`${partnerProfile.id}:${date}`)
          : undefined;

        return (
          <section
            className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft"
            key={date}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-stone-950">
                {formatDateLabel(date)}
              </h2>
              <span className="text-xs text-stone-500">{date}</span>
            </div>

            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-16 shrink-0 text-stone-600">
                  {currentProfile.display_name}
                </span>
                <span className="text-right">{statusFor(ownLog)}</span>
              </div>

              {partnerProfile ? (
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-16 shrink-0 text-stone-600">
                    {partnerProfile.display_name}
                  </span>
                  <span className="text-right">{statusFor(partnerLog)}</span>
                </div>
              ) : (
                <p className="text-sm text-stone-500">连接伴侣后可查看双方记录。</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
