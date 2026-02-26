import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'adevar.ai — Date Publice Moldova',
  description: 'Transparență prin date. Tarife, inflație și indicatori economici din Republica Moldova.',
  openGraph: {
    title: 'adevar.ai — Date Publice Moldova',
    description: 'Transparență prin date. Tarife, inflație și indicatori economici din Republica Moldova.',
    images: [{ url: 'https://adevar.ai/og-image.png' }],
    type: 'website',
    locale: 'ro_MD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'adevar.ai',
    description: 'Date publice Moldova',
    images: ['https://adevar.ai/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
