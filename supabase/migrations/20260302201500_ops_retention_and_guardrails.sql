-- Ops retention + guardrails

-- Keep news_errors last 60 days
create or replace function public.purge_old_news_errors()
returns integer
language plpgsql
security definer
as $$
declare v_count integer;
begin
  delete from public.news_errors
  where created_at < now() - interval '60 days';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Keep news_runs last 90 days
create or replace function public.purge_old_news_runs()
returns integer
language plpgsql
security definer
as $$
declare v_count integer;
begin
  delete from public.news_runs
  where coalesce(finished_at, created_at) < now() - interval '90 days';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Optional pg_cron schedule (best effort)
do $$
begin
  perform 1 from pg_extension where extname = 'pg_cron';
  if found then
    -- remove old jobs if present
    perform cron.unschedule(jobid) from cron.job where jobname = 'purge_old_news_errors_daily';
    perform cron.unschedule(jobid) from cron.job where jobname = 'purge_old_news_runs_daily';

    perform cron.schedule('purge_old_news_errors_daily', '15 3 * * *', $job$select public.purge_old_news_errors();$job$);
    perform cron.schedule('purge_old_news_runs_daily', '20 3 * * *', $job$select public.purge_old_news_runs();$job$);
  end if;
exception when others then
  -- keep migration non-fatal if cron is unavailable
  raise notice 'pg_cron scheduling skipped: %', sqlerrm;
end $$;

-- Guardrail: statuses limited to known set
alter table public.p1_dataset_registry
  drop constraint if exists p1_dataset_registry_status_check;

alter table public.p1_dataset_registry
  add constraint p1_dataset_registry_status_check
  check (status in ('p1_ready','active_or_planned','planned_ingestion','active','paused','deprecated'));
