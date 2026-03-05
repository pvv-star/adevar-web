-- Phase 3: User profiles for premium subscriptions
-- Extends Supabase auth.users with tier, stripe, and usage tracking

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  ai_questions_today int not null default 0,
  ai_questions_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: users can only read and update their own profile
alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Service role can do everything (for webhooks, cron, etc.)
create policy "Service role full access"
  on public.profiles for all
  using (auth.role() = 'service_role');
