-- Notification and reporting support for Gurusamy Cardamom Management System

alter table public.profiles
  add column if not exists whatsapp_consent boolean not null default false,
  add column if not exists sms_consent boolean not null default false,
  add column if not exists preferred_language text not null default 'en';

alter table public.profiles
  drop constraint if exists profiles_preferred_language_check;
alter table public.profiles
  add constraint profiles_preferred_language_check
  check (preferred_language in ('en', 'ta', 'ml'));

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  whatsapp_enabled boolean not null default true,
  sms_enabled boolean not null default true,
  automatic_stock_notification boolean not null default true,
  language text not null default 'en'
    check (language in ('en', 'ta', 'ml')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admin_id)
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete cascade,
  template_name text not null,
  language text not null check (language in ('en', 'ta', 'ml')),
  channel text not null check (channel in ('WHATSAPP', 'SMS')),
  template_content text not null,
  provider_template_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.message_templates
  add column if not exists admin_id uuid references auth.users(id) on delete cascade;

create table if not exists public.message_history (
  id uuid primary key default gen_random_uuid(),
  stock_id bigint references public.stocks(id) on delete set null,
  farmer_id uuid references auth.users(id) on delete set null,
  admin_id uuid references auth.users(id) on delete set null,
  message_content text not null,
  channel text not null check (channel in ('WHATSAPP', 'SMS')),
  delivery_status text not null default 'queued'
    check (delivery_status in ('queued', 'sent', 'delivered', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create unique index if not exists message_history_stock_channel_unique
  on public.message_history(stock_id, channel)
  where stock_id is not null;
create index if not exists message_history_admin_created_idx
  on public.message_history(admin_id, created_at desc);
create index if not exists message_history_farmer_created_idx
  on public.message_history(farmer_id, created_at desc);
create index if not exists message_history_channel_status_idx
  on public.message_history(channel, delivery_status);
create index if not exists notification_settings_admin_idx
  on public.notification_settings(admin_id);
create index if not exists message_templates_channel_language_idx
  on public.message_templates(channel, language);
create index if not exists message_templates_admin_idx
  on public.message_templates(admin_id);
create unique index if not exists message_templates_name_channel_language_admin_unique
  on public.message_templates(template_name, channel, language, admin_id);

drop trigger if exists notification_settings_set_updated_at on public.notification_settings;
create trigger notification_settings_set_updated_at
before update on public.notification_settings
for each row execute function public.set_updated_at();

drop trigger if exists message_templates_set_updated_at on public.message_templates;
create trigger message_templates_set_updated_at
before update on public.message_templates
for each row execute function public.set_updated_at();

alter table public.notification_settings enable row level security;
alter table public.message_templates enable row level security;
alter table public.message_history enable row level security;

drop policy if exists notification_settings_read on public.notification_settings;
create policy notification_settings_read on public.notification_settings
for select to authenticated using (
  public.is_super_admin()
  or (public.is_admin() and admin_id = auth.uid())
);

drop policy if exists notification_settings_manage on public.notification_settings;
create policy notification_settings_manage on public.notification_settings
for all to authenticated using (
  public.is_super_admin()
  or (public.current_profile_role() = 'ADMIN' and admin_id = auth.uid())
) with check (
  public.is_super_admin()
  or (public.current_profile_role() = 'ADMIN' and admin_id = auth.uid())
);

drop policy if exists message_templates_read on public.message_templates;
create policy message_templates_read on public.message_templates
for select to authenticated using (
  public.is_super_admin()
  or (public.is_admin() and (admin_id is null or admin_id = auth.uid()))
);

drop policy if exists message_templates_manage on public.message_templates;
create policy message_templates_manage on public.message_templates
for all to authenticated using (
  public.is_super_admin()
  or (public.current_profile_role() = 'ADMIN' and admin_id = auth.uid())
)
with check (
  public.is_super_admin()
  or (public.current_profile_role() = 'ADMIN' and admin_id = auth.uid())
);

drop policy if exists message_history_read on public.message_history;
create policy message_history_read on public.message_history
for select to authenticated using (
  public.is_super_admin()
  or (public.is_admin() and admin_id = auth.uid())
  or (farmer_id = auth.uid())
);

drop policy if exists message_history_insert on public.message_history;
create policy message_history_insert on public.message_history
for insert to authenticated with check (false);
