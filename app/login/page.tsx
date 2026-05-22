import { redirect } from "next/navigation";
import { Dumbbell, LogIn, UserPlus } from "lucide-react";

import { signIn, signUp } from "@/app/actions";
import { Notice } from "@/components/notice";
import { createClient } from "@/lib/supabase/server";

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

export default async function LoginPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <header className="pt-4">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-orange-600 text-white shadow-soft">
            <Dumbbell aria-hidden className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-stone-950">
            双人健身打卡
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            每天记录一次训练，和伴侣一起看见彼此的坚持。
          </p>
        </header>

        <Notice
          error={getParam(params, "error")}
          message={getParam(params, "message")}
        />

        <section className="rounded-lg border border-stone-200 bg-white/90 p-4 shadow-soft">
          <h2 className="text-lg font-semibold text-stone-950">登录</h2>
          <form action={signIn} className="mt-4 flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-stone-700" htmlFor="email">
                邮箱
              </label>
              <input
                autoComplete="email"
                className="mt-1 h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                id="email"
                name="email"
                required
                type="email"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-stone-700"
                htmlFor="password"
              >
                密码
              </label>
              <input
                autoComplete="current-password"
                className="mt-1 h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                id="password"
                minLength={6}
                name="password"
                required
                type="password"
              />
            </div>
            <button
              className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
              type="submit"
            >
              <LogIn aria-hidden className="h-4 w-4" />
              登录
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-orange-200 bg-orange-50/70 p-4 shadow-soft">
          <h2 className="text-lg font-semibold text-stone-950">创建账号</h2>
          <form action={signUp} className="mt-4 flex flex-col gap-3">
            <div>
              <label
                className="text-sm font-medium text-stone-700"
                htmlFor="signup_display_name"
              >
                昵称
              </label>
              <input
                autoComplete="name"
                className="mt-1 h-12 w-full rounded-md border border-orange-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                id="signup_display_name"
                maxLength={40}
                name="display_name"
                required
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-stone-700"
                htmlFor="signup_email"
              >
                邮箱
              </label>
              <input
                autoComplete="email"
                className="mt-1 h-12 w-full rounded-md border border-orange-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                id="signup_email"
                name="email"
                required
                type="email"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-stone-700"
                htmlFor="signup_password"
              >
                密码
              </label>
              <input
                autoComplete="new-password"
                className="mt-1 h-12 w-full rounded-md border border-orange-200 bg-white px-3 text-base text-stone-950 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                id="signup_password"
                minLength={6}
                name="password"
                required
                type="password"
              />
            </div>
            <button
              className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
              type="submit"
            >
              <UserPlus aria-hidden className="h-4 w-4" />
              注册
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
