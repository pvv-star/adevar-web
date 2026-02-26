// lib/charts.js — Chart catalog and data loading utilities
import gasData from '@/data/charts/gas.json';
import electricityData from '@/data/charts/electricity.json';
import inflationData from '@/data/charts/inflation.json';
import salaryData from '@/data/charts/salary.json';
import remittancesData from '@/data/charts/remittances.json';

export const CATEGORIES = {
  energy:         { ro: 'Energie',        en: 'Energy',          ru: 'Энергетика' },
  economy:        { ro: 'Economie',       en: 'Economy',         ru: 'Экономика' },
  demography:     { ro: 'Demografie',     en: 'Demographics',    ru: 'Демография' },
  infrastructure: { ro: 'Infrastructură', en: 'Infrastructure',  ru: 'Инфраструктură' },
  platform:       { ro: 'Platformă',      en: 'Platform',        ru: 'Платформа' },
};

export const LIVE_STATS = {
  gas: {
    value: '14.42',
    unit: 'MDL/m³',
    change: '+136%',
    dir: 'up',
    date: { ro: 'T1 2026', en: 'Q1 2026', ru: '1кв 2026' },
  },
  electricity: {
    value: '3.59',
    unit: 'MDL/kWh',
    change: '+127%',
    dir: 'up',
    date: { ro: 'T1 2026', en: 'Q1 2026', ru: '1кв 2026' },
  },
  inflation: {
    value: '4.8',
    unit: '%',
    change: '-0.2 p.p.',
    dir: 'down',
    date: { ro: 'Ian 2026', en: 'Jan 2026', ru: 'Янв 2026' },
  },
  salary: {
    value: '15,488',
    unit: 'MDL',
    change: '+322%',
    dir: 'up',
    date: { ro: 'T3 2025', en: 'Q3 2025', ru: '3кв 2025' },
  },
  remittances: {
    value: '462',
    unit: 'mln USD',
    change: '+47%',
    dir: 'up',
    date: { ro: 'T4 2025', en: 'Q4 2025', ru: '4кв 2025' },
  },
};

