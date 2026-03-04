// lib/charts.js — Chart catalog and data loading utilities

import categoriesConfig from '@/config/categories-statistica.json';

export const CATEGORY_TAXONOMY = categoriesConfig.categories || [];

export const CATEGORIES = Object.fromEntries(
  CATEGORY_TAXONOMY.map((c) => [c.id, c.label])
);

export const CHARTS = [
  // ── special views ──
  { id: 'dashboard', file: null, icon: '🏠', category: 'platform', special: 'dashboard',
    ro: 'Dashboard',            en: 'Dashboard',              ru: 'Дашборд' },
  { id: 'about',     file: null, icon: 'ℹ️', category: 'platform', special: 'about',
    ro: 'Despre platformă',     en: 'About the Platform',     ru: 'О платформе' },

  // ── energy ──
  { id: 'gas',         file: 'gas.json',         icon: '🔥', category: 'energy',
    ro: 'Gaze Naturale',         en: 'Natural Gas',           ru: 'Природный газ',
    desc: {
      ro: 'Evoluția tarifelor la gaze naturale pentru populație, conform deciziilor ANRE.',
      en: 'Natural gas tariff trends for households, per ANRE regulatory decisions.',
      ru: 'Динамика тарифов на природный газ для населения по решениям ANRE.',
    }
  },
  { id: 'electricity', file: 'electricity.json',  icon: '⚡', category: 'energy',
    ro: 'Electricitate',         en: 'Electricity',           ru: 'Электричество',
    desc: {
      ro: 'Tarifele la energie electrică pentru consumatorii casnici și industriali.',
      en: 'Electricity tariffs for residential and industrial consumers.',
      ru: 'Тарифы на электроэнергию для бытовых и промышленных потребителей.',
    }
  },
  { id: 'heating',     file: null, icon: '♨️', category: 'energy', soon: true,
    ro: 'Tariful la Energia Termică', en: 'Thermal Energy Tariff',     ru: 'Тариф на тепловую энергию',
    desc: {
      ro: 'Costul mediu pentru energia termică livrată consumatorilor.',
      en: 'Average cost of thermal energy supplied to consumers.',
      ru: 'Средняя стоимость тепловой энергии, поставляемой потребителям.',
    }
  },

  // ── economy ──
  { id: 'inflation',   file: 'inflation.json', icon: '📈', category: 'economy',
    ro: 'Inflația',              en: 'Inflation',             ru: 'Инфляция',
    desc: {
      ro: 'Indicele prețurilor de consum (IPC) lunar și anual, conform BNS.',
      en: 'Monthly and annual consumer price index (CPI) as reported by the National Bureau of Statistics.',
      ru: 'Ежемесячный и годовой индекс потребительских цен (ИПЦ) по данным НБС.',
    }
  },
  { id: 'salary',      file: 'salary.json',  icon: '💼', category: 'economy',
    ro: 'Salariul Mediu',        en: 'Average Salary',        ru: 'Средняя зарплата',
    desc: {
      ro: 'Salariul mediu brut pe economie, pe sectoare și regiuni, conform BNS.',
      en: 'Average gross salary by sector and region, as reported by BNS.',
      ru: 'Средняя брутто-зарплата по отраслям и регионам по данным НБС.',
    }
  },
  { id: 'gdp',         file: 'gdp.json', icon: '🏭', category: 'economy',
    ro: 'Produsul Intern Brut (PIB)',        en: 'Gross Domestic Product (GDP)',        ru: 'Валовой внутренний продукт (ВВП)',
    desc: {
      ro: 'Evoluția economică a țării, în prețuri curente de piață.',
      en: 'The country\'s economic evolution, in current market prices.',
      ru: 'Экономическое развитие страны в текущих рыночных ценах.',
    }
  },
  { id: 'exchange',    file: 'exchange.json', icon: '💱', category: 'economy',
    ro: 'Cursul Valutar Oficial', en: 'Official Exchange Rate', ru: 'Официальный обменный курс',
    desc: {
      ro: 'Valoarea Leului Moldovenesc (MDL) față de valute de referință.',
      en: 'Value of the Moldovan Leu (MDL) against reference currencies.',
      ru: 'Стоимость молдавского лея (MDL) по отношению к базовым валютам.',
    }
  },
  { id: 'remittances', file: 'remittances.json', icon: '💸', category: 'economy',
    ro: 'Remitențe',             en: 'Remittances',           ru: 'Денежные переводы',
    desc: {
      ro: 'Volumul remitențelor trimise în Republica Moldova, pe trimestre, conform BNM.',
      en: 'Volume of remittances sent to the Republic of Moldova by quarter, per NBM data.',
      ru: 'Объём денежных переводов в Республику Молдова по кварталам по данным НБМ.',
    }
  },
  { id: 'unemployment', file: 'unemployment.json', icon: '👥', category: 'economy',
    ro: 'Rata Șomajului',                 en: 'Unemployment Rate',          ru: 'Уровень безработицы',
    desc: {
      ro: 'Procentul forței de muncă neîncadrate în muncă.',
      en: 'Percentage of the labor force without work.',
      ru: 'Процент рабочей силы, не имеющей работы.',
    }
  },
  { id: 'statbank-gdp', file: 'statbank-gdp.json', icon: '🏭', category: 'economy',
    ro: 'PIB (prețuri curente)',          en: 'GDP (current prices)',       ru: 'ВВП (текущие цены)',
    desc: {
      ro: 'Produsul Intern Brut în prețuri curente, date anuale de la BNS StatBank.',
      en: 'Gross Domestic Product at current prices, annual data from NBS StatBank.',
      ru: 'Валовой внутренний продукт в текущих ценах, годовые данные НБС StatBank.',
    }
  },
  { id: 'statbank-gdp-growth', file: 'statbank-gdp-growth.json', icon: '📊', category: 'economy',
    ro: 'Creșterea PIB real',             en: 'Real GDP Growth',            ru: 'Рост реального ВВП',
    desc: {
      ro: 'Ritmul de creștere a PIB real, procent față de anul precedent.',
      en: 'Real GDP growth rate, percent change from previous year.',
      ru: 'Темп роста реального ВВП, процент к предыдущему году.',
    }
  },
  { id: 'statbank-industrial-production', file: 'statbank-industrial-production.json', icon: '⚙️', category: 'economy',
    ro: 'Producția industrială',          en: 'Industrial Production',      ru: 'Промышленное производство',
    desc: {
      ro: 'Indicele producției industriale, an precedent = 100.',
      en: 'Industrial production index, previous year = 100.',
      ru: 'Индекс промышленного производства, предыдущий год = 100.',
    }
  },
  { id: 'statbank-salary', file: 'statbank-salary.json', icon: '💰', category: 'economy',
    ro: 'Salariul mediu brut',            en: 'Avg Gross Salary',          ru: 'Средняя зарплата (брутто)',
    desc: {
      ro: 'Salariul mediu lunar brut pe economie, date anuale BNS.',
      en: 'Average monthly gross salary, annual NBS data.',
      ru: 'Средняя месячная заработная плата (брутто), годовые данные НБС.',
    }
  },
  { id: 'statbank-exports', file: 'statbank-exports.json', icon: '📦', category: 'economy',
    ro: 'Exporturi',                      en: 'Exports',                   ru: 'Экспорт',
    desc: {
      ro: 'Volumul total al exporturilor de mărfuri, date anuale BNS.',
      en: 'Total merchandise exports volume, annual NBS data.',
      ru: 'Общий объём экспорта товаров, годовые данные НБС.',
    }
  },
  { id: 'statbank-imports', file: 'statbank-imports.json', icon: '🚢', category: 'economy',
    ro: 'Importuri',                      en: 'Imports',                   ru: 'Импорт',
    desc: {
      ro: 'Volumul total al importurilor de mărfuri, date anuale BNS.',
      en: 'Total merchandise imports volume, annual NBS data.',
      ru: 'Общий объём импорта товаров, годовые данные НБС.',
    }
  },

  // ── prices ──
  { id: 'statbank-cpi', file: 'statbank-cpi.json', icon: '📈', category: 'prices',
    ro: 'IPC total',                      en: 'CPI Total',                 ru: 'ИПЦ общий',
    desc: {
      ro: 'Indicele prețurilor de consum total, decembrie an precedent = 100.',
      en: 'Total consumer price index, December previous year = 100.',
      ru: 'Общий индекс потребительских цен, декабрь предыдущего года = 100.',
    }
  },
  { id: 'statbank-cpi-food', file: 'statbank-cpi-food.json', icon: '🍞', category: 'prices',
    ro: 'IPC alimentare',                 en: 'CPI Food',                  ru: 'ИПЦ продовольствие',
    desc: {
      ro: 'Indicele prețurilor de consum pentru produse alimentare.',
      en: 'Consumer price index for food products.',
      ru: 'Индекс потребительских цен на продовольственные товары.',
    }
  },
  { id: 'statbank-cpi-nonfood', file: 'statbank-cpi-nonfood.json', icon: '🏷️', category: 'prices',
    ro: 'IPC nealimentare',               en: 'CPI Non-food',              ru: 'ИПЦ непродовольственные',
    desc: {
      ro: 'Indicele prețurilor de consum pentru mărfuri nealimentare.',
      en: 'Consumer price index for non-food goods.',
      ru: 'Индекс потребительских цен на непродовольственные товары.',
    }
  },
  { id: 'statbank-cpi-services', file: 'statbank-cpi-services.json', icon: '🔧', category: 'prices',
    ro: 'IPC servicii',                   en: 'CPI Services',              ru: 'ИПЦ услуги',
    desc: {
      ro: 'Indicele prețurilor de consum pentru servicii.',
      en: 'Consumer price index for services.',
      ru: 'Индекс потребительских цен на услуги.',
    }
  },

  // ── demography ──
  { id: 'births-sex',  file: 'births-sex.json', icon: '👶', category: 'demography',
    ro: 'Nașteri: Fete vs Băieți', en: 'Births: Girls vs Boys', ru: 'Рождения: девочки и мальчики',
    desc: {
      ro: 'Născuți-vii pe sexe, total țară, ultimii 10 ani disponibili (sursa oficială BNS StatBank).',
      en: 'Live births by sex, whole country, last 10 available years (official NBS StatBank source).',
      ru: 'Живорождения по полу, вся страна, последние 10 доступных лет (официальный источник НБС StatBank).',
    }
  },
  { id: 'population',  file: 'population.json', icon: '🧭', category: 'demography',
    ro: 'Populația cu Reședință Obișnuită',             en: 'Usually Resident Population',            ru: 'Численность постоянного населения',
    desc: {
      ro: 'Numărul estimat al locuitorilor țării la începutul anului.',
      en: 'Estimated number of the country\'s inhabitants at the beginning of the year.',
      ru: 'Оценочная численность жителей страны на начало года.',
    }
  },
  { id: 'emigration',  file: null, icon: '🛫', category: 'demography', soon: true,
    ro: 'Migrația Netă Internațională',             en: 'Net International Migration',            ru: 'Чистая международная миграция',
    desc: {
      ro: 'Diferența dintre numărul de imigranți și emigranți.',
      en: 'The difference between the number of immigrants and emigrants.',
      ru: 'Разница между числом иммигрантов и эмигрантов.',
    }
  },
  { id: 'urbanization', file: null, icon: '🏙️', category: 'demography', soon: true,
    ro: 'Rata Populației Urbane',           en: 'Urban Population Rate',          ru: 'Доля городского населения',
    desc: {
      ro: 'Ponderea populației care locuiește în municipii și orașe.',
      en: 'Share of the population living in municipalities and cities.',
      ru: 'Доля населения, проживающего в муниципиях и городах.',
    }
  },
  { id: 'statbank-population', file: 'statbank-population.json', icon: '👥', category: 'demography',
    ro: 'Populația',                      en: 'Population',                ru: 'Население',
    desc: {
      ro: 'Populația cu reședință obișnuită, date anuale BNS StatBank.',
      en: 'Resident population, annual NBS StatBank data.',
      ru: 'Население с обычным местом жительства, годовые данные НБС StatBank.',
    }
  },
  { id: 'statbank-unemployment', file: 'statbank-unemployment.json', icon: '📉', category: 'demography',
    ro: 'Rata șomajului',                 en: 'Unemployment Rate',         ru: 'Уровень безработицы',
    desc: {
      ro: 'Rata șomajului, media anuală, sursa BNS StatBank.',
      en: 'Unemployment rate, annual average, NBS StatBank source.',
      ru: 'Уровень безработицы, среднегодовой, данные НБС StatBank.',
    }
  },

  // ── agriculture ──
  { id: 'statbank-agriculture', file: 'statbank-agriculture.json', icon: '🌾', category: 'agriculture',
    ro: 'Producția agricolă',             en: 'Agricultural Production',   ru: 'Сельскохозяйственное производство',
    desc: {
      ro: 'Producția agricolă globală, date anuale BNS StatBank.',
      en: 'Total agricultural production, annual NBS StatBank data.',
      ru: 'Общий объём сельскохозяйственного производства, годовые данные НБС StatBank.',
    }
  },

  // ── infrastructure ──
  { id: 'internet',    file: null, icon: '🌐', category: 'infrastructure', soon: true,
    ro: 'Accesul Gospodăriilor la Internet',     en: 'Household Internet Access',       ru: 'Доступ домохозяйств к Интернету',
    desc: {
      ro: 'Ponderea gospodăriilor care dețin acces la rețeaua de internet la domiciliu.',
      en: 'Share of households with internet access at home.',
      ru: 'Доля домохозяйств, имеющих доступ к сети Интернет на дому.',
    }
  },
  { id: 'roads',       file: null, icon: '🛣️', category: 'infrastructure', soon: true,
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
  'statbank-gdp': () => import('@/data/charts/statbank-gdp.json'),
  'statbank-gdp-growth': () => import('@/data/charts/statbank-gdp-growth.json'),
  'statbank-industrial-production': () => import('@/data/charts/statbank-industrial-production.json'),
  'statbank-salary': () => import('@/data/charts/statbank-salary.json'),
  'statbank-exports': () => import('@/data/charts/statbank-exports.json'),
  'statbank-imports': () => import('@/data/charts/statbank-imports.json'),
  'statbank-cpi': () => import('@/data/charts/statbank-cpi.json'),
  'statbank-cpi-food': () => import('@/data/charts/statbank-cpi-food.json'),
  'statbank-cpi-nonfood': () => import('@/data/charts/statbank-cpi-nonfood.json'),
  'statbank-cpi-services': () => import('@/data/charts/statbank-cpi-services.json'),
  'statbank-population': () => import('@/data/charts/statbank-population.json'),
  'statbank-unemployment': () => import('@/data/charts/statbank-unemployment.json'),
  'statbank-agriculture': () => import('@/data/charts/statbank-agriculture.json'),
};

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
