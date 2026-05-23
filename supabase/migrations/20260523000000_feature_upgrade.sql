alter table public.profiles
add column if not exists reminder_time time;

alter table public.workout_logs
add column if not exists intensity_level text not null default 'standard',
add column if not exists image_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_reminder_time_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_reminder_time_check
    check (reminder_time is null or date_part('second', reminder_time) = 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_logs_intensity_level_check'
      and conrelid = 'public.workout_logs'::regclass
  ) then
    alter table public.workout_logs
    add constraint workout_logs_intensity_level_check
    check (intensity_level in ('light', 'standard', 'challenge'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_logs_image_url_check'
      and conrelid = 'public.workout_logs'::regclass
  ) then
    alter table public.workout_logs
    add constraint workout_logs_image_url_check
    check (image_url is null or char_length(image_url) <= 500);
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workout-images',
  'workout-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Workout images can be read by owner or connected partner"
on storage.objects;

create policy "Workout images can be read by owner or connected partner"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'workout-images'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_connected_partner(((storage.foldername(name))[1])::uuid)
  )
);

drop policy if exists "Users can insert their own workout images"
on storage.objects;

create policy "Users can insert their own workout images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'workout-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own workout images"
on storage.objects;

create policy "Users can update their own workout images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'workout-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'workout-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own workout images"
on storage.objects;

create policy "Users can delete their own workout images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'workout-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

grant update (display_name, reminder_time) on public.profiles to authenticated;
