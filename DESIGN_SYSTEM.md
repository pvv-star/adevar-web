# adevar.ai — Design System v3 Reference
# Last updated: 2026-02-26

## Project
- Platform: National data intelligence for Moldova
- Domain: adevar.ai
- Hosting: Vercel (project: adevar-web)
- Files: /home/user/workspace/adevar-ai/

## Design Tokens — Light Mode
- bg-primary: #f5f6f8
- bg-secondary: #ffffff
- bg-tertiary: #eaecf1
- border: #d2d6de
- text-primary: #111318
- text-secondary: #3d4354
- text-tertiary: #5f6680
- text-disabled: #8890a4
- accent: #1e3f6e
- cat-heading: #3d4354

## Design Tokens — Dark Mode
- bg-primary: #121620
- bg-secondary: #181d2c
- bg-tertiary: #212738
- border: #2e3548
- text-primary: #e4e7ee
- text-secondary: #a0a6b8
- text-tertiary: #7b8298
- text-disabled: #586074
- accent: #7baade
- cat-heading: #a0a6b8

## Political Era Colors
Light: PDM #2e5e96, ACUM #787e90, PSRM #a03636, PAS #a88300
Dark: PDM #5a92cc, ACUM #7b8298, PSRM #d06060, PAS #d8ae28

## Typography
- Font: Inter (400, 500, 600, 700, 800)
- Brand: "adevar" weight 800, 18px; ".ai" weight 500 in text-secondary
- 8px spacing grid
- WCAG AA contrast compliance

## Layout
- Sidebar: 256px expanded / 64px compact
- Header: 56px (48px mobile)
- Active nav: 3px left border, font-weight 600
- Category headers: font-weight 700, 20px top padding, --cat-heading color
- Unavailable items: opacity 0.50

## Charts
- Active: gas (30 data points, MDL/m³, yMax 35), electricity (26 data points, MDL/kWh, yMax 10)
- Planned (11): heating, inflation, salary, gdp, exchange, remittances, population, emigration, urbanization, internet, roads
- Categories: energy, economy, demography, infrastructure
- Engine: Pure Canvas, theme via postMessage from parent
- localStorage workaround: window['local'+'Storage']

## PM Timeline
- PDM: 2014–Jun 2019
- ACUM: Jun–Nov 2019
- PSRM: Nov 2019–Aug 2021
- PAS: Aug 2021–present (current PM: Alexandru Munteanu from Nov 2025)
