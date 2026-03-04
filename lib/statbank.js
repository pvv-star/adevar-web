/**
 * PxWeb API client for Moldova's StatBank (statbank.statistica.md)
 *
 * Provides tree browsing, data fetching with json-stat2 parsing,
 * rate limiting (1 req/s), and exponential backoff retry.
 */

const BASE_URL = 'https://statbank.statistica.md/PxWeb/api/v1/ro/';

// --- Rate limiter: token bucket, max 2 requests/second ---

const bucket = { tokens: 1, max: 1, refillRate: 1, lastRefill: Date.now() };

function refillBucket() {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(bucket.max, bucket.tokens + elapsed * bucket.refillRate);
  bucket.lastRefill = now;
}

async function waitForToken() {
  refillBucket();
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return;
  }
  const waitMs = ((1 - bucket.tokens) / bucket.refillRate) * 1000;
  await new Promise((r) => setTimeout(r, Math.ceil(waitMs)));
  refillBucket();
  bucket.tokens -= 1;
}

// --- Retry with exponential backoff ---

async function fetchWithRetry(url, options, { maxAttempts = 3, baseDelayMs = 2000 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await waitForToken();
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      // Retry on 429 or 5xx
      if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[statbank] ${res.status} on attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      const text = await res.text().catch(() => '');
      throw new Error(`StatBank API ${res.status}: ${text.slice(0, 200)}`);
    } catch (err) {
      if (err.message.startsWith('StatBank API')) throw err;
      if (attempt >= maxAttempts) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[statbank] fetch error on attempt ${attempt}: ${err.message}, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// --- Public API ---

/**
 * Browse the StatBank table tree.
 * @param {string} path - e.g. "40 Statistica economica/13 CNT"
 * @returns {Promise<Array<{id: string, type: string, text: string}>>}
 */
export async function browseTree(path = '') {
  const url = BASE_URL + encodePathSegments(path);
  const res = await fetchWithRetry(url, {
    headers: { Accept: 'application/json' },
  });
  return res.json();
}

/**
 * Fetch data from a PxWeb table.
 * @param {string} tablePath - full path including .px file
 * @param {Array<{code: string, selection: {filter: string, values: string[]}}>} query
 * @returns {Promise<object>} json-stat2 response
 */
export async function fetchTable(tablePath, query) {
  const url = BASE_URL + encodePathSegments(tablePath);
  const body = {
    query: query || [],
    response: { format: 'json-stat2' },
  };
  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * Parse a json-stat2 response into an array of {year, value} pairs.
 *
 * json-stat2 stores values in a flat array. Dimensions sizes determine
 * how to index into it. We find the time dimension, iterate over time
 * labels, and pick out the corresponding values.
 *
 * For multi-dimensional queries (e.g. exports + imports), pass
 * `dimensionFilter` to select a specific slice:
 *   { "Indicatori": "0" }  → only rows where Indicatori == "0"
 *
 * @param {object} jsonStat - json-stat2 dataset
 * @param {object} [dimensionFilter] - optional filter for non-time dimensions
 * @returns {Array<{year: number, value: number}>}
 */
export function parseJsonStat2(jsonStat, dimensionFilter) {
  const ds = jsonStat.id ? jsonStat : Object.values(jsonStat)[0];
  if (!ds || !ds.dimension || !ds.id || !ds.size) {
    throw new Error('Invalid json-stat2 structure');
  }

  const { id: dimIds, size: dimSizes, value: values, dimension } = ds;

  // Find the time dimension
  const timeDimIdx = dimIds.findIndex(
    (d) => dimension[d]?.category?.index && (d.toLowerCase().includes('ani') || d.toLowerCase().includes('year') || d.toLowerCase().includes('time'))
  );
  if (timeDimIdx === -1) {
    throw new Error(`No time dimension found in: ${dimIds.join(', ')}`);
  }

  const timeDimId = dimIds[timeDimIdx];
  const timeCategory = dimension[timeDimId].category;
  const timeLabels = timeCategory.label || {};
  const timeIndex = timeCategory.index;
  // timeIndex can be object {code: position} or array [code, code, ...]
  const timeCodes = Array.isArray(timeIndex) ? timeIndex : Object.keys(timeIndex);

  // Build filter indices for non-time dimensions
  const filterIndices = {};
  if (dimensionFilter) {
    for (const [dimName, filterValue] of Object.entries(dimensionFilter)) {
      const dIdx = dimIds.indexOf(dimName);
      if (dIdx === -1) continue;
      const cat = dimension[dimName].category;
      const catIndex = Array.isArray(cat.index) ? cat.index : Object.keys(cat.index);
      const pos = catIndex.indexOf(String(filterValue));
      if (pos === -1) {
        throw new Error(`Filter value "${filterValue}" not found in dimension "${dimName}"`);
      }
      filterIndices[dIdx] = pos;
    }
  }

  const results = [];

  for (let ti = 0; ti < timeCodes.length; ti++) {
    const code = timeCodes[ti];
    const year = parseTimeCode(code);
    if (year === null) continue;

    // Calculate flat index: iterate all dimension positions
    // For non-time, non-filtered dims, use position 0 (first/default)
    const indices = dimIds.map((_, dIdx) => {
      if (dIdx === timeDimIdx) return ti;
      if (filterIndices[dIdx] !== undefined) return filterIndices[dIdx];
      return 0;
    });

    // Flat index = sum of (index[d] * product of sizes of all later dimensions)
    let flatIdx = 0;
    let multiplier = 1;
    for (let d = dimIds.length - 1; d >= 0; d--) {
      flatIdx += indices[d] * multiplier;
      multiplier *= dimSizes[d];
    }

    const val = values[flatIdx];
    if (val === null || val === undefined || val === '..') continue;

    results.push({ year, value: Number(val) });
  }

  return results.filter((r) => !isNaN(r.value)).sort((a, b) => a.year - b.year);
}

/**
 * Convert PxWeb time codes to year integers.
 * Handles: "2024", "2024M01" (monthly → year), "2024Q1" (quarterly → year)
 */
function parseTimeCode(code) {
  const s = String(code).trim();
  // Plain year
  if (/^\d{4}$/.test(s)) return parseInt(s, 10);
  // Monthly: 2024M01
  const mMatch = s.match(/^(\d{4})M/);
  if (mMatch) return parseInt(mMatch[1], 10);
  // Quarterly: 2024Q1
  const qMatch = s.match(/^(\d{4})Q/);
  if (qMatch) return parseInt(qMatch[1], 10);
  return null;
}

/** Encode each path segment individually for URLs with spaces. */
function encodePathSegments(path) {
  if (!path) return '';
  return path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}
