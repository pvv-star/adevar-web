# DB Safety Protocol (adevar.ai)

Use this sequence for every production DB change.

## 0) Scope
- Project ref must match env: `wwjnnmorvhychikroleh`
- Environment: production only when explicitly intended.

## 1) Pre-check
Run:
```sql
select id, slug, name from indicators where slug='inflation';
select count(*) as points
from indicator_values iv
join indicators i on i.id=iv.indicator_id
where i.slug='inflation';
```

## 2) Change
- Use migration-style SQL from `sql/migrations/`.
- Avoid ad-hoc destructive SQL.

## 3) Verify
Run:
```sql
select slug, count(*) c from indicators group by slug having count(*) > 1;
select indicator_id, year, count(*) c from indicator_values group by indicator_id, year having count(*) > 1;
```

Expected: no rows.

## 4) API smoke
From terminal:
```bash
ADEVAR_BASE_URL=https://www.adevar.ai node scripts/smoke-indicator-series.mjs inflation 2018 2026
```

Expected: `strategy=join-by-slug`, `count > 0`.

## 5) Log
- Save evidence screenshot/output in daily memory.
- Note exact SQL file used and timestamp.
