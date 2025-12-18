const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const CONDITIONS = [
  'Clear skies',
  'Partly cloudy',
  'Overcast',
  'Light rain',
  'Thunderstorms',
  'Coastal breeze',
  'Foggy morning',
  'Snow flurries',
  'Drizzle',
  'Sunny breaks'
];

const REGIONS = [
  'Coastal Plain',
  'Highlands',
  'River Valley',
  'Lake District',
  'Canyon Ridge',
  'Bayfront',
  'Prairie Belt',
  'Forest Edge'
];

function seededRandom(seed) {
  const str = String(seed).toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    // xorshift-like mixing
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    const normalized = (hash >>> 0) / 0xffffffff;
    return normalized;
  };
}

function generateForecast(city) {
  const random = seededRandom(city);
  const baseTemp = Math.round(random() * 35) + 40; // 40 - 75°F
  const humidity = Math.round(random() * 50) + 30; // 30 - 80%
  const wind = Math.round(random() * 20) + 2; // 2 - 22 mph
  const condition = CONDITIONS[Math.floor(random() * CONDITIONS.length)];

  const forecast = Array.from({ length: 5 }).map((_, index) => {
    const swing = Math.round(random() * 12);
    const high = baseTemp + swing;
    const low = baseTemp - Math.round(random() * 8);
    const dayHumidity = Math.min(100, humidity + Math.round(random() * 10) - 5);
    const dayWind = Math.max(1, wind + Math.round(random() * 6) - 3);
    const label = new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
      .toLocaleDateString(undefined, { weekday: 'short' });

    return {
      label,
      condition: CONDITIONS[Math.floor(random() * CONDITIONS.length)],
      high,
      low,
      humidity: dayHumidity,
      wind: dayWind
    };
  });

  return {
    city: city.trim(),
    region: REGIONS[Math.floor(random() * REGIONS.length)],
    generatedAt: new Date().toISOString(),
    current: {
      temperature: baseTemp,
      feelsLike: Math.round(baseTemp - 2 + random() * 6),
      humidity,
      wind,
      condition
    },
    forecast
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function sendStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypeMap = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
  };
  const contentType = contentTypeMap[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/weather') {
    const city = url.searchParams.get('city');
    if (!city || !city.trim()) {
      return sendJson(res, 400, { message: 'Please provide a city to search.' });
    }

    const data = generateForecast(city);
    return sendJson(res, 200, data);
  }

  const safePath = path.normalize(url.pathname).replace(/^\//, '');
  const requestedPath = safePath ? path.join(PUBLIC_DIR, safePath) : path.join(PUBLIC_DIR, 'index.html');

  fs.stat(requestedPath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      return sendStaticFile(res, path.join(requestedPath, 'index.html'));
    }

    return sendStaticFile(res, requestedPath);
  });
});

server.listen(PORT, () => {
  console.log(`SkyCast server running at http://localhost:${PORT}`);
});