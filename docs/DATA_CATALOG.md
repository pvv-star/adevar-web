# Data Catalog (Sprint 3)

## Inflation
- slug: `inflation`
- source_name: Biroul Național de Statistică (BNS)
- source_url: https://statistica.gov.md/
- methodology: IPC annual
- frequency: annual
- coverage: 2018-2025
- unit: %
- official: true

## Gas
- slug: `gas`
- source_name: ANRE Moldova
- source_url: https://www.anre.md/
- methodology: regulated tariff snapshots / official tariff decisions
- frequency: irregular (on tariff change)
- coverage: TODO
- unit: MDL/m3
- official: true

## Electricity
- slug: `electricity`
- source_name: ANRE Moldova
- source_url: https://www.anre.md/
- methodology: regulated electricity tariff decisions
- frequency: irregular (on tariff change)
- coverage: TODO
- unit: MDL/kWh
- official: true

## Salary
- slug: `salary`
- source_name: Biroul Național de Statistică (BNS)
- source_url: https://statistica.gov.md/
- methodology: average gross monthly earnings
- frequency: monthly / quarterly aggregation
- coverage: TODO
- unit: MDL
- official: true

## Remittances
- slug: `remittances`
- source_name: National Bank of Moldova (BNM)
- source_url: https://www.bnm.md/
- methodology: personal transfers / remittance statistics
- frequency: monthly / quarterly
- coverage: TODO
- unit: mln USD
- official: true

## Unemployment
- slug: `unemployment`
- source_name: World Bank Open Data (modeled ILO estimate)
- source_url: https://api.worldbank.org/v2/country/MDA/indicator/SL.UEM.TOTL.ZS?format=json&per_page=100
- methodology: Total unemployment (% of total labor force), modeled ILO estimate
- frequency: annual
- coverage: 2014-2025
- unit: %
- official: false

## Births by Sex (Demography)
- slug: `births-sex`
- source_name: National Bureau of Statistics of the Republic of Moldova (StatBank)
- source_url: https://statbank.statistica.md/PxWeb/api/v1/en/20%20Populatia%20si%20procesele%20demografice/POP030/POP030100.px
- methodology: Live-births, whole country, grouped by sex (Male/Female)
- frequency: annual
- coverage: 2015-2024 (last 10 available years)
- unit: live births (count)
- official: true
