// lib/i18n.js — Translations (ro bundled, en/ru loaded on demand)

const ro = {
  overview: 'Date', footer: 'Surse publice: BNS, ANRE, BNM', soon: 'Planificat',
  dashTitle: 'Republica Moldova — Date în Timp Real',
  dashSub: 'Monitorizare independentă a indicatorilor economici și energetici',
  availableCharts: 'Indicatori disponibili',
  comingSoon: 'În pregătire',
  notifyMe: 'Notifică-mă',
  plannedBadge: 'Planificat',
  aboutTitle: 'Despre Platformă',
  aboutSub: 'Metodologie și surse de date',
  missionTitle: 'Misiune',
  missionText: 'adevar.ai este o platformă independentă de monitorizare a datelor publice din Republica Moldova. Scopul său este de a face datele statistice și regulatorii accesibile, lizibile și comparabile în timp.',
  sourcesTitle: 'Surse de date',
  methodTitle: 'Metodologie',
  methodText: 'Datele sunt colectate exclusiv din surse oficiale: hotărâri ale ANRE, comunicate BNS, rapoarte BNM și alte documente publice ale autorităților. Nu se efectuează ajustări sau estimări proprii — valorile afișate reflectă exact cifrele publicate.',
  contactTitle: 'Contact',
  contactText: 'Pentru sugestii, corecții sau colaborare instituțională, scrieți la contact@adevar.ai.',
  bnTabDashboard: 'Date', bnTabEnergy: 'Energie', bnTabEconomy: 'Economie', bnTabDemography: 'Demografie', bnTabInfrastructure: 'Infrastructură', bnTabPlatform: 'Platformă', bnTabMore: 'Mai mult',
  liveNewsPulse: 'Fluxul de știri Moldova · ultimele 24h',
  tapFullFeed: 'Atinge pentru fluxul complet de 72h',
  liveSnapshot: 'Date live · FX + Meteo',
  back: 'Înapoi',
  statsError: 'Datele nu au putut fi încărcate. Reîncercați mai târziu.',
  currentTariff: 'Tarif curent',
  lastUpdate: 'Ultima actualizare',
  viewChart: 'Deschide graficul',
  platform: 'Platformă',
  sourcesBNSName: 'Biroul Național de Statistică al Republicii Moldova',
  sourcesBNSDesc: 'Date macroeconomice, demografice și sociale. statistica.gov.md',
  sourcesANREName: 'Agenția Națională pentru Reglementare în Energetică',
  sourcesANREDesc: 'Hotărâri de tarifare pentru gaze, electricitate și termoficare. anre.md',
  sourcesBNMName: 'Banca Națională a Moldovei',
  sourcesBNMDesc: 'Cursuri valutare, statistici monetare și balanță de plăți. bnm.md',
  newsTitle: 'Flux de știri · 72h',
  newsSub: 'Surse verificate din Republica Moldova, ordonate după relevanță',
  newsSearchPlaceholder: 'Caută știri, surse, cuvinte-cheie',
  newsNoResults: 'Niciun rezultat pentru acest filtru.',
  newsEmpty: 'Nicio știre disponibilă',
  loadMore: 'Mai multe',
  retry: 'Reîncearcă',
  opensNewTab: 'se deschide în tab nou',
  impactScoreHelp: 'Scor de relevanță: 0 = minim, 100 = maxim',
  newsTab: 'Știri',
  chartsTab: 'Grafice',
  quickDestinations: 'Destinații rapide',
  heroTrust: 'Date oficiale Moldova · surse transparente · fără estimări',
  exploreCta: 'Explorează datele',
  newsCta: 'Noutăți',
  sourcesCta: 'Despre surse',
  searchIndicators: 'Caută indicatori',
  searchPlaceholder: 'Caută indicator după nume, categorie...',
  searchNoResults: 'Niciun indicator găsit',
  chartOpenFull: 'Grafic complet',
  chartCompact: 'Compact',
  chartFull: 'Complet',
  chartSource: 'Sursa: Date instituționale oficiale din Moldova',
  chartUpdated: 'Actualizat',
  chartVsStart: 'vs. începutul perioadei',
  chartReplay: 'Reluare',
  chartPeriod: 'Perioada',
  chartValue: 'Valoare',
  errorTitle: 'Ceva nu a funcționat',
  errorSub: 'Încercați din nou. Dacă problema persistă, reveniți în curând.',
  errorRetry: 'Reîncearcă',
  newsReset: 'Resetare',
  filterAll: 'Toate', filterHighImpact: 'Impact mare', filterEconomy: 'Economie', filterEnergy: 'Energie', filterSocial: 'Social',
  periodAll: 'Tot', chartStats: 'Statistici grafic', chartLegend: 'Legendă', chartEvents: 'Evenimente', chartPeriodLabel: 'Perioada graficului',
  liveRatesWeather: 'Cursuri live și meteo', close: 'Închide', closeMenu: 'Închide meniul', increased: 'crescut', decreased: 'scăzut', errorLabel: 'Eroare', dataChart: 'Grafic de date',
};

export const SUPPORTED_LANGS = ['ro', 'en', 'ru'];

const cache = { ro };

export async function loadLang(lang) {
  if (cache[lang]) return cache[lang];
  if (lang === 'en') {
    const mod = await import('./i18n/en.js');
    cache.en = mod.default;
    return cache.en;
  }
  if (lang === 'ru') {
    const mod = await import('./i18n/ru.js');
    cache.ru = mod.default;
    return cache.ru;
  }
  return cache.ro;
}

export function translate(lang, key) {
  const dict = cache[lang] || ro;
  return dict[key] || ro[key] || key;
}
