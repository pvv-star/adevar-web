# StatBank PxWeb API — Table Map

Base URL: `https://statbank.statistica.md/PxWeb/api/v1/ro/`

## Root Categories

| ID | Text |
|---|---|
| `10` | Mediul inconjurător (Environment) |
| `20` | Populația și procesele demografice (Population & Demographics) |
| `30` | Statistica socială (Social Statistics) |
| `40` | Statistica economică (Economic Statistics) |
| `50` | Statistica gender (Gender Statistics) |
| `60` | Statistica regională (Regional Statistics) |

## Indicator Table Paths

### GDP (PIB)

**Table**: `CNT210066.px` — PIB și VAB pe activități economice, 2014-2024
**Path**: `40 Statistica economica/13 CNT/CNT210/Resurse/CNT210066.px`
**Variables**:
- `Activitati economice`: `"0"` = PIB total, `"2"` = VAB total, plus NACE Rev.2 sectors (A-T)
- `Preturi`: `"1"` = curente, `"2"` = comparabile
- `Ani` (TIME): 2014-2024

**Query for total GDP, current prices**:
```json
{"query":[{"code":"Activitati economice","selection":{"filter":"item","values":["0"]}},{"code":"Preturi","selection":{"filter":"item","values":["1"]}}],"response":{"format":"json-stat2"}}
```

### Macro Indicators

**Table**: `CNT208100.px` — Dinamica principalilor indicatori macroeconomici, 2014-2024
**Path**: `40 Statistica economica/13 CNT/CNT208/CNT208100.px`
**Variables**:
- `Indicatori`: `"01"` PIB lei, `"02"` PIB USD, `"06"` real GDP growth %, `"19"` CPI annual %, `"20"` population (thousands), `"21"` exchange rate USD
- `Ani` (TIME): 2014-2024

### CPI (annual)

**Table**: `PRE010200.px` — IPC, decembrie anul precedent=100, 1991-2025
**Path**: `40 Statistica economica/05 PRE/PRE010/serii anuale/PRE010200.px`
**Variables**:
- `Grupe majore` (elimination): `"0"` = Total, `"1"` = alimentare, `"2"` = nealimentare, `"3"` = servicii
- `Ani` (TIME): 1991-2025

### Industrial Production

**Table**: `IND010100.px` — Indicii volumului producției industriale, anul precedent=100, 2011-2025
**Path**: `40 Statistica economica/14 IND/IND010/serii anuale/IND010100.px`
**Variables**:
- `Activitati economice` (elimination): `"0"` = Industrie total, `"B"` = Extractivă, `"C"` = Prelucrătoare, `"D"` = Energie
- `Ani` (TIME): 2011-2025

### Salary

**Table**: `SAL010100.px` — Câștigul salarial mediu lunar, 2013-2024
**Path**: `30 Statistica sociala/03 FM/SAL010/serii anuale/SAL010100.px`
**Variables**:
- `Activitati economice` (elimination): `"0"` = Total
- `Sector` (elimination): `"0"` = Total economie
- `Indicatori`: `"0"` = brut, `"1"` = net
- `Sexe` (elimination): `"0"` = Ambele sexe
- `Ani` (TIME): 2013-2024

### Unemployment

**Table**: `MUN160100.px` — Rata șomajului, 2019-2025
**Path**: `30 Statistica sociala/03 FM/03 MUN/MUN060/MUN160100.px`
**Variables**:
- `Sexe` (elimination): `"0"` = Ambele sexe
- `Medii` (elimination): `"0"` = Total pe țară
- `Trimestre` (elimination): `"0"` = Media anuală
- `Ani` (TIME): 2019-2025

### Foreign Trade

**Table**: `EXT010100.px` — Comerțul exterior pe grupe de țări, 1997-2024
**Path**: `40 Statistica economica/21 EXT/EXT010/serii anuale/EXT010100.px`
**Variables**:
- `Indicatori`: `"0"` = Export, `"1"` = Import, `"2"` = Balanța comercială
- `Grupe de tari` (elimination): `"0"` = Total
- `Ani` (TIME): 1997-2024

### Agriculture

**Table**: `AGR010100.px` — Producția globală agricolă, 1990-2024
**Path**: `40 Statistica economica/16 AGR/AGR010/AGR010100.px`
**Variables**:
- `Ramuri ale agriculturii`: `"0"` = Total, `"1"` = Vegetală, `"2"` = Animalieră
- `Categorii de gospodarii` (elimination): `"0"` = Toate categoriile
- `Unitatea de masura`: `"0"` = Milioane lei, `"1"` = % față de an precedent
- `Ani` (TIME): 1990-2024

### Retail Turnover

**Table**: `COM013300.px` — Cifra de afaceri în comerțul cu amănuntul, 2014-2022
**Path**: `40 Statistica economica/22 COM/COM010/serii lunare/COM013300.px`
**Variables**:
- `Unitatea de masura`: `"0"` = Milioane lei
- `Luni`: `"1"`-`"12"`
- `Ani` (TIME): 2014-2022

Note: For annual totals, all months must be fetched and summed.

### Population

**Table**: `POP010100rcl.px` — Populația cu reședință obișnuită, la începutul anului, 2014-2025
**Path**: `20 Populatia si procesele demografice/POP010/POPro/POP010100rcl.px`
**Variables**:
- `Medii` (elimination): `"0"` = Total pe țară
- `Sexe` (elimination): `"0"` = Total
- `Ani` (TIME): 2014-2025

## PxWeb POST Query Format

```json
{
  "query": [
    {
      "code": "<variable_code>",
      "selection": {
        "filter": "item",
        "values": ["value1", "value2"]
      }
    }
  ],
  "response": {
    "format": "json-stat2"
  }
}
```

- GET a `.px` endpoint → returns table metadata (variables, values, dimensions)
- POST a `.px` endpoint → returns data in the requested format
- Variables with `elimination: true` can be omitted to get default totals
- Time variable: use `"filter": "all", "values": ["*"]` for all periods
