-- Restrict privileged maintenance to the service role and database owner.
-- Do not run cleanup during this migration; no rows are deleted here.
create or replace function public.purge_old_news_errors()
returns integer language plpgsql security definer set search_path = pg_catalog
as $$
declare v_count integer;
begin
  delete from public.news_errors where last_seen < now() - interval '60 days';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.purge_old_news_runs()
returns integer language plpgsql security definer set search_path = pg_catalog
as $$
declare v_count integer;
begin
  delete from public.news_runs where coalesce(finished_at, started_at) < now() - interval '90 days';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.purge_old_news_errors() from public, anon, authenticated;
revoke execute on function public.purge_old_news_runs() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.purge_old_news_errors() to service_role;
grant execute on function public.purge_old_news_runs() to service_role;
