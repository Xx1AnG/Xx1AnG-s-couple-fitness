import { CheckInForm } from "@/components/check-in-form";
import { Notice } from "@/components/notice";
import { PageShell } from "@/components/page-shell";
import { SectionCard } from "@/components/section-card";
import { getOrCreateProfile, requireUser } from "@/lib/auth";
import { getTodayISO } from "@/lib/server-date";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

export default async function CheckInPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const { supabase, user } = await requireUser();
  await getOrCreateProfile(user);
  const today = await getTodayISO();

  const { data: checkIn, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("workout_date", today)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <PageShell
      active="check-in"
      subtitle={checkIn ? "今天已有记录，可继续修改。" : "每天只保存一条记录。"}
      title="今日打卡"
    >
      <Notice
        error={getParam(params, "error")}
        message={getParam(params, "message")}
      />

      <SectionCard>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-600">打卡日期</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">
              {today}
            </h2>
          </div>
          <span className="rounded-md bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            {checkIn ? "编辑模式" : "新记录"}
          </span>
        </div>

        <CheckInForm checkIn={checkIn} />
      </SectionCard>
    </PageShell>
  );
}
