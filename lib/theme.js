// lib/theme.js — Theme utilities
import { storageGet, storageSet } from './storage';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = storageGet('adevar-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
}

export function persistTheme(theme) {
  storageSet('adevar-theme', theme);
}

export function getInitialNavMode() {
  if (typeof window === 'undefined') return 'compact';
  const saved = storageGet('adevar-nav');
  if (saved === 'expanded' || saved === 'compact') return saved;
  return 'compact';
}

export function persistNavMode(mode) {
  storageSet('adevar-nav', mode);
}
