import './globals.css';
import { Onest } from 'next/font/google';
import ClientLayout from './ClientLayout';

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.adevar.ai'),
  title: 'adevar.ai — Platforma de date instituționale a Moldovei',
  description: 'Monitorizare independentă a indicatorilor economici și energetici din Republica Moldova. Date din surse oficiale: BNS, ANRE, BNM.',
  openGraph: {
    title: 'adevar.ai — Date în Timp Real',
    description: 'Indicatori macroeconomici ai Republicii Moldova: gaze, electricitate, inflație, salarii, remitențe.',
    type: 'website',
    url: 'https://www.adevar.ai',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'adevar.ai',
  url: 'https://www.adevar.ai',
  description: 'Independent monitoring platform for economic and energy indicators of the Republic of Moldova.',
  applicationCategory: 'DataVisualization',
  operatingSystem: 'All',
  provider: {
    '@type': 'Organization',
    name: 'adevar.ai',
    url: 'https://www.adevar.ai',
    email: 'contact@adevar.ai',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('adevar-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');var l=localStorage.getItem('adevar-lang');if(l&&['ro','en','ru'].indexOf(l)!==-1)document.documentElement.lang=l}catch(e){}})()`,
          }}
        />
      </head>
      <body className={onest.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
