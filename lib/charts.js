// lib/charts.js — Chart catalog and data loading utilities

export const CATEGORIES = {
  energy:         { ro: 'Energie',        en: 'Energy',          ru: 'Энергетика' },
  economy:        { ro: 'Economie',       en: 'Economy',         ru: 'Экономика' },
  demography:     { ro: 'Demografie',     en: 'Demographics',    ru: 'Демография' },
  infrastructure: { ro: 'Infrastructură', en: 'Infrastructure',  ru: 'Инфраструктура' },
  platform:       { ro: 'Platformă',      en: 'Platform',        ru: 'Платформа' },
};

export const CHARTS = [
  // ── special views ──
  { id: 'dashboard', file: null, icon: '', category: 'platform', special: 'dashboard',
    ro: 'Dashboard',            en: 'Dashboard',              ru: 'Дашборд' },
  { id: 'about',     file: null, icon: '', category: 'platform', special: 'about',
    ro: 'Despre platformă',     en: 'About the Platform',     ru: 'О платформе' },

  // ── energy ──
  { id: 'gas',         file: 'gas.json',         icon: '', category: 'energy',
    ro: 'Gaze Naturale',         en: 'Natural Gas',           ru: 'Природный газ' },
  { id: 'electricity', file: 'electricity.json',  icon: '', category: 'energy',
    ro: 'Electricitate',         en: 'Electricity',           ru: 'Электричество' },
  { id: 'heating',     file: null, icon: '', category: 'energy', soon: true,
    ro: 'Tariful la Energia Termică', en: 'Thermal Energy Tariff',     ru: 'Тариф на тепловую энергию' },

  // ── economy ──
  { id: 'inflation',   file: 'inflation.json', icon: '', category: 'economy',
    ro: 'Inflația',              en: 'Inflation',             ru: 'Инфляция' },
  { id: 'salary',      file: 'salary.json',  icon: '', category: 'economy',
    ro: 'Salariul Mediu',        en: 'Average Salary',        ru: 'Средняя зарплата' },
  { id: 'gdp',         file: 'gdp.json', icon: '', category: 'economy',
    ro: 'Produsul Intern Brut (PIB)',        en: 'Gross Domestic Product (GDP)',        ru: 'Валовой внутренний продукт (ВВП)' },
  { id: 'exchange',    file: 'exchange.json', icon: '', category: 'economy',
    ro: 'Cursul Valutar Oficial', en: 'Official Exchange Rate', ru: 'Официальный обменный курс' },
  { id: 'remittances', file: 'remittances.json', icon: '', category: 'economy',
    ro: 'Remitențe',             en: 'Remittances',           ru: 'Денежные переводы' },
  { id: 'unemployment', file: 'unemployment.json', icon: '', category: 'economy',
    ro: 'Rata Șomajului',                 en: 'Unemployment Rate',          ru: 'Уровень безработицы' },

  // ── demography ──
  { id: 'births-sex',  file: 'births-sex.json', icon: '', category: 'demography',
    ro: 'Nașteri: Fete vs Băieți', en: 'Births: Girls vs Boys', ru: 'Рождения: девочки и мальчики' },
  { id: 'population',  file: 'population.json', icon: '', category: 'demography',
    ro: 'Populația cu Reședință Obișnuită',             en: 'Usually Resident Population',            ru: 'Численность постоянного населения' },
  { id: 'emigration',  file: null, icon: '', category: 'demography', soon: true,
    ro: 'Migrația Netă Internațională',             en: 'Net International Migration',            ru: 'Чистая международная миграция' },
  { id: 'urbanization', file: null, icon: '', category: 'demography', soon: true,
    ro: 'Rata Populației Urbane',           en: 'Urban Population Rate',          ru: 'Доля городского населения' },

  // ── infrastructure ──
  { id: 'internet',    file: null, icon: '', category: 'infrastructure', soon: true,
    ro: 'Accesul Gospodăriilor la Internet',     en: 'Household Internet Access',       ru: 'Доступ домохозяйств к Интернету' },
  { id: 'roads',       file: null, icon: '', category: 'infrastructure', soon: true,
    ro: 'Lungimea Drumurilor Publice',     en: 'Length of Public Roads',          ru: 'Протяженность дорог общего пользования' },
];

