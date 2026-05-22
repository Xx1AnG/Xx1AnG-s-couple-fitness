import { cookies } from "next/headers";

import { dateInTimeZone, TIME_ZONE_COOKIE } from "@/lib/date";

export async function getUserTimeZone() {
  const cookieStore = await cookies();
  return cookieStore.get(TIME_ZONE_COOKIE)?.value || "UTC";
}

export async function getTodayISO() {
  return dateInTimeZone(new Date(), await getUserTimeZone());
}
