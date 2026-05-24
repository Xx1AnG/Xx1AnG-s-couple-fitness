import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, WorkoutLog } from "@/lib/database.types";

export const WORKOUT_IMAGE_BUCKET = "workout-images";
export const MAX_WORKOUT_IMAGE_SIZE = 5 * 1024 * 1024;

export const WORKOUT_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type UploadedWorkoutImage = {
  size: number;
  type: string;
  name?: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export function getUploadedWorkoutImage(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<UploadedWorkoutImage>;

  if (
    typeof candidate.size !== "number" ||
    typeof candidate.type !== "string" ||
    typeof candidate.arrayBuffer !== "function"
  ) {
    return null;
  }

  return candidate as UploadedWorkoutImage;
}

export async function getWorkoutImageUrlMap(
  supabase: SupabaseClient<Database>,
  logs: WorkoutLog[],
) {
  const paths = Array.from(
    new Set(logs.map((log) => log.image_url).filter(Boolean)),
  ) as string[];
  const urls = new Map<string, string>();

  if (paths.length === 0) {
    return urls;
  }

  const { data, error } = await supabase.storage
    .from(WORKOUT_IMAGE_BUCKET)
    .createSignedUrls(paths, 60 * 60);

  if (error) {
    console.error("Failed to create workout image signed URLs", error);
    return urls;
  }

  data.forEach((item) => {
    if (item.path && item.signedUrl) {
      urls.set(item.path, item.signedUrl);
    }
  });

  return urls;
}
