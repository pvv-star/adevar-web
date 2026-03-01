// lib/charts.js — Chart catalog and data loading utilities

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
    ro: 'Tariful la Energia Termică', en: 'Thermal Energy Tariff',     ru: 'Тариф на тепловую энергию',
    desc: {
      ro: 'Costul mediu pentru energia termică livrată consumatorilor.',
      en: 'Average cost of thermal energy supplied to consumers.',
      ru: 'Средняя стоимость тепловой энергии, поставляемой потребителям.',
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
  { id: 'gdp',         file: 'gdp.json', icon: '', category: 'economy',
    ro: 'Produsul Intern Brut (PIB)',        en: 'Gross Domestic Product (GDP)',        ru: 'Валовой внутренний продукт (ВВП)',
    desc: {
      ro: 'Evoluția economică a țării, în prețuri curente de piață.',
      en: 'The country\'s economic evolution, in current market prices.',
      ru: 'Экономическое развитие страны в текущих рыночных ценах.',
    }
  },
  { id: 'exchange',    file: 'exchange.json', icon: '', category: 'economy',
    ro: 'Cursul Valutar Oficial', en: 'Official Exchange Rate', ru: 'Официальный обменный курс',
    desc: {
      ro: 'Valoarea Leului Moldovenesc (MDL) față de valute de referință.',
      en: 'Value of the Moldovan Leu (MDL) against reference currencies.',
      ru: 'Стоимость молдавского лея (MDL) по отношению к базовым валютам.',
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
  { id: 'unemployment', file: 'unemployment.json', icon: '', category: 'economy',
    ro: 'Rata Șomajului',                 en: 'Unemployment Rate',          ru: 'Уровень безработицы',
    desc: {
      ro: 'Procentul forței de muncă neîncadrate în muncă.',
      en: 'Percentage of the labor force without work.',
      ru: 'Процент рабочей силы, не имеющей работы.',
    }
  },

  // ── demography ──
  { id: 'births-sex',  file: 'births-sex.json', icon: '', category: 'demography',
    ro: 'Nașteri: Fete vs Băieți', en: 'Births: Girls vs Boys', ru: 'Рождения: девочки и мальчики',
    desc: {
      ro: 'Născuți-vii pe sexe, total țară, ultimii 10 ani disponibili (sursa oficială BNS StatBank).',
      en: 'Live births by sex, whole country, last 10 available years (official NBS StatBank source).',
      ru: 'Живорождения по полу, вся страна, последние 10 доступных лет (официальный источник НБС StatBank).',
    }
  },
  { id: 'population',  file: 'population.json', icon: '', category: 'demography',
    ro: 'Populația cu Reședință Obișnuită',             en: 'Usually Resident Population',            ru: 'Численность постоянного населения',
    desc: {
      ro: 'Numărul estimat al locuitorilor țării la începutul anului.',
      en: 'Estimated number of the country\'s inhabitants at the beginning of the year.',
      ru: 'Оценочная численность жителей страны на начало года.',
    }
  },
  { id: 'emigration',  file: null, icon: '', category: 'demography', soon: true,
    ro: 'Migrația Netă Internațională',             en: 'Net International Migration',            ru: 'Чистая международная миграция',
    desc: {
      ro: 'Diferența dintre numărul de imigranți și emigranți.',
      en: 'The difference between the number of immigrants and emigrants.',
      ru: 'Разница между числом иммигрантов и эмигрантов.',
    }
  },
  { id: 'urbanization', file: null, icon: '', category: 'demography', soon: true,
    ro: 'Rata Populației Urbane',           en: 'Urban Population Rate',          ru: 'Доля городского населения',
    desc: {
      ro: 'Ponderea populației care locuiește în municipii și orașe.',
      en: 'Share of the population living in municipalities and cities.',
      ru: 'Доля населения, проживающего в муниципиях и городах.',
    }
  },

  // ── infrastructure ──
  { id: 'internet',    file: null, icon: '', category: 'infrastructure', soon: true,
    ro: 'Accesul Gospodăriilor la Internet',     en: 'Household Internet Access',       ru: 'Доступ домохозяйств к Интернету',
    desc: {
      ro: 'Ponderea gospodăriilor care dețin acces la rețeaua de internet la domiciliu.',
      en: 'Share of households with internet access at home.',
      ru: 'Доля домохозяйств, имеющих доступ к сети Интернет на дому.',
    }
  },
  { id: 'roads',       file: null, icon: '', category: 'infrastructure', soon: true,
    ro: 'Lungimea Drumurilor Publice',     en: 'Length of Public Roads',          ru: 'Протяженность дорог общего пользования',
    desc: {
      ro: 'Totalul kilometrilor de drumuri de interes național, local și comunal.',
      en: 'Total kilometers of national, local, and communal roads.',
      ru: 'Общая протяженность дорог национального, местного и коммунального значения в километрах.',
    }
  },


];

// Dynamic imports map — each chart's data loaded only when needed
const DATA_LOADERS = {
  gas: () => import('@/data/charts/gas.json'),
  electricity: () => import('@/data/charts/electricity.json'),
  inflation: () => import('@/data/charts/inflation.json'),
  salary: () => import('@/data/charts/salary.json'),
  gdp: () => import('@/data/charts/gdp.json'),
  exchange: () => import('@/data/charts/exchange.json'),
  remittances: () => import('@/data/charts/remittances.json'),
  unemployment: () => import('@/data/charts/unemployment.json'),
  'births-sex': () => import('@/data/charts/births-sex.json'),
  population: () => import('@/data/charts/population.json'),
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

export async function getChartData(id) {
  const loader = DATA_LOADERS[id];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}
