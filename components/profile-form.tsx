import { Save } from "lucide-react";

import { updateProfile } from "@/app/actions";
import type { Profile } from "@/lib/database.types";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  return (
    <form action={updateProfile} className="flex flex-col gap-3">
      <div>
        <label
          className="text-sm font-medium text-stone-700"
          htmlFor="display_name"
        >
          昵称
        </label>
        <input
          className="mt-1 h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          defaultValue={profile.display_name}
          id="display_name"
          maxLength={40}
          name="display_name"
          required
        />
      </div>
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
        type="submit"
      >
        <Save aria-hidden className="h-4 w-4" />
        保存资料
      </button>
    </form>
  );
}
