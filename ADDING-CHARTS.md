# Adding a New Chart to adevar.ai

## End-to-End Example: How `inflation` Works

```
data/charts/inflation.json    → Raw data + config + i18n + events
lib/charts.js CHARTS[]        → Catalog entry (id, file, icon, category, translations)
lib/charts.js CHART_DESCS{}   → SEO/search description (ro/en/ru)
lib/charts.js DATA_LOADERS{}  → Dynamic import for code-splitting
```

**Automatic from there:**
- `generateStaticParams()` in `app/chart/[id]/page.js` picks it up → SSG route `/chart/inflation`
- `getActiveCharts()` includes it in dashboard KPI grid
- `getDashboardStats()` computes value/change/direction for the KPI card
- Sidebar renders it under its category
- Sitemap includes it
- Search modal indexes it

---

## Files to Touch

| # | File | Action |
|---|------|--------|
| 1 | `data/charts/{id}.json` | **Create** — chart data, config, i18n, events |
| 2 | `lib/charts.js` → `CHARTS[]` | **Add entry** — id, file, icon, category, ro/en/ru |
| 3 | `lib/charts.js` → `CHART_DESCS{}` | **Add entry** — ro/en/ru descriptions for search/SEO |
| 4 | `lib/charts.js` → `DATA_LOADERS{}` | **Add entry** — dynamic import for the JSON file |
| 5 | *(Optional)* Supabase `indicators` table | **Insert row** — if you want live API data instead of just JSON |

That's it. Everything else is automatic:
- `generateStaticParams()` reads `CHARTS` → new route created at build
- `getActiveCharts()` filters by `file && !soon && !special` → appears on dashboard
- Sidebar groups by `category` → appears in correct section
- Sitemap filters by `!special && !soon` → included in SEO
- Search modal searches across `CHARTS` + `CHART_DESCS` → findable

---

## JSON Data Format

### Minimal Example (single series)

```json
{
  "config": {
    "unit": "%",
    "yMax": 40,
    "gridSteps": 8,
    "decimals": 1,
    "data": [
      { "label": "Q1 2018", "value": 5.0, "era": "PDM", "pm": "Pavel Filip" },
      { "label": "Q2 2018", "value": 5.2, "era": "PDM", "pm": "Pavel Filip" }
    ],
    "stats": {
      "current": 5.2,
      "lowest": 5.0,
      "peak": 5.2,
      "change": "+0.2 p.p."
    },
    "events": [],
    "i18n": {
      "ro": {
        "title": "Titlul Graficului",
        "subtitle": "Descriere scurtă a datelor",
        "current": "Actual",
        "lowest": "Minim",
        "peak": "Vârf",
        "change": "Variație"
      },
      "en": {
        "title": "Chart Title",
        "subtitle": "Short data description",
        "current": "Current",
        "lowest": "Lowest",
        "peak": "Peak",
        "change": "Change"
      },
      "ru": {
        "title": "Название графика",
        "subtitle": "Краткое описание данных",
        "current": "Текущий",
        "lowest": "Минимум",
        "peak": "Максимум",
        "change": "Изменение"
      }
    }
  },
  "eras": {
    "PDM": { "name": "PDM" },
    "PAS": { "name": "PAS" }
  }
}
```

### Field Reference

#### `config` (required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `unit` | string | Yes | Display unit: `"%"`, `"MDL"`, `"births"`, `"mln USD"` |
| `yMax` | number | Yes | Y-axis maximum. Pick ~20% above your highest value |
| `gridSteps` | number | Yes | Horizontal grid line count. 6-10 works well |
| `decimals` | number | Yes | Decimal places for values. 0 for integers, 1-2 for rates |
| `timeRange` | string | No | Display label like `"2014 — 2026"` |
| `data` | array | Yes | Data points (see below) |
| `stats` | object | Yes | KPI summary (see below) |
| `events` | array | No | Milestone annotations (see below). Use `[]` if none |
| `i18n` | object | Yes | Translations for `ro`, `en`, `ru` (see below) |

#### `config.data[]` (each data point)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | X-axis label: `"Q1 2024"`, `"2024"`, `"Jan 2024"` |
| `value` | number | Yes | Primary series value |
| `value2` | number | No | Secondary series (for dual-line charts like births-sex) |
| `era` | string | Yes | Political era code matching an `eras` key |
| `pm` | string | No | Prime minister name (shown in tooltip) |

#### `config.stats`

| Field | Type | Description |
|-------|------|-------------|
| `current` | number | Latest value in the series |
| `lowest` | number | Minimum value |
| `peak` | number | Maximum value |
| `change` | string | Formatted change: `"+136%"`, `"-0.2 p.p."`, `"+4,200 MDL"` |

#### `config.events[]` (optional milestones)

```json
{
  "idx": 0,
  "ro": "2014: IPC ~5%, în intervalul țintit de BNM",
  "en": "CPI ~5%, within NBM target range",
  "ru": "ИПЦ ~5%, в целевом коридоре НБМ"
}
```

