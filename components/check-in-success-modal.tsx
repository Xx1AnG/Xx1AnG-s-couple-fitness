"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type CheckInSuccessModalProps = {
  open: boolean;
};

export function CheckInSuccessModal({ open }: CheckInSuccessModalProps) {
  const [visible, setVisible] = useState(open);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/25 px-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="w-full max-w-sm rounded-lg bg-white p-5 text-center shadow-soft"
        role="dialog"
      >
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 aria-hidden className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-stone-950">
          恭喜你完成今日锻炼，继续加油！
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-md border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            onClick={() => setVisible(false)}
            type="button"
          >
            知道了
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
            href="/"
          >
            回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