// Descriptions — separated from CHARTS to keep nav bundles light.
// Only imported by chart pages and search (already lazy-loaded).
export const CHART_DESCS = {
  gas: {
    ro: 'Evoluția tarifelor la gaze naturale pentru populație, conform deciziilor ANRE.',
    en: 'Natural gas tariff trends for households, per ANRE regulatory decisions.',
    ru: 'Динамика тарифов на природный газ для населения по решениям ANRE.',
  },
  electricity: {
    ro: 'Tarifele la energie electrică pentru consumatorii casnici și industriali.',
    en: 'Electricity tariffs for residential and industrial consumers.',
    ru: 'Тарифы на электроэнергию для бытовых и промышленных потребителей.',
  },
  heating: {
    ro: 'Costul mediu pentru energia termică livrată consumatorilor.',
    en: 'Average cost of thermal energy supplied to consumers.',
    ru: 'Средняя стоимость тепловой энергии, поставляемой потребителям.',
  },
  inflation: {
    ro: 'Indicele prețurilor de consum (IPC) lunar și anual, conform BNS.',
    en: 'Monthly and annual consumer price index (CPI) as reported by the National Bureau of Statistics.',
    ru: 'Ежемесячный и годовой индекс потребительских цен (ИПЦ) по данным НБС.',
  },
  salary: {
    ro: 'Salariul mediu brut pe economie, pe sectoare și regiuni, conform BNS.',
    en: 'Average gross salary by sector and region, as reported by BNS.',
    ru: 'Средняя брутто-зарплата по отраслям и регионам по данным НБС.',
  },
  gdp: {
    ro: 'Evoluția economică a țării, în prețuri curente de piață.',
    en: 'The country\'s economic evolution, in current market prices.',
    ru: 'Экономическое развитие страны в текущих рыночных ценах.',
  },
  exchange: {
    ro: 'Valoarea Leului Moldovenesc (MDL) față de valute de referință.',
    en: 'Value of the Moldovan Leu (MDL) against reference currencies.',
    ru: 'Стоимость молдавского лея (MDL) по отношению к базовым валютам.',
  },
  remittances: {
    ro: 'Volumul remitențelor trimise în Republica Moldova, pe trimestre, conform BNM.',
    en: 'Volume of remittances sent to the Republic of Moldova by quarter, per NBM data.',
    ru: 'Объём денежных переводов в Республику Молдова по кварталам по данным НБМ.',
  },
  unemployment: {
    ro: 'Procentul forței de muncă neîncadrate în muncă.',
    en: 'Percentage of the labor force without work.',
    ru: 'Процент рабочей силы, не имеющей работы.',
  },
  'births-sex': {
    ro: 'Născuți-vii pe sexe, total țară, ultimii 10 ani disponibili (sursa oficială BNS StatBank).',
    en: 'Live births by sex, whole country, last 10 available years (official NBS StatBank source).',
    ru: 'Живорождения по полу, вся страна, последние 10 доступных лет (официальный источник НБС StatBank).',
  },
  population: {
    ro: 'Numărul estimat al locuitorilor țării la începutul anului.',
    en: 'Estimated number of the country\'s inhabitants at the beginning of the year.',
    ru: 'Оценочная численность жителей страны на начало года.',
  },
  emigration: {
    ro: 'Diferența dintre numărul de imigranți și emigranți.',
    en: 'The difference between the number of immigrants and emigrants.',
    ru: 'Разница между числом иммигрантов и эмигрантов.',
  },
  urbanization: {
    ro: 'Ponderea populației care locuiește în municipii și orașe.',
    en: 'Share of the population living in municipalities and cities.',
    ru: 'Доля населения, проживающего в муниципиях и городах.',
  },
  internet: {
    ro: 'Ponderea gospodăriilor care dețin acces la rețeaua de internet la domiciliu.',
    en: 'Share of households with internet access at home.',
    ru: 'Доля домохозяйств, имеющих доступ к сети Интернет на дому.',
  },
  roads: {
    ro: 'Totalul kilometrilor de drumuri de interes național, local și comunal.',
    en: 'Total kilometers of national, local, and communal roads.',
    ru: 'Общая протяженность дорог национального, местного и коммунального значения в километрах.',
  },
};

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