export const CHARTS = [
  // ── special views ──
  { id: 'dashboard', file: null, icon: '', category: 'platform', special: 'dashboard',
    ro: 'Dashboard',            en: 'Dashboard',              ru: 'Дашборд' },
  { id: 'about',     file: null, icon: '', category: 'platform', special: 'about',
    ro: 'Despre platformă',     en: 'About the Platform',     ru: 'О платформе' },

  // ── energy ──
  { id: 'gas',         file: 'gas.json',         icon: '', category: 'energy',
    ro: 'Gaze Naturale',         en: 'Natural Gas',           ru: 'Природный газ',
    desc: {
      ro: 'Evoluția tarifelor la gaze naturale pentru populație, conform deciziilor ANRE.',
      en: 'Natural gas tariff trends for households, per ANRE regulatory decisions.',
      ru: 'Динамика тарифов на природный газ для населения по решениям ANRE.',
    }
  },
  { id: 'electricity', file: 'electricity.json',  icon: '', category: 'energy',
    ro: 'Electricitate',         en: 'Electricity',           ru: 'Электричество',
    desc: {
      ro: 'Tarifele la energie electrică pentru consumatorii casnici și industriali.',
      en: 'Electricity tariffs for residential and industrial consumers.',
      ru: 'Тарифы на электроэнергию для бытовых и промышленных потребителей.',
    }
  },
  { id: 'heating',     file: null, icon: '', category: 'energy', soon: true,
    ro: 'Încălzire Centralizată', en: 'District Heating',     ru: 'Центральное отопление',
    desc: {
      ro: 'Tariful pentru încălzire centralizată și apă caldă, pe furnizori și perioade.',
      en: 'District heating and hot water tariff trends by provider and period.',
      ru: 'Тариф на центральное отопление и горячую воду по поставщикам и периодам.',
    }
  },

  // ── economy ──
  { id: 'inflation',   file: 'inflation.json', icon: '', category: 'economy',
    ro: 'Inflația',              en: 'Inflation',             ru: 'Инфляция',
    desc: {
      ro: 'Indicele prețurilor de consum (IPC) lunar și anual, conform BNS.',
      en: 'Monthly and annual consumer price index (CPI) as reported by the National Bureau of Statistics.',
      ru: 'Ежемесячный и годовой индекс потребительских цен (ИПЦ) по данным НБС.',
    }
  },
  { id: 'salary',      file: 'salary.json',  icon: '', category: 'economy',
    ro: 'Salariul Mediu',        en: 'Average Salary',        ru: 'Средняя зарплата',
    desc: {
      ro: 'Salariul mediu brut pe economie, pe sectoare și regiuni, conform BNS.',
      en: 'Average gross salary by sector and region, as reported by BNS.',
      ru: 'Средняя брутто-зарплата по отраслям и регионам по данным НБС.',
    }
  },
  { id: 'gdp',         file: null, icon: '', category: 'economy', soon: true,
    ro: 'PIB per Capita',        en: 'GDP per Capita',        ru: 'ВВП на душу населения',
    desc: {
      ro: 'Produsul Intern Brut per locuitor în MDL și USD, evoluție anuală.',
      en: 'GDP per capita in MDL and USD, annual trend.',
      ru: 'ВВП на душу населения в леях и долларах США, ежегодная динамика.',
    }
  },
  { id: 'exchange',    file: null, icon: '', category: 'economy', soon: true,
    ro: 'Cursul Valutar MDL/EUR', en: 'MDL/EUR Exchange Rate', ru: 'Курс MDL/EUR',
    desc: {
      ro: 'Cursul oficial MDL față de EUR și USD, date zilnice de la BNM.',
      en: 'Official MDL exchange rate against EUR and USD, daily data from the National Bank of Moldova.',
      ru: 'Официальный курс молдавского лея к евро и доллару, ежедневные данные НБМ.',
    }
  },
  { id: 'remittances', file: 'remittances.json', icon: '', category: 'economy',
    ro: 'Remitențe',             en: 'Remittances',           ru: 'Денежные переводы',
    desc: {
      ro: 'Volumul remitențelor trimise în Republica Moldova, pe trimestre, conform BNM.',
      en: 'Volume of remittances sent to the Republic of Moldova by quarter, per NBM data.',
      ru: 'Объём денежных переводов в Республику Молдова по кварталам по данным НБМ.',
    }
  },

  // ── demography ──
  { id: 'population',  file: null, icon: '', category: 'demography', soon: true,
    ro: 'Populația',             en: 'Population',            ru: 'Население',
    desc: {
      ro: 'Numărul populației stabile și rezidente pe ani, conform recensămintelor și estimărilor BNS.',
      en: 'Stable and resident population by year, from census data and BNS estimates.',
      ru: 'Численность постоянного и проживающего населения по годам по данным НБС.',
    }
  },
  { id: 'emigration',  file: null, icon: '', category: 'demography', soon: true,
    ro: 'Emigrarea',             en: 'Emigration',            ru: 'Эмиграция',
    desc: {
      ro: 'Numărul cetățenilor emigrați definitiv și temporar, destinații principale.',
      en: 'Number of permanent and temporary emigrants from Moldova and their main destinations.',
      ru: 'Число граждан, выехавших на постоянное и временное жительство за рубеж, основные направления.',
    }
  },
  { id: 'urbanization', file: null, icon: '', category: 'demography', soon: true,
    ro: 'Urbanizarea',           en: 'Urbanization',          ru: 'Урбанизация',
    desc: {
      ro: 'Ponderea populației urbane față de cea rurală, evoluție istorică și prognoze.',
      en: 'Share of urban versus rural population, historical trend and projections.',
      ru: 'Доля городского населения по сравнению с сельским, историческая динамика и прогнозы.',
    }
  },

  // ── infrastructure ──
  { id: 'internet',    file: null, icon: '', category: 'infrastructure', soon: true,
    ro: 'Acces la Internet',     en: 'Internet Access',       ru: 'Доступ к интернету',
    desc: {
      ro: 'Rata de penetrare a internetului în gospodării și pe tipuri de conexiune.',
      en: 'Household internet penetration rate by connection type.',
      ru: 'Уровень проникновения интернета в домохозяйствах по типам соединения.',
    }
  },
  { id: 'roads',       file: null, icon: '', category: 'infrastructure', soon: true,
    ro: 'Starea Drumurilor',     en: 'Road Quality',          ru: 'Состояние дорог',
    desc: {
      ro: 'Starea drumurilor publice naționale și locale pe categorii de calitate.',
      en: 'Condition of national and local public roads by quality category.',
      ru: 'Состояние национальных и местных дорог по категориям качества.',
    }
  },
];

const DATA_MAP = {
  gas: gasData,
  electricity: electricityData,
  inflation: inflationData,
  salary: salaryData,
  remittances: remittancesData,
};

export function getAllCharts() {
  return CHARTS;
}

export function getChartById(id) {
  return CHARTS.find(c => c.id === id) || null;
}

export function getActiveCharts() {
  return CHARTS.filter(c => c.file && !c.soon && !c.special);
}

export function getComingSoonCharts() {
  return CHARTS.filter(c => c.soon);
}

export function getChartData(id) {
  return DATA_MAP[id] || null;
}
