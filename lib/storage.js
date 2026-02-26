const PREFIX = 'adevar_';

export function saveToStorage(key, value) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // storage full or unavailable
  }
}

export function loadFromStorage(key, defaultValue = null) {
  if (typeof localStorage === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function clearStorage(key) {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}
