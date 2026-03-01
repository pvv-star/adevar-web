import { NextResponse } from 'next/server';

const CHISINAU = { lat: 47.0105, lon: 28.8638 };

function formatDateForBnm(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function parseBnmRate(xml, code) {
  const blocks = xml.match(/<Valute[\s\S]*?<\/Valute>/gi) || [];
  const block = blocks.find((b) => new RegExp(`<CharCode>\s*${code}\s*<\/CharCode>`, 'i').test(b));
  if (!block) return null;

  const nominal = Number((block.match(/<Nominal>(.*?)<\/Nominal>/i) || [])[1] || '1');
  const rawValue = ((block.match(/<Value>(.*?)<\/Value>/i) || [])[1] || '').trim();
  const value = Number(rawValue.replace(',', '.'));
  if (!Number.isFinite(value) || !Number.isFinite(nominal) || nominal === 0) return null;
  return Number((value / nominal).toFixed(4));
}

async function getBnmRates() {
  const date = formatDateForBnm();
  const url = `https://www.bnm.md/en/official_exchange_rates?get_xml=1&date=${date}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`BNM fetch failed: ${res.status}`);
  const xml = await res.text();

  return {
    date,
    source: {
      name: 'National Bank of Moldova (BNM)',
      url,
    },
    rates: {
      EUR: parseBnmRate(xml, 'EUR'),
      USD: parseBnmRate(xml, 'USD'),
      RON: parseBnmRate(xml, 'RON'),
    },
  };
}

async function getWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${CHISINAU.lat}&longitude=${CHISINAU.lon}&current=temperature_2m,weather_code&timezone=Europe%2FChisinau`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const json = await res.json();
  const current = json?.current || {};

  return {
    city: 'Chișinău',
    source: {
      name: 'Open-Meteo',
      url,
    },
    temperatureC: Number.isFinite(Number(current.temperature_2m)) ? Number(current.temperature_2m) : null,
    weatherCode: current.weather_code ?? null,
    observedAt: current.time || null,
  };
}

export async function GET() {
  try {
    const [fx, weather] = await Promise.all([getBnmRates(), getWeather()]);
    return NextResponse.json(
      {
        ok: true,
        updatedAt: new Date().toISOString(),
        fx,
        weather,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to load live snapshot',
        details: error?.message || 'unknown-error',
      },
      { status: 500 }
    );
  }
}