`idx` maps to the index in `config.data[]`.

#### `config.i18n` (required, all three languages)

| Key | Required | Description |
|-----|----------|-------------|
| `title` | Yes | Chart page heading |
| `subtitle` | Yes | Chart page subheading |
| `current` | Yes | Label for current stat card |
| `lowest` | Yes | Label for lowest stat card |
| `peak` | Yes | Label for peak stat card |
| `change` | Yes | Label for change stat card |
| `events` | No | Section header for events |
| `replay` | No | Replay button label |
| `boys` / `series1` | No | Primary series legend (multi-series only) |
| `girls` / `series2` | No | Secondary series legend (multi-series only) |

#### `eras` (required)

Map of era codes to display names. Must include every `era` value used in `data[]`.

```json
{
  "PDM": { "name": "PDM" },
  "ACUM": { "name": "ACUM" },
  "PSRM": { "name": "PSRM" },
  "PAS": { "name": "PAS" }
}
```

Era colors come from CSS variables: `--pdm`, `--acum`, `--psrm`, `--pas`. New eras need a CSS variable in `globals.css`.

---

## Catalog Entry Format

In `lib/charts.js`, add to the `CHARTS` array under the correct category section:

```js
{ id: 'heating', file: 'heating.json', icon: '🔥', category: 'energy',
  ro: 'Tariful la Energia Termică', en: 'Thermal Energy Tariff', ru: 'Тариф на тепловую энергию' },
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | URL slug: `/chart/{id}`. Lowercase, hyphens allowed |
| `file` | string | Yes | JSON filename in `data/charts/`. Set `null` for special views |
| `icon` | string | Yes | Emoji shown in sidebar and cards |
| `category` | string | Yes | One of: `energy`, `economy`, `demography`, `infrastructure` |
| `soon` | boolean | No | `true` = coming soon placeholder (no data needed) |
| `special` | string | No | `'dashboard'` or `'about'` for non-chart views |
| `ro` | string | Yes | Romanian display name |
| `en` | string | Yes | English display name |
| `ru` | string | Yes | Russian display name |

Then add to `CHART_DESCS`:

```js
heating: {
  ro: 'Costul mediu pentru energia termică livrată consumatorilor.',
  en: 'Average cost of thermal energy supplied to consumers.',
  ru: 'Средняя стоимость тепловой энергии, поставляемой потребителям.',
},
```

And add to `DATA_LOADERS`:

```js
heating: () => import('@/data/charts/heating.json'),
```

---

## Supabase (Optional — for Live API Data)

If you want the dashboard KPI to pull live data from Supabase instead of just the static JSON:

1. **Insert indicator row:**
   ```sql
   INSERT INTO indicators (slug, name, unit, source_name, source_url, is_official)
   VALUES ('heating', 'Thermal Energy Tariff', 'MDL/Gcal', 'ANRE', 'https://anre.md', true);
   ```

2. **Insert values:**
   ```sql
   INSERT INTO indicator_values (indicator_id, year, value)
   VALUES ('<indicator-uuid>', 2024, 1850.00);
   ```

   Or use the ingestion API:
   ```bash
   curl -X POST https://adevar.ai/api/ingest/indicator-value \
     -H "Content-Type: application/json" \
     -H "x-ingest-token: $INGEST_API_TOKEN" \
     -d '{
       "slug": "heating",
       "year": 2024,
       "value": 1850.00,
       "reason": "ANRE decision 2024",
       "changedBy": "your@email.com"
     }'
   ```

Without Supabase data, the dashboard falls back to the static JSON automatically.

---

## Converting a "Coming Soon" Chart to Live

If the chart already exists in `CHARTS` with `soon: true`:

1. Remove `soon: true` from the catalog entry
2. Add `file: 'your-chart.json'`
3. Create the JSON data file
4. Add the dynamic import to `DATA_LOADERS`
5. Add description to `CHART_DESCS`
6. Run `npm run build` to verify

---

## Checklist

```
□ 1. Create data/charts/{id}.json
      □ config.unit, yMax, gridSteps, decimals
      □ config.data[] with label, value, era for each point
      □ config.stats with current, lowest, peak, change
      □ config.i18n with ro, en, ru (title, subtitle, current, lowest, peak, change)
      □ eras object matching all era codes used in data[]

□ 2. lib/charts.js — CHARTS array
      □ Add entry with id, file, icon, category, ro, en, ru
      □ Remove soon: true if converting from coming-soon

□ 3. lib/charts.js — CHART_DESCS
      □ Add ro, en, ru descriptions

□ 4. lib/charts.js — DATA_LOADERS
      □ Add dynamic import: id: () => import('@/data/charts/{id}.json')

□ 5. Verify
      □ npm run build — no errors
      □ Check /chart/{id} page renders
      □ Check dashboard shows KPI card
      □ Check sidebar shows new item under correct category
      □ Check search modal finds the new chart

□ 6. (Optional) Supabase
      □ Insert row in indicators table
      □ Insert initial values in indicator_values table
```
