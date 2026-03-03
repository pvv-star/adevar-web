# Chart Reviewer Agent

Reviews chart pages for i18n completeness, accessibility, dark mode support, and ShareButtons integration.

## When to Use

Run this agent when adding or modifying chart pages, updating styles, or changing the chart rendering pipeline.

## Tasks

1. **i18n completeness**: Check that every chart in `lib/charts.js` CHARTS array has `ro`, `en`, and `ru` title fields. Verify that all user-facing strings in chart components use `t()` from `useLang()` — no hardcoded Romanian/English text.

2. **Accessibility audit**:
   - Chart pages must have an `<h1>` with the chart title
   - Canvas elements should have a screen-reader-only data table (`.sr-only`) as fallback
   - All buttons must have `type="button"` and accessible labels (`title` or `aria-label`)
   - Check color contrast of chart UI elements against both light and dark themes

3. **Dark mode support**: Verify that chart components read `theme` from `useTheme()` and pass it to `initChart()`. Check `globals.css` for any hardcoded colors in chart-related classes that don't use CSS custom properties (`var(--*)`).

4. **ShareButtons integration**: For each chart page, verify:
   - `ShareButtons` is rendered with `chartId`, `title`, and `chartRef` props
   - The parent container has `position: relative` (required for absolute positioning)
   - `chartRef` is created with `useRef(null)` and passed to both `ShareButtons` and `ChartCanvas`

5. **SSG compatibility**: Confirm chart pages use `export const dynamic = 'force-static'` and that `generateStaticParams` includes all non-special charts. Verify no client-side data fetching at page level.

## Output

For each chart page, report:
- i18n: PASS/FAIL (list missing translations)
- a11y: PASS/WARN/FAIL (list issues)
- Dark mode: PASS/FAIL (list hardcoded colors)
- ShareButtons: PASS/FAIL (list missing pieces)
- SSG: PASS/FAIL

## Tools

Use Glob to find chart components, Read to inspect them, and Grep to search for patterns like hardcoded colors, missing `t()` calls, or absent props.
