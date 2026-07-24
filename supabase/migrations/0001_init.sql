-- =========================
-- UporBlock initial schema
-- =========================

create extension if not exists pgcrypto;

-- =========================
-- Enums
-- =========================

create type public.task_status as enum (
  'incomplete',
  'warning',
  'blocked',
  'completed'
);

create type public.block_mode as enum (
  'reminder_only',
  'block_after_threshold'
);

create type public.pattern_type as enum (
  'domain',
  'url_prefix',
  'wildcard',
  'regex'
);

create type public.platform_type as enum (
  'youtube',
  'instagram',
  'tiktok',
  'other'
);

create type public.verified_method as enum (
  'youtube_api',
  'manual',
  'none'
);

-- =========================
-- Helper updated_at
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- Profiles
-- =========================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  timezone text not null default 'Asia/Jakarta',
  daily_reset_time time not null default '04:00',

  distraction_threshold_minutes integer not null default 30
    check (distraction_threshold_minutes >= 1),

  upload_validity_hours integer not null default 3
    check (upload_validity_hours >= 1),

  idle_timeout_minutes integer not null default 2
    check (idle_timeout_minutes >= 1),

  block_mode public.block_mode not null default 'block_after_threshold',

  manual_verification_allowed boolean not null default true,
  strict_youtube_only boolean not null default false,

  require_shorts boolean not null default false,
  max_shorts_duration_seconds integer null default 180,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================
-- Blocked sites
-- =========================

create table public.blocked_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  label text not null,
  pattern text not null,
  pattern_type public.pattern_type not null default 'wildcard',

  is_active boolean not null default true,
  priority integer not null default 10,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint blocked_sites_pattern_not_empty
    check (btrim(pattern) <> '')
);

create index blocked_sites_user_active_idx
on public.blocked_sites(user_id, is_active);

create trigger set_updated_at
before update on public.blocked_sites
for each row
execute function public.set_updated_at();

-- =========================
-- Upload allowlists
-- =========================

create table public.upload_allowlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  label text not null,
  pattern text not null,
  pattern_type public.pattern_type not null default 'wildcard',

  is_active boolean not null default true,
  priority integer not null default 120,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint upload_allowlists_pattern_not_empty
    check (btrim(pattern) <> '')
);

create index upload_allowlists_user_active_idx
on public.upload_allowlists(user_id, is_active);

create trigger set_updated_at
before update on public.upload_allowlists
for each row
execute function public.set_updated_at();

-- =========================
-- Daily tasks
-- =========================

create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  task_date date not null,
  status public.task_status not null default 'incomplete',

  distraction_seconds integer not null default 0
    check (distraction_seconds >= 0),

  block_active boolean not null default false,

  threshold_reached_at timestamptz null,
  completed_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint daily_tasks_user_date_unique
    unique (user_id, task_date)
);

create index daily_tasks_user_date_idx
on public.daily_tasks(user_id, task_date desc);

create trigger set_updated_at
before update on public.daily_tasks
for each row
execute function public.set_updated_at();

-- =========================
-- Distraction events
-- =========================

create table public.distraction_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  task_date date not null,
  client_event_id text not null default gen_random_uuid()::text,

  host text not null,
  url_normalized text null,
  pattern_matched text null,

  started_at timestamptz not null,
  ended_at timestamptz not null,

  duration_seconds integer not null
    check (duration_seconds > 0),

  created_at timestamptz not null default now(),

  constraint distraction_events_user_client_event_unique
    unique (user_id, client_event_id),

  constraint distraction_events_time_range_check
    check (ended_at >= started_at)
);

create index distraction_events_user_date_idx
on public.distraction_events(user_id, task_date, started_at desc);

-- =========================
-- Video submissions
-- =========================

create table public.video_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  task_date date not null,
  daily_task_id uuid null references public.daily_tasks(id) on delete set null,

  platform public.platform_type not null,

  original_url text not null,
  normalized_url text not null,
  external_video_id text null,

  title text null,
  privacy_status text null,
  duration_seconds integer null,

  published_at timestamptz null,
  verified_at timestamptz null,
  verified_method public.verified_method not null default 'none',

  is_valid boolean not null default false,
  rejection_reason text null,

  raw_metadata jsonb null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint video_submissions_original_url_not_empty
    check (btrim(original_url) <> ''),

  constraint video_submissions_normalized_url_not_empty
    check (btrim(normalized_url) <> '')
);

