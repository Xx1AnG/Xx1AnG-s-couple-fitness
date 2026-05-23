import { Notice } from "@/components/notice";
import { PageShell } from "@/components/page-shell";
import { ReminderSettingsForm } from "@/components/reminder-settings-form";
import { SectionCard } from "@/components/section-card";
import { getOrCreateProfile, requireUser } from "@/lib/auth";

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

export default async function SettingsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const { user } = await requireUser();
  const profile = await getOrCreateProfile(user);

  return (
    <PageShell
      active="settings"
      subtitle="提醒、偏好和后续功能准备"
      title="设置"
    >
      <Notice
        error={getParam(params, "error")}
        message={getParam(params, "message")}
      />

      <SectionCard>
        <h2 className="text-lg font-semibold text-stone-950">每日提醒</h2>
        <p className="mt-1 text-sm leading-5 text-stone-600">
          先保存你希望被提醒打卡的时间，后续可以接入邮件或推送。
        </p>
        <div className="mt-4">
          <ReminderSettingsForm profile={profile} />
        </div>
      </SectionCard>
    </PageShell>
  );
}
