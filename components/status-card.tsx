import { CheckCircle2, CircleDashed } from "lucide-react";

import type { WorkoutLog } from "@/lib/database.types";
import { getIntensityLabel, getIntensityPoints } from "@/lib/workouts";

type StatusCardProps = {
  label: string;
  name: string;
  checkIn: WorkoutLog | null;
  imageSrc?: string;
};

export function StatusCard({ label, name, checkIn, imageSrc }: StatusCardProps) {
  const completed = Boolean(checkIn);

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            {label}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold text-stone-950">
            {name}
          </h2>
        </div>
        {completed ? (
          <CheckCircle2
            aria-label="已打卡"
            className="h-6 w-6 shrink-0 text-emerald-600"
          />
        ) : (
          <CircleDashed
            aria-label="未打卡"
            className="h-6 w-6 shrink-0 text-stone-300"
          />
        )}
      </div>

      {checkIn ? (
        <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <p className="font-semibold">
            {checkIn.workout_type} · {checkIn.duration_minutes} 分钟
          </p>
          <p className="mt-1 text-emerald-800">
            {getIntensityLabel(checkIn.intensity_level)} ·{" "}
            {getIntensityPoints(checkIn.intensity_level)} 分
          </p>
          {checkIn.note ? (
            <p className="mt-1 line-clamp-2 text-emerald-800">{checkIn.note}</p>
          ) : null}
          {imageSrc ? (
            <img
              alt={`${name} 的训练照片`}
              className="mt-3 aspect-[4/3] w-full rounded-md object-cover"
              src={imageSrc}
            />
          ) : null}
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-600">
          今天还没有运动记录。
        </p>
      )}
    </section>
  );
}
