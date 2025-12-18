/**
 * Vercel Serverless Function: /api/weather
 * Query params:
 *   - city (required): city name
 * Response:
 *   JSON with simulated weather + 5-day forecast
 */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function generateSimulatedWeather(city) {
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rain", "Thunderstorms", "Snow", "Fog", "Windy"];
  const baseTemp = randomInt(25, 95);

  const current = {
    city,
    temperature: baseTemp,
    condition: pick(conditions),
    humidity: randomInt(25, 90),
    windSpeed: randomInt(0, 25),
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIdx = new Date().getDay(); // 0=Sun

  const forecast = Array.from({ length: 5 }, (_, i) => {
    const dayIdx = (todayIdx + i + 1) % 7;
    const delta = randomInt(-10, 10);
    return {
      day: days[dayIdx],
      temperature: Math.max(0, baseTemp + delta),
      condition: pick(conditions),
    };
  });

  return { ...current, forecast };
}

module.exports = (req, res) => {
  // Basic CORS for local testing and simple client apps
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const cityRaw = req.query && req.query.city;
  const city = Array.isArray(cityRaw) ? cityRaw[0] : cityRaw;

  if (!city || typeof city !== "string" || !city.trim()) {
    return res.status(400).json({ error: "Missing required query parameter: city" });
  }

  const payload = generateSimulatedWeather(city.trim());
  return res.status(200).json(payload);
};
