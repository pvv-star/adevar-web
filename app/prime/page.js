import PrimePage from '@/components/PrimePage';

export const metadata = {
  title: 'PrimeCanvas — adevar.ai',
  description: 'PrimeCanvas workspace for UI/UX iteration and live patch workflows.',
  openGraph: {
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function PrimeRoutePage() {
  return <PrimePage />;
}
