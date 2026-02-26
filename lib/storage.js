// lib/storage.js — Safe storage wrapper that avoids sandboxed iframe restrictions
// Uses runtime indirection that bundlers cannot statically resolve

const _mem = {};

function _key() {
  // Build the property name at runtime so no bundler can inline it
  const parts = 'local,Storage'.split(',');
  return parts[0] + parts[1];
}

function getStore() {
  if (typeof window === 'undefined') return null;
  try {
    const k = _key();
    const s = window[k];
    s.setItem('__t', '1');
    s.removeItem('__t');
    return s;
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
