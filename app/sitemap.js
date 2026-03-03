import { CHARTS } from '@/lib/charts';

const BASE = 'https://www.adevar.ai';

function langAlternates(path) {
  return {
    languages: {
      ro: `${BASE}${path}?lang=ro`,
      en: `${BASE}${path}?lang=en`,
      ru: `${BASE}${path}?lang=ru`,
    },
  };
}

export default function sitemap() {
  const chartPages = CHARTS
    .filter(c => !c.special && !c.soon)
    .map(c => ({
      url: `${BASE}/chart/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: langAlternates(`/chart/${c.id}`),
    }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0, alternates: langAlternates('') },
    { url: `${BASE}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9, alternates: langAlternates('/news') },
    { url: `${BASE}/prime`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7, alternates: langAlternates('/prime') },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5, alternates: langAlternates('/about') },
    ...chartPages,
  ];
}
