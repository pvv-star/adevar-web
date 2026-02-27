import './globals.css';
import ClientLayout from './ClientLayout';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
