create table if not exists public.p1_dataset_registry (
  dataset_id text primary key,
  category text not null,
  dataset_name text not null,
  source_id text not null,
  source_url text not null,
  frequency text not null,
  geo_level text not null,
  unit_examples text[] not null default '{}',
  owner text not null,
  freshness_sla_hours integer not null,
  quality_gate text not null,
  status text not null,
  manifest_version integer not null default 1,
  as_of timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_p1_dataset_registry_category on public.p1_dataset_registry(category);
create index if not exists idx_p1_dataset_registry_status on public.p1_dataset_registry(status);
