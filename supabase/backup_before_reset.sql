-- Run manually in the Supabase SQL editor.
-- Review the backup tables before running reset_after_confirmation.sql.

begin;

create schema if not exists reset_backup_20261122;

create table reset_backup_20261122.auth_users
as table auth.users;

do $$
begin
  execute 'create table reset_backup_20261122.profiles as table public.profiles';
  execute 'create table reset_backup_20261122.blocked_users as table public.blocked_users';
  execute 'create table reset_backup_20261122.stocks as table public.stocks';
  execute 'create table reset_backup_20261122.stock_rounds as table public.stock_rounds';
end
$$;

do $$
declare
  table_name text;
begin
  for table_name in
    select t.table_name
    from information_schema.tables t
    where t.table_schema = 'public'
      and t.table_name in (
        'notification_settings',
        'message_templates',
        'message_history',
        'labour',
        'labour_records',
        'expenses'
      )
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
