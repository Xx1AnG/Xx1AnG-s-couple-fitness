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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, partner_code)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
        nullif(split_part(new.email, '@', 1), ''),
        'Fitness partner'
      ),
      40
    ),
    public.generate_partner_code()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (id, display_name, partner_code)
select
  users.id,
  left(
    coalesce(
      nullif(trim(users.raw_user_meta_data->>'display_name'), ''),
      nullif(split_part(users.email, '@', 1), ''),
      'Fitness partner'
    ),
    40
  ),
  public.generate_partner_code()
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
)
on conflict (id) do nothing;

grant execute on function public.generate_partner_code() to authenticated;
