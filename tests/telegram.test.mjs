import { describe, it, expect } from 'vitest';
import { formatIndicatorUpdate } from '@/lib/telegram';

describe('formatIndicatorUpdate', () => {
  it('returns null for empty changes', () => {
    expect(formatIndicatorUpdate([])).toBeNull();
    expect(formatIndicatorUpdate(null)).toBeNull();
  });

  it('formats a single change correctly', () => {
    const result = formatIndicatorUpdate([
      { name: 'GDP', unit: 'mil. lei', year: 2025, value: 300000, oldValue: 280000 },
    ]);
    expect(result).toContain('GDP');
    expect(result).toContain('adevar.ai');
    expect(result).toContain('2025');
  });

  it('escapes HTML in indicator names', () => {
    const result = formatIndicatorUpdate([
      { name: '<b>Malicious</b>', unit: '%', year: 2025, value: 5 },
    ]);
    expect(result).not.toContain('<b>Malicious</b>');
    expect(result).toContain('&lt;b&gt;Malicious&lt;/b&gt;');
  });
});
