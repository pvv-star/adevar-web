/**
 * Extract a short summary from an article URL for the news pipeline.
 * Never throws — returns null on any error.
 */

const MAX_SUMMARY_LEN = 200;
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

function decodeEntities(text) {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripJunk(text) {
  return String(text)
    .replace(/\]\s*\]\s*>/g, ' ')
    .replace(/\[…\]/g, ' ')
    .replace(/\s*Read more\s*/gi, ' ')
    .replace(/\s*The post\s+.+?\s+appeared first on\s+.+$/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimToLastWord(str, maxLen) {
  if (str.length <= maxLen) return str;
  const slice = str.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim();
}

function cleanSummary(text) {
  if (!text || typeof text !== 'string') return null;
  let cleaned = decodeEntities(text);
  cleaned = stripHtml(cleaned);
  cleaned = stripJunk(cleaned);
  cleaned = cleaned.trim();
  if (!cleaned) return null;
  cleaned = trimToLastWord(cleaned, MAX_SUMMARY_LEN);
  return cleaned || null;
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

  // 4. First 200 chars of visible text (cleaned and trimmed to last word)
  const visible = getVisibleText(html);
  if (visible.length > 0) {
    const s = cleanSummary(visible);
    if (s) return s;
  }

  return null;
}

function isDuplicateOfTitle(summary, title) {
  if (!summary || !title || typeof title !== 'string') return false;
  const s = summary.trim();
  const t = title.trim();
  if (!t) return false;
  const sLower = s.toLowerCase();
  const tLower = t.toLowerCase();
  return s === t || sLower === tLower || sLower.startsWith(tLower);
}

/**
 * Fetch URL and extract summary. Returns null on any error — never throws.
 * If summary equals or starts with title, returns null to avoid duplicate text.
 * @param {string} url - Article URL to fetch
 * @param {string} [title] - Article title; summary is discarded if it matches or starts with this
 * @returns {Promise<string|null>}
 */
export async function extractSummary(url, title) {
  if (!url || typeof url !== 'string') return null;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const html = await res.text();
    let summary = extractFromHtml(html);
    if (summary && isDuplicateOfTitle(summary, title)) summary = null;
    return summary;
  } catch {
    return null;
  }
}
