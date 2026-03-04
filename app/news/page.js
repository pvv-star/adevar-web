import NewsPageClient from './NewsPageClient';

export const metadata = {
  title: 'Flux de știri · 72h — adevar.ai',
  description: 'Surse verificate din Republica Moldova, ordonate după relevanță. Știri din ultimele 72 de ore.',
  alternates: {
    canonical: 'https://www.adevar.ai/news',
    languages: {
      ro: 'https://www.adevar.ai/news?lang=ro',
      en: 'https://www.adevar.ai/news?lang=en',
      ru: 'https://www.adevar.ai/news?lang=ru',
    },
  },
  openGraph: {
    title: 'Flux de știri · 72h — adevar.ai',
    description: 'Surse verificate din Republica Moldova, ordonate după relevanță.',
    url: 'https://www.adevar.ai/news',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function NewsPage() {
  return <NewsPageClient />;
}
