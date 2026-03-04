#!/usr/bin/env node
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env for news pipeline');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FETCH_TIMEOUT_MS = Number(process.env.NEWS_FETCH_TIMEOUT_MS || 10000);

function hash(v) {
  return crypto.createHash('sha1').update(String(v || '')).digest('hex');
}

function cleanText(v = '') {
  return String(v).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

async function run() {
  const sources = JSON.parse(await fs.readFile(new URL('../config/news-sources.json', import.meta.url), 'utf8'))
    .filter((s) => s.enabled);

  const runInsert = await supabase.from('news_runs').insert([{ status: 'running' }]).select('id').single();
  const runId = runInsert.data?.id;

  let fetchedCount = 0, insertedCount = 0, dedupedCount = 0, errorCount = 0;

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
      fetchedCount += parsed.length;

      for (const item of parsed) {
        const canonicalUrl = item.link.split('?')[0];
        const urlHash = hash(canonicalUrl);
        const titleHash = hash(item.title.toLowerCase());
        const duplicateGroup = hash(item.title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(' ').slice(0, 8).join(' '));

        const payload = {
          source_slug: source.slug,
          title: item.title,
          summary: item.description || null,
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
          errorCount += 1;
          continue;
        }
        insertedCount += 1;
      }
    } catch (error) {
      errorCount += 1;
      await supabase.from('news_errors').insert([{ source_slug: source.slug, stage: 'fetch', error: error.message }]);
    }
  }

  // soft dedupe marker count
  const { data: grouped } = await supabase
    .from('news_items')
    .select('duplicate_group')
    .gte('published_at', new Date(Date.now() - 72 * 3600 * 1000).toISOString());
  const seen = new Set();
  for (const r of grouped || []) {
    if (seen.has(r.duplicate_group)) dedupedCount += 1;
    else seen.add(r.duplicate_group);
  }

  if (runId) {
    await supabase.from('news_runs').update({
      finished_at: new Date().toISOString(),
      status: errorCount ? 'partial' : 'ok',
      fetched_count: fetchedCount,
      inserted_count: insertedCount,
      deduped_count: dedupedCount,
      error_count: errorCount,
      details: { sources: sources.length },
    }).eq('id', runId);
  }

  console.log(JSON.stringify({ ok: true, fetchedCount, insertedCount, dedupedCount, errorCount }, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
