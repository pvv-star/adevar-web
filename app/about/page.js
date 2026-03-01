import AboutContent from '@/components/AboutContent';

export const metadata = {
  title: 'Despre Platformă — adevar.ai',
  description: 'Metodologie și surse de date pentru platforma adevar.ai. Date publice din Republica Moldova.',
  openGraph: {
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
