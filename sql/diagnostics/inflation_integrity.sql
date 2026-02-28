-- Inflation integrity diagnostics for Supabase/Postgres
-- Run in Supabase SQL editor

-- 1) Find inflation indicator row
select id, slug, name
from indicators
where slug = 'inflation'
   or lower(name) like '%inflation%';

-- 2) Show inflation values by relational join (most reliable)
select iv.year, iv.value, i.slug, i.name
from indicator_values iv
join indicators i on i.id = iv.indicator_id
where i.slug = 'inflation'
order by iv.year;

-- 3) Detect orphan rows (indicator_values without matching indicator)
select iv.indicator_id, count(*) as rows_count
from indicator_values iv
left join indicators i on i.id = iv.indicator_id
where i.id is null
group by iv.indicator_id
order by rows_count desc;

-- 4) Detect duplicate years for same indicator
select indicator_id, year, count(*) as cnt
from indicator_values
group by indicator_id, year
having count(*) > 1
order by cnt desc, year asc;

-- 5) Missing years 2018..current for inflation
with years as (
  select generate_series(2018, extract(year from now())::int) as y
), inflation as (
  select iv.year
  from indicator_values iv
  join indicators i on i.id = iv.indicator_id
  where i.slug = 'inflation'
)
select y as missing_year
from years
where y not in (select year from inflation)
order by y;
