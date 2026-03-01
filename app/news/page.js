import NewsPageClient from './NewsPageClient';

export const metadata = {
  title: 'Flux de știri · 72h — adevar.ai',
  description: 'Surse verificate din Republica Moldova, ordonate după relevanță. Știri din ultimele 72 de ore.',
  openGraph: {
    title: 'Flux de știri · 72h — adevar.ai',
    description: 'Surse verificate din Republica Moldova, ordonate după relevanță.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function NewsPage() {
  return <NewsPageClient />;
}
