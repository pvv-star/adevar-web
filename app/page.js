import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'adevar.ai — Republica Moldova Date în Timp Real',
  description: 'Monitorizare independentă a indicatorilor economici și energetici din Republica Moldova.',
  openGraph: {
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <Dashboard />;
}
