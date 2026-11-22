-- Cardamom Store RBAC migration
-- Run once in Supabase SQL Editor. Existing data is preserved and backfilled.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  role text not null default 'USER'
    check (role in ('SUPER_ADMIN', 'ADMIN', 'USER')),
  active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocked_users (
  id bigserial primary key,
  name text,
  phone text unique not null,
  blocked_at timestamptz not null default now()
);

create table if not exists public.stock_rounds (
  id bigserial primary key,
  customer_name text,
  customer_phone text,
  round_no bigint,
  start_date date,
  end_date date,
  status text,
  created_at timestamptz not null default now(),
  created_by uuid
);

create unique index if not exists profiles_phone_unique
  on public.profiles(phone)
  where phone is not null;

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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requested_role text;
  normalized_phone text;
  creator_id uuid;
begin
  requested_role := upper(coalesce(
    new.raw_app_meta_data->>'role',
    new.raw_user_meta_data->>'role',
    'USER'
  ));

  if requested_role not in ('SUPER_ADMIN', 'ADMIN', 'USER') then
    requested_role := 'USER';
  end if;

  normalized_phone := nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), '');

  if normalized_phone is not null
     and exists (
       select 1
       from public.profiles p
       where p.phone = normalized_phone
         and p.id <> new.id
     ) then
    raise exception 'A user profile already exists for phone number %', normalized_phone;
  end if;

  if coalesce(new.raw_user_meta_data->>'created_by', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then
    creator_id := (new.raw_user_meta_data->>'created_by')::uuid;
  else
    creator_id := null;
  end if;

  insert into public.profiles (
    id,
    name,
    phone,
    role,
    active,
    created_by
  )
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'name', '')), ''),
    normalized_phone,
    requested_role,
    true,
    creator_id
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    role = excluded.role,
    created_by = coalesce(excluded.created_by, public.profiles.created_by),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of raw_app_meta_data, raw_user_meta_data
on auth.users
for each row execute function public.handle_auth_user_profile();

insert into public.profiles (id, name, phone, role, active, created_by)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data->>'name', '')), ''),
  nullif(regexp_replace(coalesce(u.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), ''),
  case
    when upper(coalesce(u.raw_app_meta_data->>'role', u.raw_user_meta_data->>'role', '')) = 'SUPER_ADMIN'
      then 'SUPER_ADMIN'
    when upper(coalesce(u.raw_app_meta_data->>'role', u.raw_user_meta_data->>'role', '')) = 'ADMIN'
      then 'ADMIN'
    else 'USER'
  end,
  true,
  case
    when coalesce(u.raw_user_meta_data->>'created_by', '') ~*
      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (u.raw_user_meta_data->>'created_by')::uuid
    else null
  end
from auth.users u
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role,
  created_by = coalesce(excluded.created_by, public.profiles.created_by),
  updated_at = now();

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'USER'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() = 'SUPER_ADMIN';
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() in ('ADMIN', 'SUPER_ADMIN');
$$;

create or replace function public.profile_is_active(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select active from public.profiles where id = profile_id),
    false
  );
$$;

alter table public.stocks add column if not exists owner_id uuid references auth.users(id);
alter table public.stocks add column if not exists admin_id uuid references auth.users(id);
alter table public.stocks add column if not exists created_by uuid references auth.users(id);

update public.stocks s
set
  owner_id = coalesce(s.owner_id, s.user_id),
  created_by = coalesce(s.created_by, s.user_id)
where s.owner_id is null or s.created_by is null;

update public.stocks s
set admin_id = coalesce(
  s.admin_id,
  (select p.created_by from public.profiles p where p.id = s.owner_id),
  s.owner_id
)
where s.admin_id is null;

alter table public.stock_rounds add column if not exists owner_id uuid references auth.users(id);
alter table public.stock_rounds add column if not exists admin_id uuid references auth.users(id);
alter table public.stock_rounds add column if not exists created_by uuid references auth.users(id);

update public.stock_rounds r
set
  owner_id = coalesce(r.owner_id, r.created_by),
  admin_id = coalesce(
    r.admin_id,
    (select p.created_by from public.profiles p where p.id = r.created_by),
    r.created_by
  ),
  created_by = coalesce(r.created_by, r.owner_id)
where r.owner_id is null or r.admin_id is null or r.created_by is null;

create or replace function public.enforce_stock_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
    new.user_id = coalesce(
      (select p.id from public.profiles p
       where p.phone = new.customer_phone
         and p.role = 'USER'
       limit 1),
      auth.uid()
    );
    new.owner_id = new.user_id;
    if not public.is_super_admin() then
      new.admin_id = auth.uid();
      if exists (
        select 1 from public.profiles p
        where p.id = new.owner_id
          and p.role = 'USER'
          and p.created_by is distinct from auth.uid()
      ) then
        raise exception 'Forbidden: customer is not managed by this admin';
      end if;
    end if;
  elsif tg_op = 'UPDATE' then
    if not public.is_super_admin() then
      new.owner_id = old.owner_id;
      new.admin_id = old.admin_id;
      new.created_by = old.created_by;
      new.user_id = old.user_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_stock_ownership on public.stocks;
create trigger enforce_stock_ownership
before insert or update on public.stocks
for each row execute function public.enforce_stock_ownership();

