import { describe, it, expect } from 'vitest';
import { getTagForChartSlug } from '@/lib/chart-tag-map';

describe('getTagForChartSlug', () => {
  it('maps energy charts to energie', () => {
    expect(getTagForChartSlug('gas')).toBe('energie');
    expect(getTagForChartSlug('electricity')).toBe('energie');
  });

  it('maps economy charts to economie', () => {
    expect(getTagForChartSlug('inflation')).toBe('economie');
    expect(getTagForChartSlug('gdp')).toBe('economie');
    expect(getTagForChartSlug('salary')).toBe('economie');
    expect(getTagForChartSlug('statbank-gdp')).toBe('economie');
    expect(getTagForChartSlug('statbank-exports')).toBe('economie');
  });

  it('maps demography charts to social', () => {
    expect(getTagForChartSlug('births-sex')).toBe('social');
    expect(getTagForChartSlug('population')).toBe('social');
    expect(getTagForChartSlug('statbank-population')).toBe('social');
  });

  it('returns null for unknown slugs', () => {
    expect(getTagForChartSlug('unknown-chart')).toBeNull();
    expect(getTagForChartSlug('')).toBeNull();
    expect(getTagForChartSlug(null)).toBeNull();
    expect(getTagForChartSlug(undefined)).toBeNull();
  });

  it('maps CPI charts to economie, not social', () => {
    expect(getTagForChartSlug('statbank-cpi')).toBe('economie');
    expect(getTagForChartSlug('statbank-cpi-food')).toBe('economie');
  });

  it('maps statbank-unemployment to social (not economie)', () => {
    expect(getTagForChartSlug('statbank-unemployment')).toBe('social');
  });
});
