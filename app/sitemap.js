import { CHARTS } from '@/lib/charts';

export default function sitemap() {
  const base = 'https://www.adevar.ai';

  const chartPages = CHARTS
    .filter(c => !c.special && !c.soon)
    .map(c => ({
      url: `${base}/chart/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/prime`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...chartPages,
  ];
}
