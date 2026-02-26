# Migration Notes: Static HTML → Next.js App Router

## Overview

This document describes the migration from the original static HTML/CSS/JS implementation to a Next.js App Router project with static site generation (SSG).

## Architecture Decisions

### 1. Static Export (`output: 'export'`)

The site uses `next build` with `output: 'export'` to generate fully static HTML files. This matches the original static hosting approach while enabling the React component model.

**Why**: The site has no server-side requirements. All data is static JSON. This keeps deployment simple (any static host: GitHub Pages, Netlify, S3, Vercel).

### 2. engine.js Stays Vanilla Canvas

The original `engine.js` chart rendering engine was **not rewritten as React components**. It runs as a vanilla JavaScript canvas engine, called from a `ChartCanvas` React wrapper component.

**Why**:
- The engine is complex, well-tested, and produces exact visual output
- Rewriting to React/D3 would risk visual regressions
- The canvas API doesn't benefit from React's DOM diffing
- Wrapper pattern is clean: React manages lifecycle, engine manages pixels

### 3. Trilingual Support via React Context

Language state is managed via `LangContext`. The `useTranslation()` hook provides `t(key)` for all UI strings.

Translations live in `lib/i18n.js` as a flat key-value map per language (RO/EN/RU).

### 4. Theme via CSS Custom Properties

Light/dark theme is implemented using CSS custom properties on `:root` and `[data-theme="dark"]`. `ThemeContext` manages state and persists to `localStorage`.

**Why not Tailwind**: The original design uses custom CSS. Migrating to Tailwind would require a full visual redesign. CSS custom properties provide the same theming capability with zero migration cost.

### 5. Chart Data as JSON

Chart data was extracted from inline JS objects into `data/charts/*.json` files.

**Benefits**:
- Data is separable from code
- Easy to update via CI/data pipelines
- Next.js can read JSON at build time for SSG

### 6. Static Params for Dynamic Routes

`app/chart/[id]/page.js` uses `generateStaticParams()` to pre-render all chart pages at build time.

Currently generates pages for: `electricity`, `gas`, `inflation`.

## File Structure

```
├── app/
│   ├── globals.css          # All CSS (migrated from style.css)
│   ├── layout.js            # Root layout with metadata
│   ├── page.js              # Home page (redirects to dashboard)
│   ├── ClientLayout.js      # Client-side layout wrapper
│   ├── about/
│   │   └── page.js          # About page
│   └── chart/
│       └── [id]/
│           ├── page.js      # SSG chart page
│           └── ChartPageClient.js  # Client component
├── components/
│   ├── Header.js            # Top navigation bar
│   ├── Sidebar.js           # Desktop sidebar navigation
│   ├── BottomNav.js         # Mobile bottom navigation
│   ├── ChartCanvas.js       # Canvas wrapper for engine.js
│   ├── Dashboard.js         # Main dashboard view
│   ├── AboutContent.js      # About page content
│   ├── ComingSoon.js        # Placeholder for future charts
│   └── StatsBar.js          # Stats summary bar
├── contexts/
│   ├── LangContext.js       # Language state & hook
│   └── ThemeContext.js      # Theme state & hook
├── data/
│   └── charts/
│       ├── electricity.json # Electricity chart data
│       ├── gas.json         # Gas price chart data
│       └── inflation.json   # Inflation chart data
├── lib/
│   ├── i18n.js              # Translation strings (RO/EN/RU)
│   ├── charts.js            # Chart registry & metadata
│   ├── theme.js             # Theme utilities
│   ├── engine.js            # Vanilla canvas chart engine
│   └── storage.js           # localStorage utilities
└── public/
    └── favicon.svg          # Site favicon
```

## What Changed vs Original

| Aspect | Before | After |
|--------|--------|-------|
| Framework | None (static HTML) | Next.js 15 App Router |
| Routing | File-based HTML | Next.js file-based routing |
| Components | None | React components |
| State | Global JS vars | React Context + hooks |
| i18n | Inline JS objects | Centralized `lib/i18n.js` |
| Chart data | Inline in JS | Separate JSON files |
| Theme | CSS class toggle | CSS custom props + Context |
| Build | None | `next build` → static HTML |
| Engine | engine.js (canvas) | engine.js (canvas, unchanged) |

## What Did NOT Change

- Visual design and CSS (ported 1:1)
- Chart rendering logic (engine.js)
- Data structures for charts
- Trilingual content
- All existing chart pages (electricity, gas, inflation)

## Deployment

```bash
npm run build   # Generates /out directory
```

Deploy the `/out` directory to any static host.

## Known Limitations

1. **No ISR**: Static export means no incremental static regeneration. Data updates require a rebuild.
2. **No API Routes**: Static export disables Next.js API routes. If needed, add a separate API server.
3. **Canvas SSR**: `ChartCanvas` is a client component (`'use client'`) because `canvas` requires the browser DOM.
