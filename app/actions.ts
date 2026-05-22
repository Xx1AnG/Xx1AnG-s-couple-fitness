"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getTodayISO } from "@/lib/server-date";
import { createClient } from "@/lib/supabase/server";
import { WORKOUT_TYPE_SET } from "@/lib/workouts";

function redirectWith(path: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  redirect(`${path}?${searchParams.toString()}`);
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function signIn(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    redirectWith("/login", { error: "请输入邮箱和密码。" });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWith("/login", { error: "登录失败，请检查邮箱或密码。" });
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const displayName = getString(formData, "display_name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!displayName || !email || password.length < 6) {
    redirectWith("/login", {
      error: "请填写昵称、邮箱，并使用至少 6 位密码。",
    });
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      ...(siteUrl ? { emailRedirectTo: `${siteUrl}/auth/callback` } : {}),
    },
  });

  if (error) {
    redirectWith("/login", { error: error.message });
  }

  if (!data.session) {
    redirectWith("/login", {
      message: "注册成功。请先打开邮箱验证链接，再回来登录。",
    });
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const displayName = getString(formData, "display_name");

  if (!displayName) {
    redirectWith("/profile", { error: "昵称不能为空。" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) {
    redirectWith("/profile", { error: error.message });
  }

  revalidatePath("/");
  revalidatePath("/profile");
  redirectWith("/profile", { message: "资料已更新。" });
}

export async function connectPartner(formData: FormData) {
  const partnerCode = getString(formData, "partner_code").toUpperCase();

  if (!partnerCode) {
    redirectWith("/profile", { error: "请输入对方的邀请码。" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("connect_partner", {
    code_input: partnerCode,
  });

  if (error) {
    redirectWith("/profile", { error: error.message });
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/history");
  redirectWith("/profile", { message: "伴侣连接成功。" });
}

export async function saveTodayCheckIn(formData: FormData) {
  const workoutType = getString(formData, "workout_type");
  const duration = Number(getString(formData, "duration_minutes"));
  const note = getString(formData, "note");

  if (!WORKOUT_TYPE_SET.has(workoutType) || !Number.isInteger(duration)) {
    redirectWith("/check-in", { error: "请填写有效的运动类型和时长。" });
  }

  if (duration < 1 || duration > 1440) {
    redirectWith("/check-in", { error: "运动时长必须在 1 到 1440 分钟之间。" });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workoutDate = await getTodayISO();

  const { error } = await supabase.from("workout_logs").upsert(
    {
      user_id: user.id,
      workout_date: workoutDate,
      workout_type: workoutType,
      duration_minutes: duration,
      note: note || null,
    },
    {
      onConflict: "user_id,workout_date",
    },
  );

  if (error) {
    redirectWith("/check-in", { error: error.message });
  }

  revalidatePath("/");
  revalidatePath("/check-in");
  revalidatePath("/history");
  redirectWith("/", { message: "今天的打卡已保存。" });
}
