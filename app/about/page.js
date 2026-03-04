import AboutContent from '@/components/AboutContent';

export const metadata = {
  title: 'Despre Platformă — adevar.ai',
  description: 'Metodologie și surse de date pentru platforma adevar.ai. Date publice din Republica Moldova.',
  alternates: {
    canonical: 'https://www.adevar.ai/about',
    languages: {
      ro: 'https://www.adevar.ai/about?lang=ro',
      en: 'https://www.adevar.ai/about?lang=en',
      ru: 'https://www.adevar.ai/about?lang=ru',
    },
  },
  openGraph: {
    title: 'Despre Platformă — adevar.ai',
    description: 'Metodologie și surse de date pentru platforma adevar.ai. Date publice din Republica Moldova.',
    url: 'https://www.adevar.ai/about',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
