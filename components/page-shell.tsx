import Link from "next/link";
import { LogOut } from "lucide-react";

import { signOut } from "@/app/actions";
import { BottomNav } from "@/components/bottom-nav";

type PageShellProps = {
  active: "home" | "check-in" | "history" | "profile";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function PageShell({
  active,
  title,
  subtitle,
  children,
}: PageShellProps) {
  return (
    <main className="min-h-screen pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-5">
        <header className="flex items-start justify-between gap-4">
          <Link href="/" className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
              Couple Fit
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm leading-5 text-stone-600">{subtitle}</p>
            ) : null}
          </Link>

          <form action={signOut}>
            <button
              aria-label="退出登录"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-600 shadow-sm hover:bg-stone-50"
              type="submit"
            >
              <LogOut aria-hidden className="h-4 w-4" />
            </button>
          </form>
        </header>

        {children}
      </div>

      <BottomNav active={active} />
    </main>
  );
}
