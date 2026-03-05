#!/usr/bin/env node
/**
 * Validate statistica-open-data-manifest.json structure.
 * Run: node scripts/validate-manifest.mjs
 * Exits 1 on validation failure for CI use.
 */
import fs from 'node:fs';

const path = new URL('../config/statistica-open-data-manifest.json', import.meta.url);
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (err) {
  console.error('Failed to read/parse manifest:', err.message);
  process.exit(1);
}

const errors = [];

function check(condition, msg) {
  if (!condition) errors.push(msg);
}

check(typeof manifest.version === 'number', 'Missing or invalid "version" (must be number)');
check(typeof manifest.owner === 'string', 'Missing "owner" string');
check(Array.isArray(manifest.sources), 'Missing "sources" array');
check(Array.isArray(manifest.categories), 'Missing "categories" array');

const VALID_FREQUENCIES = ['monthly', 'quarterly', 'annual', 'quarterly/annual', 'daily'];
const VALID_QUALITY_GATES = ['strict', 'standard', 'best_effort'];

const sourceIds = new Set((manifest.sources || []).map(s => s.id));

for (const source of manifest.sources || []) {
  check(source.id, `Source missing "id"`);
  check(source.name, `Source ${source.id}: missing "name"`);
  check(source.url, `Source ${source.id}: missing "url"`);
  check(source.type, `Source ${source.id}: missing "type"`);
}

for (const cat of manifest.categories || []) {
  check(cat.id, 'Category missing "id"');
  check(cat.label?.ro, `Category ${cat.id}: missing label.ro`);
  check(cat.label?.en, `Category ${cat.id}: missing label.en`);
  check(Array.isArray(cat.datasets), `Category ${cat.id}: missing "datasets" array`);

  for (const ds of cat.datasets || []) {
    const prefix = `${cat.id}/${ds.id}`;
    check(ds.id, `${cat.id}: dataset missing "id"`);
    check(ds.name, `${prefix}: missing "name"`);
    check(ds.sourceId, `${prefix}: missing "sourceId"`);

    if (ds.sourceId) {
      check(sourceIds.has(ds.sourceId), `${prefix}: sourceId "${ds.sourceId}" not found in sources`);
    }

    check(ds.frequency, `${prefix}: missing "frequency"`);
    if (ds.frequency) {
      check(VALID_FREQUENCIES.includes(ds.frequency), `${prefix}: invalid frequency "${ds.frequency}" (expected: ${VALID_FREQUENCIES.join(', ')})`);
    }

    check(ds.geoLevel, `${prefix}: missing "geoLevel"`);
    check(Array.isArray(ds.unitExamples) && ds.unitExamples.length > 0, `${prefix}: missing or empty "unitExamples"`);

    // P1 datasets require governance fields
    if (cat.priority === 'P1') {
      check(ds.owner, `${prefix} [P1]: missing "owner"`);
      check(typeof ds.freshnessSlaHours === 'number', `${prefix} [P1]: missing "freshnessSlaHours"`);
      check(ds.qualityGate, `${prefix} [P1]: missing "qualityGate"`);
      if (ds.qualityGate) {
        check(VALID_QUALITY_GATES.includes(ds.qualityGate), `${prefix} [P1]: invalid qualityGate "${ds.qualityGate}"`);
      }
      check(typeof ds.alertOnDelayHours === 'number', `${prefix} [P1]: missing "alertOnDelayHours"`);
    }
  }
}

if (errors.length) {
  console.error(`Manifest validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Manifest valid: ${manifest.categories.length} categories, ${manifest.sources.length} sources.`);
