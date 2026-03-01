-- News pipeline schema (long-term, idempotent)
create table if not exists news_sources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  site_url text not null,
  rss_url text,
  language text,
  priority text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  source_slug text not null,
  title text not null,
  summary text,
  url text not null,
  canonical_url text not null,
  url_hash text not null,
  title_hash text not null,
  published_at timestamptz,
  language text,
  impact_score numeric(6,2) not null default 0,
  duplicate_group text,
  seen_sources text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(url_hash)
);

create index if not exists idx_news_items_published_at on news_items(published_at desc);
create index if not exists idx_news_items_impact on news_items(impact_score desc);
create index if not exists idx_news_items_group on news_items(duplicate_group);

create table if not exists news_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  fetched_count int not null default 0,
  inserted_count int not null default 0,
  deduped_count int not null default 0,
  error_count int not null default 0,
  details jsonb
);

create table if not exists news_errors (
  id uuid primary key default gen_random_uuid(),
  source_slug text,
  stage text not null,
  error text not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  count int not null default 1
);
