import { Copy, HeartHandshake } from "lucide-react";

import { ConnectPartnerForm } from "@/components/connect-partner-form";
import { Notice } from "@/components/notice";
import { PageShell } from "@/components/page-shell";
import { ProfileForm } from "@/components/profile-form";
import { SectionCard } from "@/components/section-card";
import type { Profile } from "@/lib/database.types";
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

export default async function ProfilePage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const { supabase, user } = await requireUser();
  const profile = await getOrCreateProfile(user);

  let partnerProfile: Profile | null = null;

  if (profile.partner_id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profile.partner_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    partnerProfile = data;
  }

  return (
    <PageShell active="profile" subtitle={user.email || undefined} title="我的资料">
      <Notice
        error={getParam(params, "error")}
        message={getParam(params, "message")}
      />

      <SectionCard>
        <h2 className="text-lg font-semibold text-stone-950">基本信息</h2>
        <div className="mt-4">
          <ProfileForm profile={profile} />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">我的邀请码</h2>
            <p className="mt-1 text-sm leading-5 text-stone-600">
              让对方在个人页输入这串代码即可连接。
            </p>
          </div>
          <Copy aria-hidden className="h-5 w-5 shrink-0 text-stone-400" />
        </div>
        <p className="mt-4 rounded-md border border-dashed border-orange-300 bg-orange-50 px-3 py-3 text-center text-2xl font-semibold tracking-[0.18em] text-orange-900">
          {profile.partner_code}
        </p>
      </SectionCard>

      <SectionCard>
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <HeartHandshake aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-950">伴侣</h2>
            {partnerProfile ? (
              <p className="mt-1 text-sm leading-5 text-stone-600">
                已连接 {partnerProfile.display_name}。
              </p>
            ) : (
              <p className="mt-1 text-sm leading-5 text-stone-600">
                还没有连接伴侣。输入对方的邀请码后会自动双向连接。
              </p>
            )}
          </div>
        </div>

        {!partnerProfile ? (
          <div className="mt-4">
            <ConnectPartnerForm />
          </div>
        ) : null}
      </SectionCard>
    </PageShell>
  );
}
