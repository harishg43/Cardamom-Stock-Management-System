-- DESTRUCTIVE: Execute only after project-owner confirmation.
-- Run backup_before_reset.sql first and verify reset_backup_20261122.
-- Owner must run this in the same SQL Editor session before the script:
-- select set_config('app.confirm_full_reset', 'CONFIRM_DELETE_ALL_APPLICATION_DATA', false);
begin;
do $$
begin
  if current_setting('app.confirm_full_reset', true) is distinct from 'CONFIRM_DELETE_ALL_APPLICATION_DATA'
  then
    raise exception 'Reset blocked: owner confirmation was not provided';
  end if;
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
        'message_history',
        'notification_settings',
        'message_templates',
        'blocked_users',
        'stock_rounds',
        'stocks',
        'labour',
        'labour_records',
        'expenses'
      )
  loop
    execute format('truncate table public.%I restart identity cascade', table_name);
  end loop;
end
$$;

delete from public.profiles;

-- Supabase auth users include system/internal users. This is the complete application reset.
delete from auth.users;

commit;
