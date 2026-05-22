create extension if not exists "pgcrypto";

create or replace function public.generate_partner_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
begin
  loop
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    exit when not exists (
      select 1 from public.profiles where partner_code = new_code
    );
  end loop;

  return new_code;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (
    char_length(trim(display_name)) between 1 and 40
  ),
  partner_code text not null unique default public.generate_partner_code(),
  partner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (partner_id is null or partner_id <> id),
  check (partner_code = upper(partner_code)),
  check (char_length(partner_code) between 6 and 12)
);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date date not null,
  workout_type text not null check (char_length(trim(workout_type)) between 1 and 40),
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workout_date)
);

create index profiles_partner_id_idx on public.profiles(partner_id);
create index workout_logs_user_date_idx on public.workout_logs(user_id, workout_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger workout_logs_set_updated_at
before update on public.workout_logs
for each row
execute function public.set_updated_at();

create or replace function public.prevent_protected_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.id is distinct from new.id then
    raise exception '用户资料 ID 不可修改。';
  end if;

  if old.partner_code is distinct from new.partner_code then
    raise exception '邀请码不可修改。';
  end if;

  if old.partner_id is distinct from new.partner_id
    and coalesce(current_setting('app.connect_partner', true), '') <> 'on' then
    raise exception '请通过邀请码连接伴侣。';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_protected_changes
before update of id, partner_code, partner_id on public.profiles
for each row
execute function public.prevent_protected_profile_changes();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
        nullif(split_part(new.email, '@', 1), ''),
        '健身伙伴'
      ),
      40
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_connected_partner(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles me
    where me.id = auth.uid()
      and me.partner_id = target_user_id
  );
$$;

create or replace function public.connect_partner(code_input text)
returns table(partner_id uuid, partner_display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile public.profiles%rowtype;
  target_profile public.profiles%rowtype;
  normalized_code text := upper(trim(code_input));
begin
  if current_user_id is null then
    raise exception '请先登录。';
  end if;

  if normalized_code = '' then
    raise exception '请输入邀请码。';
  end if;

  select *
  into current_profile
  from public.profiles
  where id = current_user_id
  for update;

  if not found then
    raise exception '当前用户资料不存在。';
  end if;

  select *
  into target_profile
  from public.profiles
  where partner_code = normalized_code
  for update;

  if not found then
    raise exception '邀请码不存在。';
  end if;

  if target_profile.id = current_user_id then
    raise exception '不能连接自己。';
  end if;

  if current_profile.partner_id is not null then
    raise exception '你已经连接了伴侣。';
  end if;

  if target_profile.partner_id is not null then
    raise exception '对方已经连接了伴侣。';
  end if;

  perform set_config('app.connect_partner', 'on', true);

  update public.profiles
  set partner_id = target_profile.id
  where id = current_user_id;

  update public.profiles
  set partner_id = current_user_id
  where id = target_profile.id;

  partner_id := target_profile.id;
  partner_display_name := target_profile.display_name;
  return next;
end;
$$;

alter table public.profiles enable row level security;
alter table public.workout_logs enable row level security;

create policy "Profiles can be read by owner or connected partner"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_connected_partner(id)
);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Workout logs can be read by owner or connected partner"
on public.workout_logs
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_connected_partner(user_id)
);

create policy "Users can insert their own workout logs"
on public.workout_logs
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own workout logs"
on public.workout_logs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own workout logs"
on public.workout_logs
for delete
to authenticated
using (user_id = auth.uid());

grant usage on schema public to anon, authenticated;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, display_name) on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

revoke all on public.workout_logs from anon, authenticated;
grant select, insert, update, delete on public.workout_logs to authenticated;

revoke all on function public.connect_partner(text) from public;
grant execute on function public.connect_partner(text) to authenticated;

revoke all on function public.is_connected_partner(uuid) from public;
grant execute on function public.is_connected_partner(uuid) to authenticated;

grant execute on function public.generate_partner_code() to authenticated;
