"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { TIME_ZONE_COOKIE } from "@/lib/date";

export function TimezoneCookie() {
  const router = useRouter();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!timeZone) {
      return;
    }

    const encodedTimeZone = encodeURIComponent(timeZone);
    const currentCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${TIME_ZONE_COOKIE}=`));

    if (currentCookie === `${TIME_ZONE_COOKIE}=${encodedTimeZone}`) {
      return;
    }

    document.cookie = `${TIME_ZONE_COOKIE}=${encodedTimeZone}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