create or replace function public.enforce_round_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
    new.owner_id = auth.uid();
    if not public.is_super_admin() then
      new.admin_id = auth.uid();
    end if;
  elsif tg_op = 'UPDATE' and not public.is_super_admin() then
    new.owner_id = old.owner_id;
    new.admin_id = old.admin_id;
    new.created_by = old.created_by;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_round_ownership on public.stock_rounds;
create trigger enforce_round_ownership
before insert or update on public.stock_rounds
for each row execute function public.enforce_round_ownership();

alter table public.profiles enable row level security;
alter table public.stocks enable row level security;
alter table public.stock_rounds enable row level security;
alter table public.blocked_users enable row level security;

drop policy if exists profiles_read_own_scope on public.profiles;
create policy profiles_read_own_scope on public.profiles
for select to authenticated using (
  public.is_super_admin()
  or id = auth.uid()
  or (
    public.current_profile_role() = 'ADMIN'
    and created_by = auth.uid()
  )
);

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
for update to authenticated using (
  public.is_super_admin()
  or (
    public.current_profile_role() = 'ADMIN'
    and created_by = auth.uid()
  )
) with check (
  public.is_super_admin()
  or (
    public.current_profile_role() = 'ADMIN'
    and created_by = auth.uid()
  )
);

drop policy if exists stocks_read_isolated on public.stocks;
create policy stocks_read_isolated on public.stocks
for select to authenticated using (
  public.is_super_admin()
  or (
    public.current_profile_role() = 'ADMIN'
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or user_id = auth.uid()
    )
  )
  or (
    public.current_profile_role() = 'USER'
    and (
      owner_id = auth.uid()
      or user_id = auth.uid()
      or created_by = auth.uid()
    )
  )
);

drop policy if exists stocks_insert_isolated on public.stocks;
create policy stocks_insert_isolated on public.stocks
for insert to authenticated with check (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      created_by = auth.uid()
      or admin_id = auth.uid()
    )
  )
);

drop policy if exists stocks_update_isolated on public.stocks;
create policy stocks_update_isolated on public.stocks
for update to authenticated using (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or user_id = auth.uid()
    )
  )
) with check (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or user_id = auth.uid()
    )
  )
);

drop policy if exists stocks_delete_isolated on public.stocks;
create policy stocks_delete_isolated on public.stocks
for delete to authenticated using (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or user_id = auth.uid()
    )
  )
);

drop policy if exists rounds_read_isolated on public.stock_rounds;
create policy rounds_read_isolated on public.stock_rounds
for select to authenticated using (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or owner_id = auth.uid()
    )
  )
  or (
    public.current_profile_role() = 'USER'
    and (
      owner_id = auth.uid()
      or created_by = auth.uid()
    )
  )
);

drop policy if exists rounds_insert_isolated on public.stock_rounds;
create policy rounds_insert_isolated on public.stock_rounds
for insert to authenticated with check (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
    )
  )
);

drop policy if exists rounds_update_isolated on public.stock_rounds;
create policy rounds_update_isolated on public.stock_rounds
for update to authenticated using (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or owner_id = auth.uid()
    )
  )
) with check (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or owner_id = auth.uid()
    )
  )
);

drop policy if exists rounds_delete_isolated on public.stock_rounds;
create policy rounds_delete_isolated on public.stock_rounds
for delete to authenticated using (
  public.is_super_admin()
  or (
    public.is_admin()
    and (
      admin_id = auth.uid()
      or created_by = auth.uid()
      or owner_id = auth.uid()
    )
  )
);

drop policy if exists blocked_read_admin on public.blocked_users;
create policy blocked_read_admin on public.blocked_users
for select to authenticated using (
  public.is_super_admin()
  or public.is_admin()
);

drop policy if exists blocked_manage_admin on public.blocked_users;
create policy blocked_manage_admin on public.blocked_users
for all to authenticated using (
  public.is_super_admin()
  or public.is_admin()
) with check (
  public.is_super_admin()
  or public.is_admin()
);

create or replace function public.set_profile_active(
  target_id uuid,
  target_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin()
     and not (
       public.current_profile_role() = 'ADMIN'
       and exists (
         select 1
         from public.profiles p
         where p.id = target_id
           and p.created_by = auth.uid()
           and p.role = 'USER'
       )
     ) then
    raise exception 'Forbidden';
  end if;

  update public.profiles
  set active = target_active,
      updated_at = now()
  where id = target_id;
end;
$$;

revoke all on function public.set_profile_active(uuid, boolean) from public;
grant execute on function public.set_profile_active(uuid, boolean) to authenticated;

create or replace function public.delete_managed_account(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_id = auth.uid() then
    raise exception 'Cannot delete the signed-in account';
  end if;

  if not public.is_super_admin()
     and not (
       public.current_profile_role() = 'ADMIN'
       and exists (
         select 1
         from public.profiles p
         where p.id = target_id
           and p.created_by = auth.uid()
           and p.role = 'USER'
       )
     ) then
    raise exception 'Forbidden';
  end if;

  update public.profiles
  set active = false,
      updated_at = now()
  where id = target_id;
end;
$$;

revoke all on function public.delete_managed_account(uuid) from public;
grant execute on function public.delete_managed_account(uuid) to authenticated;
