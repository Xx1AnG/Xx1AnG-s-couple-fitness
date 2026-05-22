import { HeartHandshake } from "lucide-react";

import { connectPartner } from "@/app/actions";

export function ConnectPartnerForm() {
  return (
    <form action={connectPartner} className="flex flex-col gap-3">
      <div>
        <label
          className="text-sm font-medium text-stone-700"
          htmlFor="partner_code"
        >
          对方的邀请码
        </label>
        <input
          autoCapitalize="characters"
          className="mt-1 h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base font-semibold uppercase tracking-[0.16em] text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          id="partner_code"
          maxLength={12}
          name="partner_code"
          placeholder="例如 A1B2C3D4"
          required
        />
      </div>
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
        type="submit"
      >
        <HeartHandshake aria-hidden className="h-4 w-4" />
        连接伴侣
      </button>
    </form>
  );
}
