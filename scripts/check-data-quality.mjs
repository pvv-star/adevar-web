#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const chartsDir = path.join(process.cwd(), 'data', 'charts');
const files = fs.readdirSync(chartsDir).filter((f) => f.endsWith('.json'));
const nowYear = new Date().getFullYear();

const failures = [];

for (const file of files) {
  const full = path.join(chartsDir, file);
  const json = JSON.parse(fs.readFileSync(full, 'utf8'));
  const data = json?.config?.data;

  if (!Array.isArray(data) || data.length < 3) {
    failures.push(`${file}: config.data must be array with >=3 points`);
    continue;
  }

  for (let i = 0; i < data.length; i++) {
    const p = data[i] || {};
    const val = p.y ?? p.value;
    const axis = p.x ?? p.label;
    if (typeof axis === 'undefined' || !Number.isFinite(Number(val))) {
      failures.push(`${file}: invalid point at index ${i}`);
      break;
    }
  }

  const years = data
    .map((p) => String(p.x ?? p.label ?? ''))
    .map((s) => {
      const m = s.match(/(19|20)\d{2}/);
      return m ? Number(m[0]) : NaN;
    })
    .filter(Number.isFinite);

  if (years.length) {
    const maxYear = Math.max(...years);
    if (maxYear < nowYear - 2) {
      failures.push(`${file}: stale coverage (max year ${maxYear})`);
    }
  }
}

const newsSourcesPath = path.join(process.cwd(), 'config', 'news-sources.json');
if (fs.existsSync(newsSourcesPath)) {
  const sources = JSON.parse(fs.readFileSync(newsSourcesPath, 'utf8'));
  if (!Array.isArray(sources) || sources.length < 5) {
    failures.push('config/news-sources.json: expected at least 5 sources');
  }
}

if (failures.length) {
  console.error('Data quality checks failed:');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`OK: data quality passed for ${files.length} chart files`);
