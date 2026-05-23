import { ImagePlus, Save } from "lucide-react";

import { saveTodayCheckIn } from "@/app/actions";
import type { WorkoutLog } from "@/lib/database.types";
import {
  getIntensityLabel,
  getIntensityPoints,
  INTENSITY_LEVELS,
  WORKOUT_TYPES,
} from "@/lib/workouts";

type CheckInFormProps = {
  checkIn: WorkoutLog | null;
  imageSrc?: string;
};

export function CheckInForm({ checkIn, imageSrc }: CheckInFormProps) {
  return (
    <form
      action={saveTodayCheckIn}
      className="flex flex-col gap-4"
      encType="multipart/form-data"
    >
      <div>
        <label
          className="text-sm font-medium text-stone-700"
          htmlFor="workout_type"
        >
          运动类型
        </label>
        <select
          className="mt-1 h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          defaultValue={checkIn?.workout_type || WORKOUT_TYPES[0]}
          id="workout_type"
          name="workout_type"
          required
        >
          {WORKOUT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="text-sm font-medium text-stone-700"
          htmlFor="intensity_level"
        >
          训练强度
        </label>
        <select
          className="mt-1 h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          defaultValue={checkIn?.intensity_level || "standard"}
          id="intensity_level"
          name="intensity_level"
          required
        >
          {INTENSITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {getIntensityLabel(level)} · {getIntensityPoints(level)} 分
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="text-sm font-medium text-stone-700"
          htmlFor="duration_minutes"
        >
          时长（分钟）
        </label>
        <input
          className="mt-1 h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          defaultValue={checkIn?.duration_minutes || 30}
          id="duration_minutes"
          inputMode="numeric"
          max={1440}
          min={1}
          name="duration_minutes"
          required
          type="number"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-stone-700" htmlFor="note">
          备注（可选）
        </label>
        <textarea
          className="mt-1 min-h-28 w-full resize-y rounded-md border border-stone-200 bg-white px-3 py-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          defaultValue={checkIn?.note || ""}
          id="note"
          maxLength={500}
          name="note"
          placeholder="今天状态、训练感受或想对对方说的话"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-stone-700" htmlFor="image">
          训练照片（可选）
        </label>
        <div className="mt-1 rounded-md border border-dashed border-stone-300 bg-white px-3 py-4">
          {imageSrc ? (
            <img
              alt="当前训练照片"
              className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
              src={imageSrc}
            />
          ) : null}
          <label
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-50 px-4 text-sm font-semibold text-orange-800 transition hover:bg-orange-100"
            htmlFor="image"
          >
            <ImagePlus aria-hidden className="h-4 w-4" />
            {imageSrc ? "更换照片" : "添加照片"}
          </label>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            id="image"
            name="image"
            type="file"
          />
          <p className="mt-2 text-xs leading-5 text-stone-500">
            支持 jpg、png、webp，最大 5MB。
          </p>
          {imageSrc ? (
            <label className="mt-3 flex items-center gap-2 text-sm text-stone-600">
              <input
                className="h-4 w-4 rounded border-stone-300 text-orange-600"
                name="remove_image"
                type="checkbox"
              />
              删除当前照片
            </label>
          ) : null}
        </div>
      </div>

      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
        type="submit"
      >
        <Save aria-hidden className="h-4 w-4" />
        {checkIn ? "保存修改" : "完成今天打卡"}
      </button>
    </form>
  );
}
