import './globals.css';
import { Onest } from 'next/font/google';
import ClientLayout from './ClientLayout';

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata = {
  title: 'adevar.ai — Platforma de date instituționale a Moldovei',
  description: 'Monitorizare independentă a indicatorilor economici și energetici din Republica Moldova. Date din surse oficiale: BNS, ANRE, BNM.',
  openGraph: {
    title: 'adevar.ai — Date în Timp Real',
    description: 'Indicatori macroeconomici ai Republicii Moldova: gaze, electricitate, inflație, salarii, remitențe.',
    type: 'website',
    url: 'https://www.adevar.ai',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={onest.className} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
