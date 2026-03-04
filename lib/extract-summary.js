/**
 * Extract a short summary from an article URL for the news pipeline.
 * Never throws — returns null on any error.
 */

const MAX_SUMMARY_LEN = 300;
const FETCH_TIMEOUT_MS = 5000;
const USER_AGENT = 'AdevarBot/1.0 (+https://adevar.ai)';

function stripHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSummary(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = stripHtml(text).trim();
  if (!cleaned) return null;
  return cleaned.length > MAX_SUMMARY_LEN ? cleaned.slice(0, MAX_SUMMARY_LEN).trim() : cleaned;
}

function getVisibleText(html = '') {
  return stripHtml(html).trim();
}

/**
 * Extract summary from HTML in priority order.
 * @param {string} html - Full page HTML
 * @returns {string|null} - Cleaned summary or null
 */
function extractFromHtml(html) {
  if (!html || typeof html !== 'string') return null;

  // 1. og:description
  const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+property=["']og:description["']/i);
  if (ogDesc?.[1]) {
    const s = cleanSummary(ogDesc[1]);
    if (s) return s;
  }

  // 2. meta name="description"
  const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (metaDesc?.[1]) {
    const s = cleanSummary(metaDesc[1]);
    if (s) return s;
  }

  // 3. First <p> inside article, .article-body, .post-content, or main (then fallback: first <p> anywhere)
  const articleMatch = html.match(/<article[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
    || html.match(/<main[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
    || html.match(/article-body[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
    || html.match(/post-content[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
    || html.match(/entry-content[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  if (articleMatch?.[1]) {
    const s = cleanSummary(articleMatch[1]);
    if (s) return s;
  }

  const anyP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (anyP?.[1]) {
    const s = cleanSummary(anyP[1]);
    if (s) return s;
  }

  // 4. First 280 chars of visible text
  const visible = getVisibleText(html);
  if (visible.length > 0) {
    const s = visible.length > MAX_SUMMARY_LEN ? visible.slice(0, MAX_SUMMARY_LEN).trim() : visible;
    if (s) return s;
  }

  return null;
}

/**
 * Fetch URL and extract summary. Returns null on any error — never throws.
 * @param {string} url - Article URL to fetch
 * @returns {Promise<string|null>}
 */
export async function extractSummary(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractFromHtml(html);
  } catch {
    return null;
  }
}
