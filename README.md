# Adevăr.md — Moldova Political Data Tracker

A Next.js 14 static site tracking key economic and political indicators for Moldova.

## Tech Stack

- **Next.js 14** (App Router, SSG)
- **React 18**
- **Plain CSS Modules** (no Tailwind)
- **Vanilla JS canvas engine** for charts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
```

Outputs static HTML to `/out/` directory.

## Structure

```
app/          # Next.js App Router pages
components/   # React components
contexts/     # React contexts (lang, theme)
data/charts/  # Chart data JSON files
lib/          # Utilities (engine, i18n, theme, storage)
public/       # Static assets
```

## Charts

19 charts covering: inflation, gas prices, electricity, wages, pensions, GDP, unemployment, and more.

## i18n

Supports Romanian (ro), English (en), Russian (ru).
