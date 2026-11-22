-- Run manually in the Supabase SQL editor.
-- Review the backup tables before running reset_after_confirmation.sql.

begin;

create schema if not exists reset_backup_20261122;

do $$
begin
  if to_regclass('reset_backup_20261122.auth_users') is not null
  then
    raise exception 'Backup already exists. Export or remove it before creating another backup.';
  end if;
end
$$;

create table reset_backup_20261122.auth_users
as table auth.users;

do $$
declare
  table_name text;
begin
  for table_name in
    select t.table_name
    from information_schema.tables t
    where t.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
  loop
    execute format(
      'create table reset_backup_20261122.%I as table public.%I',
      table_name,
      table_name
    );
  end loop;
end
$$;

commit;
