import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { Profile } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

function fallbackDisplayName(user: User) {
  const metadataName = user.user_metadata?.display_name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] || "健身伙伴";
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function getOrCreateProfile(user: User): Promise<Profile> {
  const supabase = await createClient();

  const { data: existingProfile, error: readError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  if (existingProfile) {
    return existingProfile;
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      display_name: fallbackDisplayName(user),
    })
    .select("*")
    .single();

  if (createdProfile) {
    return createdProfile;
  }

  if (createError?.code === "23505") {
    const { data: profileAfterRace, error: retryError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (retryError) {
      throw new Error(retryError.message);
    }

    return profileAfterRace;
  }

  throw new Error(createError?.message || "无法创建用户资料");
}
