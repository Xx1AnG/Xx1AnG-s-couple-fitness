import Link from "next/link";
import { Dumbbell, History, Home, Settings, UserRound } from "lucide-react";
import { clsx } from "clsx";

type BottomNavProps = {
  active: "home" | "check-in" | "history" | "profile" | "settings";
};

const navItems = [
  { href: "/", label: "首页", key: "home", icon: Home },
  { href: "/check-in", label: "打卡", key: "check-in", icon: Dumbbell },
  { href: "/history", label: "记录", key: "history", icon: History },
  { href: "/settings", label: "设置", key: "settings", icon: Settings },
  { href: "/profile", label: "我的", key: "profile", icon: UserRound },
] as const;

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/92 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 pb-2 pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium",
                isActive
                  ? "bg-orange-100 text-orange-800"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900",
              )}
              href={item.href}
              key={item.key}
            >
              <Icon aria-hidden className="h-5 w-5" strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
