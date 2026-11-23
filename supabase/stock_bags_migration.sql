-- Add separate bag counts for stock entries.
-- Existing records keep their bag counts NULL; historical bag counts are not invented.

alter table public.stocks
  add column if not exists before_dry_bags integer,
  add column if not exists after_dry_bags integer;

alter table public.stocks
  alter column before_dry_weight drop not null,
  alter column after_dry_weight drop not null;

alter table public.stocks drop constraint if exists stocks_before_dry_bags_nonnegative;
alter table public.stocks drop constraint if exists stocks_after_dry_bags_nonnegative;

alter table public.stocks
  add constraint stocks_before_dry_bags_nonnegative
  check (before_dry_bags is null or before_dry_bags >= 0),
  add constraint stocks_after_dry_bags_nonnegative
  check (after_dry_bags is null or after_dry_bags >= 0);
