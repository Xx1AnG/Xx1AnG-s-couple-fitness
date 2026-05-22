import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next");
  const redirectTo =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  const params = new URLSearchParams({
    error: "邮箱验证链接已失效，请重新登录。",
  });

  return NextResponse.redirect(
    new URL(`/login?${params.toString()}`, request.url),
  );
}
