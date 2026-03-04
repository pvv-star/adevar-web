-- Supabase health checks (manual run)

-- 1) Freshness: latest live news item
select
  max(published_at) as latest_news_published_at,
  now() at time zone 'utc' as checked_at_utc,
  extract(epoch from ((now() at time zone 'utc') - max(published_at))) / 3600 as news_lag_hours
from public.news_items;

-- 2) Operational errors in last 24h
select
  count(*) as news_errors_24h
from public.news_errors
where created_at >= now() - interval '24 hours';

-- 3) Failed/partial runs in last 24h
select
  count(*) filter (where status = 'ok') as ok_runs_24h,
  count(*) filter (where status in ('partial','failed')) as bad_runs_24h
from public.news_runs
where coalesce(finished_at, created_at) >= now() - interval '24 hours';

-- 4) P1 registry staleness (>48h)
select
  dataset_id,
  category,
  as_of,
  extract(epoch from (now() - as_of))/3600 as age_hours
from public.p1_dataset_registry
where as_of < now() - interval '48 hours'
order by as_of asc;
