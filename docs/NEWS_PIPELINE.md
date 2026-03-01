# Live Moldova News Pipeline

## One command

```bash
npm run news:pipeline
```

Runs: fetch → normalize → dedupe marker → impact score → upsert to Supabase.

## Sources

Configured in `config/news-sources.json`.

## DB migration

Apply:

- `sql/migrations/20260301_news_pipeline.sql`

## Scheduler (every 2 minutes)

Use cron/CI:

```cron
*/2 * * * * cd /path/to/adevar-web && npm run news:pipeline >> /tmp/adevar-news.log 2>&1
```

## Read APIs

- `GET /api/widgets/live-news` (top impact, 24h)
- `GET /api/news/feed?range=72h&limit=20&cursor=<iso>`

## UX

- Dashboard news widget opens `/news?range=72h`
- Feed supports infinite scroll + fallback load-more.

## Anti-spam

- URL hash uniqueness (`url_hash`)
- Duplicate group marker (`duplicate_group`) for clustering same story across outlets.
