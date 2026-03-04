# Mobile QA Matrix

## Devices / viewports
- iPhone SE (375x667)
- iPhone 14/15 (390x844)
- iPhone 15 Pro Max (430x932)
- Pixel 7 (412x915)
- Small Android (360x800)

## Routes to test
- /
- /news
- /chart/inflation
- /chart/gas

## Checks
1. Bottom nav visible, active state clear, safe-area padding correct
2. Hero + primary CTA visible above fold on home
3. News search + chips readable; no clipping
4. Chart period chips tappable; chart scroll/pan works
5. Source + Updated labels visible on news and chart views
6. No horizontal overflow
7. Toast/skeleton states readable

## Automation hooks
- `npm run smoke:mobile` for status and HTML marker checks
- `npm run preflight` runs smoke + perf/data checks
