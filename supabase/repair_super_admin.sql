-- Run in the Supabase SQL editor after rbac_migration.sql.
-- This script repairs Auth app metadata and the public profiles row.

do $$
declare
  target_email text := lower('harishhari3291@gmail.com');
  target_id uuid;
begin
  select id into target_id
  from auth.users
  where lower(email) = target_email;

  if target_id is null then
    raise exception 'No Auth user found for %', target_email;
  end if;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'SUPER_ADMIN')
  where id = target_id;

  insert into public.profiles (
    id,
    name,
    phone,
    role,
    active,
    created_by
  )
  select
    u.id,
    nullif(trim(coalesce(u.raw_user_meta_data->>'name', '')), ''),
    nullif(regexp_replace(coalesce(u.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), ''),
    'SUPER_ADMIN',
    true,
    null
  from auth.users u
  where u.id = target_id
  on conflict (id) do update set
    role = 'SUPER_ADMIN',
    active = true,
    updated_at = now();

  raise notice 'Super Admin repaired for % (%)', target_email, target_id;
end
$$;

-- Verify:
-- select u.email, u.raw_app_meta_data->>'role' as auth_role,
--        p.role as profile_role, p.active
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- where lower(u.email) = lower('harishhari3291@gmail.com');
