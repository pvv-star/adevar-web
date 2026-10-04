import { expect, it } from 'vitest';
import { boundedInteger } from '../lib/query-params.js';

it('keeps database limits finite, integral, and within bounds', () => {
  const options = { fallback: 5, min: 1, max: 20 };
  for (const value of [null, '', 'NaN', 'Infinity', 'abc']) expect(boundedInteger(value, options)).toBe(5);
  expect(boundedInteger('-50', options)).toBe(1);
  expect(boundedInteger('200', options)).toBe(20);
  expect(boundedInteger('3.7', options)).toBe(3);
});
