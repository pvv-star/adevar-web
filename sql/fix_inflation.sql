insert into indicators (slug, name)
select 'inflation', 'Inflation'
where not exists (select 1 from indicators where slug='inflation');

insert into indicator_values (indicator_id, year, value)
select i.id, v.year, v.value
from indicators i
join (values
(2018, 3.0),
(2019, 4.8),
(2020, 3.8),
(2021, 5.1),
(2022, 28.7),
(2023, 13.4)
) v(year, value) on true
where i.slug='inflation'
on conflict (indicator_id, year) do update set value=excluded.value;
