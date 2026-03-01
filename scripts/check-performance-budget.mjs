#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const maxJsKb = Number(process.env.PERF_MAX_JS_KB || 900);
const maxCssKb = Number(process.env.PERF_MAX_CSS_KB || 140);

function dirSize(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += dirSize(full, ext);
    else if (!ext || full.endsWith(ext)) total += fs.statSync(full).size;
  }
  return total;
}

const staticDir = path.join(process.cwd(), '.next', 'static');
const jsKb = dirSize(staticDir, '.js') / 1024;
const cssKb = dirSize(staticDir, '.css') / 1024;

const failures = [];
if (jsKb > maxJsKb) failures.push(`JS budget exceeded: ${jsKb.toFixed(1)}KB > ${maxJsKb}KB`);
if (cssKb > maxCssKb) failures.push(`CSS budget exceeded: ${cssKb.toFixed(1)}KB > ${maxCssKb}KB`);

if (failures.length) {
  console.error('Performance budget failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`OK: performance budget passed (js=${jsKb.toFixed(1)}KB, css=${cssKb.toFixed(1)}KB)`);
