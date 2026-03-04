import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'adevar.ai — Republica Moldova Date în Timp Real',
  description: 'Monitorizare independentă a indicatorilor economici și energetici din Republica Moldova.',
  alternates: {
    canonical: 'https://www.adevar.ai',
    languages: {
      ro: 'https://www.adevar.ai?lang=ro',
      en: 'https://www.adevar.ai?lang=en',
      ru: 'https://www.adevar.ai?lang=ru',
    },
  },
  openGraph: {
    title: 'adevar.ai — Republica Moldova Date în Timp Real',
    description: 'Monitorizare independentă a indicatorilor economici și energetici din Republica Moldova.',
    url: 'https://www.adevar.ai',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <Dashboard />;
}
