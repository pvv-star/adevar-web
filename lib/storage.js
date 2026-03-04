// lib/storage.js — Safe localStorage wrapper with in-memory fallback

const _mem = {};

function getStore() {
  if (typeof window === 'undefined') return null;
  try {
    localStorage.setItem('__t', '1');
    localStorage.removeItem('__t');
    return localStorage;
  } catch (e) {
    return null;
  }
}

export function storageGet(key) {
  const s = getStore();
  if (s) {
    try { return s.getItem(key); } catch (e) {}
  }
  return _mem[key] || null;
}

export function storageSet(key, value) {
  const s = getStore();
  if (s) {
    try { s.setItem(key, value); } catch (e) {}
  }
  _mem[key] = value;
}
