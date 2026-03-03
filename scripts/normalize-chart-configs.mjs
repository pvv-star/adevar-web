#!/usr/bin/env node

/**
 * Normalize all chart JSON configs with consistent yMax, gridSteps, decimals.
 *
 * Usage:
 *   node scripts/normalize-chart-configs.mjs            # normalize all chart JSONs
 *   node scripts/normalize-chart-configs.mjs --dry-run   # preview without writing
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeChartConfig } from '../lib/chart-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHARTS_DIR = resolve(__dirname, '..', 'data/charts');
const DRY_RUN = process.argv.includes('--dry-run');

const files = readdirSync(CHARTS_DIR).filter((f) => f.endsWith('.json')).sort();

console.log(`\n📐 Normalize chart configs ${DRY_RUN ? '(DRY RUN)' : ''}\n`);

let updated = 0;
let unchanged = 0;

for (const file of files) {
  const filePath = resolve(CHARTS_DIR, file);
  const raw = readFileSync(filePath, 'utf-8');
  const chart = JSON.parse(raw);

  const oldConfig = chart.config;
  if (!oldConfig || !oldConfig.data) {
    console.log(`  ⏭ ${file}: no config.data, skipping`);
    continue;
  }

  const newConfig = normalizeChartConfig(oldConfig);

  const changed =
    oldConfig.yMax !== newConfig.yMax ||
    oldConfig.gridSteps !== newConfig.gridSteps ||
    oldConfig.decimals !== newConfig.decimals;

  if (changed) {
    console.log(
      `  ✏ ${file}: yMax ${oldConfig.yMax} → ${newConfig.yMax}, ` +
      `gridSteps ${oldConfig.gridSteps} → ${newConfig.gridSteps}, ` +
      `decimals ${oldConfig.decimals} → ${newConfig.decimals}`
    );
    if (!DRY_RUN) {
      chart.config = newConfig;
      writeFileSync(filePath, JSON.stringify(chart, null, 2) + '\n');
    }
    updated++;
  } else {
    console.log(`  ✓ ${file}: already optimal`);
    unchanged++;
  }
}

console.log(`\n📋 Summary: ${updated} updated, ${unchanged} unchanged (${files.length} total)\n`);
