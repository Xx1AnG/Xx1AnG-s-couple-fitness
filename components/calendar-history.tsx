import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
} from "lucide-react";
import { clsx } from "clsx";

import type { Profile, WorkoutLog } from "@/lib/database.types";
import { calendarGridISO, formatDateLabel, formatMonthLabel } from "@/lib/date";
import { getIntensityLabel, getIntensityPoints } from "@/lib/workouts";

type CalendarHistoryProps = {
  month: string;
  previousMonth: string;
  nextMonth: string;
  selectedDate: string;
  currentProfile: Profile;
  partnerProfile: Profile | null;
  checkIns: WorkoutLog[];
  imageUrls: Map<string, string>;
};

type DayState = "completed" | "missed";

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

function getLog(
  checkIns: WorkoutLog[],
  userId: string | undefined,
  date: string,
) {
  return checkIns.find(
    (checkIn) => checkIn.user_id === userId && checkIn.workout_date === date,
  );
}

function getDayState(log: WorkoutLog | undefined) {
  return log ? "completed" : "missed";
}

function StatusDot({
  label,
  state,
}: {
  label: string;
  state: DayState;
}) {
  return (
    <span className="flex items-center gap-1 text-[10px] leading-none text-stone-600">
      <span
        aria-hidden
        className={clsx(
          "h-2 w-2 rounded-full",
          state === "completed" && "bg-emerald-500",
          state === "missed" && "bg-stone-300",
        )}
      />
      {label}
    </span>
  );
}

function DetailBlock({
  name,
  log,
  imageSrc,
}: {
  name: string;
  log: WorkoutLog | undefined;
  imageSrc?: string;
}) {
  if (!log) {
    return (
      <div className="rounded-md bg-stone-50 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <CircleDashed aria-hidden className="h-4 w-4" />
          {name}
        </p>
        <p className="mt-2 text-sm text-stone-500">这天没有打卡记录。</p>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-emerald-50 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
        <CheckCircle2 aria-hidden className="h-4 w-4" />
        {name}
      </p>
      <p className="mt-2 text-sm font-semibold text-emerald-950">
        {log.workout_type} · {log.duration_minutes} 分钟
      </p>
      <p className="mt-1 text-sm text-emerald-800">
        {getIntensityLabel(log.intensity_level)} ·{" "}
        {getIntensityPoints(log.intensity_level)} 分
      </p>
      {log.note ? (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-emerald-900">
          {log.note}
        </p>
      ) : null}
      {imageSrc ? (
        <img
          alt={`${name} 的训练照片`}
          className="mt-3 aspect-[4/3] w-full rounded-md object-cover"
          src={imageSrc}
        />
      ) : null}
    </div>
  );
}

export function CalendarHistory({
  month,
  previousMonth,
  nextMonth,
  selectedDate,
  currentProfile,
  partnerProfile,
  checkIns,
  imageUrls,
}: CalendarHistoryProps) {
  const cells = calendarGridISO(month);
  const selectedOwnLog = getLog(checkIns, currentProfile.id, selectedDate);
  const selectedPartnerLog = getLog(
    checkIns,
    partnerProfile?.id,
    selectedDate,
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <Link
            aria-label="上个月"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50"
            href={`/history?month=${previousMonth}`}
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
              Calendar
            </p>
            <h2 className="mt-1 text-lg font-semibold text-stone-950">
              {formatMonthLabel(month)}
            </h2>
          </div>
          <Link
            aria-label="下个月"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50"
            href={`/history?month=${nextMonth}`}
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-500">
          {weekdays.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) {
              return <div aria-hidden className="aspect-square" key={index} />;
            }

            const ownLog = getLog(checkIns, currentProfile.id, date);
            const partnerLog = getLog(checkIns, partnerProfile?.id, date);
            const ownState = getDayState(ownLog);
            const partnerState = partnerProfile
              ? getDayState(partnerLog)
              : "missed";
            const bothChecked = Boolean(partnerProfile && ownLog && partnerLog);

            return (
              <Link
                aria-label={`${date} 打卡详情`}
                className={clsx(
                  "flex aspect-square min-h-16 flex-col justify-between rounded-md border p-1.5 text-left transition",
                  selectedDate === date
                    ? "border-orange-400"
                    : "border-stone-200",
                  bothChecked
                    ? "bg-rose-50 hover:bg-rose-100"
                    : selectedDate === date
                      ? "bg-orange-50"
                      : "bg-white hover:bg-stone-50",
                )}
                href={`/history?month=${month}&day=${date}`}
                key={date}
              >
                <span className="text-sm font-semibold text-stone-950">
                  {Number(date.slice(-2))}
                </span>
                <span className="grid gap-1">
                  <StatusDot label="我" state={ownState} />
                  {partnerProfile ? (
                    <StatusDot label="伴" state={partnerState} />
                  ) : null}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-600">
          <StatusDot label="已打卡" state="completed" />
          <StatusDot label="未打卡" state="missed" />
          <span className="inline-flex items-center gap-1 text-stone-600">
            <span aria-hidden className="h-4 w-4 rounded border border-rose-100 bg-rose-50" />
            双方已打卡
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              {formatDateLabel(selectedDate)}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{selectedDate}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <DetailBlock
            imageSrc={
              selectedOwnLog?.image_url
                ? imageUrls.get(selectedOwnLog.image_url)
                : undefined
            }
            log={selectedOwnLog}
            name={currentProfile.display_name}
          />
          {partnerProfile ? (
            <DetailBlock
              imageSrc={
                selectedPartnerLog?.image_url
                  ? imageUrls.get(selectedPartnerLog.image_url)
                  : undefined
              }
              log={selectedPartnerLog}
              name={partnerProfile.display_name}
            />
          ) : (
            <p className="rounded-md bg-stone-50 p-3 text-sm text-stone-500">
              连接伴侣后可查看双方记录。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