-- Satu hari hanya satu submission valid
create unique index video_submissions_unique_valid_per_day
on public.video_submissions(user_id, task_date)
where is_valid = true;

-- Cegah video YouTube/platform yang sama dipakai ulang
create unique index video_submissions_unique_external_video
on public.video_submissions(user_id, platform, external_video_id)
where external_video_id is not null;

-- Untuk manual submission tanpa external id
create unique index video_submissions_unique_normalized_url
on public.video_submissions(user_id, normalized_url)
where external_video_id is null;

create index video_submissions_user_task_idx
on public.video_submissions(user_id, task_date desc);

create trigger set_updated_at
before update on public.video_submissions
for each row
execute function public.set_updated_at();

-- =========================
-- Extension pairing codes
-- =========================

create table public.extension_pairing_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  code_hash text not null unique,

  expires_at timestamptz not null,
  used_at timestamptz null,

  created_at timestamptz not null default now()
);

create index extension_pairing_codes_user_idx
on public.extension_pairing_codes(user_id);

-- =========================
-- Extension tokens
-- =========================

create table public.extension_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null default 'Desktop Extension',
  token_hash text not null unique,

  last_used_at timestamptz null,
  expires_at timestamptz null,
  revoked_at timestamptz null,

  created_at timestamptz not null default now()
);

create index extension_tokens_user_idx
on public.extension_tokens(user_id);

-- =========================
-- Function: task date helpers
-- =========================

create or replace function public.task_date_for_timestamp(
  p_user_id uuid,
  p_ts timestamptz
)
returns date
language sql
stable
as $$
  with p as (
    select
      coalesce(pr.timezone, 'UTC') as tz,
      coalesce(pr.daily_reset_time, '04:00'::time) as reset_time
    from (values (1)) as x
    left join public.profiles pr on pr.id = p_user_id
  ), local as (
    select
      (p_ts at time zone p.tz) as local_ts,
      p.reset_time
    from p
  )
  select
    case
      when local_ts::time < reset_time
        then (local_ts::date - interval '1 day')::date
      else local_ts::date
    end
  from local;
$$;

create or replace function public.current_task_date(p_user_id uuid)
returns date
language sql
stable
as $$
  select public.task_date_for_timestamp(p_user_id, now());
$$;

-- =========================
-- Function: get or create daily task
-- =========================

