import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import crypto from 'node:crypto';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export const maxDuration = 60;

const FETCH_TIMEOUT_MS = Number(process.env.NEWS_FETCH_TIMEOUT_MS || 10000);
const MAX_SUMMARY_LEN = 200;
const MIN_SUMMARY_LEN = 20;

function hash(v) {
  return crypto.createHash('sha1').update(String(v || '')).digest('hex');
}

function cleanText(v = '') {
  return String(v).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

function trimToLastWord(str, maxLen) {
  if (str.length <= maxLen) return str;
  const slice = str.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim();
}

/** Clean RSS description for summary: strip HTML, junk, trim to 200 chars. Returns null if empty, equals title, or too short. */
function cleanRssSummary(description, title) {
  if (!description || typeof description !== 'string') return null;
  let s = decodeEntities(description);
  s = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*The post\s+.+?\s+appeared first on\s+.+$/i, ' ').trim();
  s = s.replace(/\s*Articolul\s+.+?\s+apare prima dată în\s+.+$/i, ' ').trim();
  s = s.replace(/\s*Citește mai departe\s*/gi, ' ').trim();
  s = s.replace(/\s*Read more\s*/gi, ' ').trim();
  s = s.replace(/\s*https?:\/\/[^\s]+\s*$/gi, ' ').trim();
  s = s.replace(/\s+/g, ' ').trim();
  if (!s || s.length < MIN_SUMMARY_LEN) return null;
  const titleNorm = (title || '').trim().toLowerCase();
  if (titleNorm && s.trim().toLowerCase() === titleNorm) return null;
  s = trimToLastWord(s, MAX_SUMMARY_LEN);
  return s || null;
}

function parseRss(xml = '') {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const b of blocks) {
    const title = cleanText((b.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const link = cleanText((b.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '');
    const description = cleanText((b.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '');
    const pubDateRaw = cleanText((b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || '');
    const pubDate = pubDateRaw ? new Date(pubDateRaw).toISOString() : null;
    if (title && link) items.push({ title, link, description, pubDate });
  }
  return items;
}

const TAG_KEYWORDS = {
  economie: ['economie', 'pib', 'buget', 'banca', 'bnm', 'inflatie', 'salariu', 'credit', 'investitii', 'fiscal'],
  energie: ['energie', 'gaz', 'electricitate', 'tarif', 'anre', 'termic'],
  social: ['sanatate', 'educatie', 'pensii', 'somaj', 'populatie', 'demografie', 'migratie'],
};

function classifyTags(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase();
  const tags = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) tags.push(tag);
  }
  return tags;
}

function scoreImpact(title = '', summary = '', priority = 'medium') {
  const text = `${title} ${summary}`.toLowerCase();
  let score = priority === 'high' ? 50 : priority === 'medium' ? 30 : 10;
  const keywords = ['guvern', 'parlament', 'bnm', 'energie', 'gaz', 'electricitate', 'criza', 'inflatie', 'miliard', 'urgent'];
  for (const k of keywords) if (text.includes(k)) score += 8;
  return Math.min(100, score);
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const start = Date.now();
  const supabase = getSupabaseServerClient();

  let sources;
  try {
    const configPath = resolve(process.cwd(), 'config/news-sources.json');
    sources = JSON.parse(readFileSync(configPath, 'utf-8')).filter((s) => s.enabled);
  } catch {
    return NextResponse.json({ error: 'config_not_found' }, { status: 500 });
  }

  const runInsert = await supabase.from('news_runs').insert([{ status: 'running' }]).select('id').single();
  const runId = runInsert.data?.id;

  let fetched = 0, inserted = 0, duplicates = 0, errors = 0;
  const sourcesFailed = [];

  for (const source of sources) {
    try {
      if (!source.rssUrl) continue;
      const res = await fetch(source.rssUrl, {
        headers: { 'user-agent': 'adevar-news-bot/1.0' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const parsed = parseRss(xml).slice(0, 50);
      fetched += parsed.length;

      for (const item of parsed) {
        const canonicalUrl = item.link.split('?')[0];
        const urlHash = hash(canonicalUrl);
        const titleHash = hash(item.title.toLowerCase());
        const duplicateGroup = hash(item.title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(' ').slice(0, 8).join(' '));
        const summaryValue = cleanRssSummary(item.description, item.title);

        const payload = {
          source_slug: source.slug,
          title: item.title,
          summary: summaryValue,
          url: item.link,
          canonical_url: canonicalUrl,
          url_hash: urlHash,
          title_hash: titleHash,
          published_at: item.pubDate,
          language: source.language,
          impact_score: scoreImpact(item.title, item.description, source.priority),
          tags: classifyTags(item.title, item.description),
          duplicate_group: duplicateGroup,
          seen_sources: [source.slug],
        };

        const up = await supabase.from('news_items').upsert([payload], { onConflict: 'url_hash' }).select('id').single();
        if (up.error) {
          errors += 1;
          continue;
        }
        inserted += 1;
      }
    } catch (error) {
      errors += 1;
      sourcesFailed.push(source.slug);
      await supabase.from('news_errors').insert([{ source_slug: source.slug, stage: 'fetch', error: error.message }]);
    }
  }

  // Soft dedupe count
  const { data: grouped } = await supabase
    .from('news_items')
    .select('duplicate_group')
    .gte('published_at', new Date(Date.now() - 72 * 3600 * 1000).toISOString());
  const seen = new Set();
  for (const r of grouped || []) {
    if (seen.has(r.duplicate_group)) duplicates += 1;
    else seen.add(r.duplicate_group);
  }

  if (runId) {
    await supabase.from('news_runs').update({
      finished_at: new Date().toISOString(),
      status: errors ? 'partial' : 'ok',
      fetched_count: fetched,
      inserted_count: inserted,
      deduped_count: duplicates,
      error_count: errors,
      details: { sources: sources.length, sources_failed: sourcesFailed },
    }).eq('id', runId);
  }

  const duration_ms = Date.now() - start;
  return NextResponse.json({
    ok: true, fetched, inserted, duplicates, errors, sources_failed: sourcesFailed, duration_ms,
  });
}
