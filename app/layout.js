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
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('adevar-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={onest.className} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
