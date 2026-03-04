const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

/**
 * Send a message via Telegram Bot API.
 * Returns the API response body or throws on failure.
 */
export async function sendMessage(chatId, text, { parseMode = 'HTML', disablePreview = true } = {}) {
  if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is not set');

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: disablePreview,
    }),
  });

  const body = await res.json();
  if (!body.ok) {
    throw new Error(`Telegram API error: ${body.description || res.status}`);
  }
  return body;
}

/**
 * Format a number with locale-appropriate thousand separators.
 */
function fmt(value) {
  if (value == null) return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  // Use space as thousands separator (common in RO/MD)
  return n.toLocaleString('ro-MD', { maximumFractionDigits: 2 });
}

/**
 * Compute percentage change text between old and new values.
 */
function pctChange(oldVal, newVal) {
  if (oldVal == null || oldVal === 0) return '';
  const pct = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return ` (${sign}${pct.toFixed(1)}%)`;
}

/**
 * Format a list of indicator changes into a Telegram-friendly message.
 *
 * Each change: { name, unit, year, value, oldValue }
 */
export function formatIndicatorUpdate(changes) {
  if (!changes || changes.length === 0) return null;

  const latestYear = Math.max(...changes.map((c) => c.year));

  const lines = changes.map((c) => {
    const delta = pctChange(c.oldValue, c.value);
    return `🔹 ${c.name}: ${fmt(c.value)} ${c.unit}${delta}`;
  });

  return [
    '📊 <b>adevar.ai — Date noi / New Data</b>',
    '',
    ...lines,
    '',
    `📅 ${latestYear} | Sursa: BNS StatBank`,
    '🔗 www.adevar.ai',
  ].join('\n');
}

/**
 * Send an indicator update message to the configured Telegram channel.
 * Silently returns null if Telegram env vars are not configured.
 */
export async function sendTelegramUpdate(changes) {
  if (!BOT_TOKEN || !CHANNEL_ID) return null;
  if (!changes || changes.length === 0) return null;

  const text = formatIndicatorUpdate(changes);
  if (!text) return null;

  try {
    const result = await sendMessage(CHANNEL_ID, text);
    return result;
  } catch (err) {
    console.error('[telegram] Failed to send update:', err.message);
    return null;
  }
}
