-- Run in the Supabase SQL editor after rbac_migration.sql.
-- This repairs roles/profiles for accounts that already exist in Supabase Auth.
-- Passwords must be set/reset in Supabase Authentication > Users.

do $$
declare
  super_admin_id uuid;
  admin_id uuid;
  user_id uuid;
begin
  select id into super_admin_id
  from auth.users
  where lower(email) = 'harishhari3291@gmail.com';

  select id into admin_id
  from auth.users
  where lower(email) = '8270153291@user.local';

  select id into user_id
  from auth.users
  where lower(email) = '9961153291@user.local';

  if super_admin_id is null
     or admin_id is null
     or user_id is null
  then
    raise exception
      'Missing Auth users. Super Admin=%, Admin=%, User=%',
      super_admin_id is not null,
      admin_id is not null,
      user_id is not null;
  end if;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'SUPER_ADMIN'),
    raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('name', 'Harish', 'role', 'SUPER_ADMIN')
  where id = super_admin_id;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'ADMIN'),
    raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('name', 'Harish', 'phone', '8270153291', 'role', 'ADMIN', 'created_by', super_admin_id::text)
  where id = admin_id;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'USER'),
    raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('name', 'Gurusamy', 'phone', '9961153291', 'role', 'USER', 'created_by', admin_id::text)
  where id = user_id;

  insert into public.profiles (id, name, phone, role, active, created_by)
  values
    (super_admin_id, 'Harish', null, 'SUPER_ADMIN', true, null),
    (admin_id, 'Harish', '8270153291', 'ADMIN', true, super_admin_id),
    (user_id, 'Gurusamy', '9961153291', 'USER', true, admin_id)
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    role = excluded.role,
    active = true,
    created_by = excluded.created_by,
    updated_at = now();

  raise notice 'Initialized Super Admin=%, Admin=%, User=%',
    super_admin_id, admin_id, user_id;
end
$$;

-- Verify all three accounts:
-- select u.email,
--        u.raw_app_meta_data->>'role' as auth_role,
--        p.name,
--        p.phone,
--        p.role as profile_role,
--        p.active,
--        p.created_by
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- where lower(u.email) in (
--   'harishhari3291@gmail.com',
--   '8270153291@user.local',
--   '9961153291@user.local'
-- )
-- order by u.email;