create or replace function public.get_or_create_daily_task(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_date date;
  v_id uuid;
begin
  select public.current_task_date(p_user_id) into v_task_date;

  if v_task_date is null then
    v_task_date := (now() at time zone 'UTC')::date;
  end if;

  insert into public.daily_tasks(user_id, task_date)
  values (p_user_id, v_task_date)
  on conflict (user_id, task_date) do nothing;

  select id
  into v_id
  from public.daily_tasks
  where user_id = p_user_id
    and task_date = v_task_date;

  return v_id;
end;
$$;

-- =========================
-- Trigger: create profile on signup
-- =========================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.upload_allowlists(
    user_id,
    label,
    pattern,
    pattern_type,
    priority
  ) values
    (new.id, 'YouTube Studio', 'https://studio.youtube.com/*', 'wildcard', 120),
    (new.id, 'YouTube Upload', 'https://www.youtube.com/upload*', 'wildcard', 120);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================
-- Trigger: apply distraction event
-- =========================

create or replace function public.handle_distraction_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.task_status;
  v_threshold_seconds integer;
  v_block_mode public.block_mode;
  v_total_seconds integer;
begin
  if new.duration_seconds <= 0 then
    return new;
  end if;

  insert into public.daily_tasks(user_id, task_date)
  values (new.user_id, new.task_date)
  on conflict (user_id, task_date) do nothing;

  select status
  into v_status
  from public.daily_tasks
  where user_id = new.user_id
    and task_date = new.task_date;

  if v_status = 'completed' then
    return new;
  end if;

  update public.daily_tasks
  set distraction_seconds = distraction_seconds + new.duration_seconds,
      updated_at = now()
  where user_id = new.user_id
    and task_date = new.task_date
  returning distraction_seconds into v_total_seconds;

  select
    coalesce(distraction_threshold_minutes, 30) * 60,
    coalesce(block_mode, 'block_after_threshold')
  into v_threshold_seconds, v_block_mode
  from public.profiles
  where id = new.user_id;

  if v_total_seconds >= coalesce(v_threshold_seconds, 1800) then
    update public.daily_tasks
    set
      status = case
        when status = 'incomplete' then 'warning'
        else status
      end,
      threshold_reached_at = coalesce(threshold_reached_at, now()),
      block_active = case
        when v_block_mode = 'block_after_threshold' then true
        else block_active
      end,
      updated_at = now()
    where user_id = new.user_id
      and task_date = new.task_date
      and status <> 'completed';
  end if;

  return new;
end;
$$;

create trigger after_distraction_event
after insert on public.distraction_events
for each row
execute function public.handle_distraction_event();

-- =========================
-- Trigger: complete task on valid submission
-- =========================

create or replace function public.handle_valid_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_tasks(user_id, task_date)
  values (new.user_id, new.task_date)
  on conflict (user_id, task_date) do nothing;

  update public.daily_tasks
  set
    status = 'completed',
    completed_at = coalesce(new.verified_at, now()),
    block_active = false,
    updated_at = now()
  where user_id = new.user_id
    and task_date = new.task_date;

  return new;
end;
$$;

create trigger on_valid_submission
after insert or update of is_valid
on public.video_submissions
for each row
when (new.is_valid = true)
execute function public.handle_valid_submission();

-- =========================
-- Row Level Security
-- =========================

alter table public.profiles enable row level security;
alter table public.blocked_sites enable row level security;
alter table public.upload_allowlists enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.distraction_events enable row level security;
alter table public.video_submissions enable row level security;
alter table public.extension_pairing_codes enable row level security;
alter table public.extension_tokens enable row level security;

-- Profiles
create policy select_own_profiles
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy update_own_profiles
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Blocked sites
create policy select_own_blocked_sites
on public.blocked_sites
for select
to authenticated
using (auth.uid() = user_id);

create policy insert_own_blocked_sites
on public.blocked_sites
for insert
to authenticated
with check (auth.uid() = user_id);

create policy update_own_blocked_sites
on public.blocked_sites
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy delete_own_blocked_sites
on public.blocked_sites
for delete
to authenticated
using (auth.uid() = user_id);

-- Upload allowlists
create policy select_own_upload_allowlists
on public.upload_allowlists
for select
to authenticated
using (auth.uid() = user_id);

create policy insert_own_upload_allowlists
on public.upload_allowlists
for insert
to authenticated
with check (auth.uid() = user_id);

create policy update_own_upload_allowlists
on public.upload_allowlists
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy delete_own_upload_allowlists
on public.upload_allowlists
for delete
to authenticated
using (auth.uid() = user_id);

-- Daily tasks
create policy select_own_daily_tasks
on public.daily_tasks
for select
to authenticated
using (auth.uid() = user_id);

create policy insert_own_daily_tasks
on public.daily_tasks
for insert
to authenticated
with check (auth.uid() = user_id);

-- Distraction events
create policy select_own_distraction_events
on public.distraction_events
for select
to authenticated
using (auth.uid() = user_id);

create policy insert_own_distraction_events
on public.distraction_events
for insert
to authenticated
with check (auth.uid() = user_id);

-- Video submissions
create policy select_own_video_submissions
on public.video_submissions
for select
to authenticated
using (auth.uid() = user_id);

-- Client hanya boleh insert submission yang belum valid
create policy insert_own_video_submissions
on public.video_submissions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and is_valid = false
);

-- Extension pairing codes
create policy select_own_extension_pairing_codes
on public.extension_pairing_codes
for select
to authenticated
using (auth.uid() = user_id);

create policy delete_own_extension_pairing_codes
on public.extension_pairing_codes
for delete
to authenticated
using (auth.uid() = user_id);

-- Extension tokens
create policy select_own_extension_tokens
on public.extension_tokens
for select
to authenticated
using (auth.uid() = user_id);

create policy delete_own_extension_tokens
on public.extension_tokens
for delete
to authenticated
using (auth.uid() = user_id);
