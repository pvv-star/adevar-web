import { describe, it, expect } from 'vitest';
import { translate, I18N } from '@/lib/i18n';

describe('translate', () => {
  it('returns Romanian text for ro', () => {
    expect(translate('ro', 'overview')).toBe('Date');
  });

  it('returns English text for en', () => {
    expect(translate('en', 'overview')).toBe('Data');
  });

  it('returns Russian text for ru', () => {
    expect(translate('ru', 'overview')).toBe('Данные');
  });

  it('falls back to Romanian for unknown lang', () => {
    expect(translate('de', 'overview')).toBe('Date');
  });

  it('falls back to Romanian for missing key in non-ro lang', () => {
    // If a key exists in ro but not en, should return ro value
    const roKeys = Object.keys(I18N.ro);
    const enKeys = Object.keys(I18N.en);
    const roOnly = roKeys.find((k) => !enKeys.includes(k));
    if (roOnly) {
      expect(translate('en', roOnly)).toBe(I18N.ro[roOnly]);
    }
  });

  it('returns the key itself for completely unknown keys', () => {
    expect(translate('ro', 'nonexistent_key_xyz')).toBe('nonexistent_key_xyz');
  });
});
