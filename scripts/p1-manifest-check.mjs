#!/usr/bin/env node
import fs from 'node:fs';

const path = new URL('../config/statistica-open-data-manifest.json', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(path, 'utf8'));

const p1 = new Set(manifest?.ingestionPhases?.P1 || []);
const rows = [];
let errors = 0;

for (const cat of manifest.categories || []) {
  if (!p1.has(cat.id)) continue;
  for (const ds of cat.datasets || []) {
    const issues = [];
    if (!ds.owner) issues.push('missing owner');
    if (!ds.freshnessSlaHours) issues.push('missing freshnessSlaHours');
    if (!ds.qualityGate) issues.push('missing qualityGate');
    if (!ds.alertOnDelayHours) issues.push('missing alertOnDelayHours');
    if (!ds.sourceId) issues.push('missing sourceId');
    if (!ds.sourceUrl) issues.push('missing sourceUrl');
    if (!ds.frequency) issues.push('missing frequency');
    if (!ds.geoLevel) issues.push('missing geoLevel');
    if (!Array.isArray(ds.unitExamples) || ds.unitExamples.length === 0) issues.push('missing unitExamples');

    rows.push({
      category: cat.id,
      dataset: ds.id,
      status: ds.status || 'n/a',
      owner: ds.owner || 'n/a',
      slaH: ds.freshnessSlaHours || 'n/a',
      gate: ds.qualityGate || 'n/a',
      issues: issues.join('; '),
    });

    if (issues.length) errors += 1;
  }
}

console.table(rows);
if (errors) {
  console.error(`\nP1 manifest check failed: ${errors} dataset(s) with missing governance fields.`);
  process.exit(1);
}

console.log('\nP1 manifest check passed.');
