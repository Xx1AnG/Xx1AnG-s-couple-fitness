import { Bell, Save } from "lucide-react";

import { updateReminderSettings } from "@/app/actions";
import type { Profile } from "@/lib/database.types";

type ReminderSettingsFormProps = {
  profile: Profile;
};

export function ReminderSettingsForm({ profile }: ReminderSettingsFormProps) {
  const reminderTime = profile.reminder_time?.slice(0, 5) || "";

  return (
    <form action={updateReminderSettings} className="flex flex-col gap-4">
      <div>
        <label
          className="text-sm font-medium text-stone-700"
          htmlFor="reminder_time"
        >
          每日提醒时间
        </label>
        <div className="mt-1 flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3">
          <Bell aria-hidden className="h-4 w-4 shrink-0 text-orange-700" />
          <input
            className="h-12 min-w-0 flex-1 bg-transparent text-base text-stone-950 outline-none"
            defaultValue={reminderTime}
            id="reminder_time"
            name="reminder_time"
            type="time"
          />
        </div>
        <p className="mt-2 text-xs leading-5 text-stone-500">
          留空表示暂不设置。当前版本只保存时间，不发送提醒。
        </p>
      </div>

      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
        type="submit"
      >
        <Save aria-hidden className="h-4 w-4" />
        保存提醒设置
      </button>
    </form>
  );
}
