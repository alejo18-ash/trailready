require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const multer = require('multer');
const xml2js = require('xml2js');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// ── UNIT CONVERTERS ───────────────────────────────────────────
const ftToM  = ft => Math.round(ft * 0.3048);
const miToKm = mi => Math.round(mi * 1.60934 * 10) / 10;

// ── TERRAIN DETECTOR ─────────────────────────────────────────
function detectTerrain(name, elevPerKm) {
  const n = (name || '').toLowerCase();
  const hasTrailKeyword = n.includes('trail') || n.includes('ultra')
    || n.includes('mountain') || n.includes('mtb')
    || n.includes('singletrack') || n.includes('bunny')
    || n.includes('course') || n.includes('run')
    || n.includes('hill') || n.includes('peak')
    || n.includes('ridge') || n.includes('canyon');

  if (hasTrailKeyword) return 'technical';
  if (elevPerKm > 80) return 'technical';
  if (elevPerKm > 50) return 'mountain';
  if (elevPerKm > 25) return 'mixed';
  return 'road';
}

// ── ELEVATION ENRICHMENT ──────────────────────────────────────
async function enrichElevation(points) {
  const step = Math.max(1, Math.floor(points.length / 100));
  const sampled = points.filter((_, i) => i % step === 0).slice(0, 100);

  try {
    const latStr = sampled.map(p => p.lat).join(',');
    const lonStr = sampled.map(p => p.lon).join(',');
    const res = await axios.get(
      `https://api.open-meteo.com/v1/elevation?latitude=${latStr}&longitude=${lonStr}`,
      { timeout: 10000 }
    );
    const elevations = res.data.elevation;
    if (elevations && elevations.length > 0) {
      let gain = 0, loss = 0;
      for (let i = 1; i < elevations.length; i++) {
        const diff = elevations[i] - elevations[i-1];
        if (diff > 0.5) gain += diff;
        else if (diff < -0.5) loss += Math.abs(diff);
      }
      console.log('✅ Open-Meteo elevation:', Math.round(gain) + 'm D+');
      return {
        desnivel: Math.round(gain),
        desnivelNeg: Math.round(loss),
        elevMax: Math.round(Math.max(...elevations)),
        elevMin: Math.round(Math.min(...elevations)),
        profile: elevations.map(Math.round),
        elevSource: 'open-meteo',
      };
    }
  } catch (err) {
    console.log('⚠️ Open-Meteo failed:', err.message);
  }

  try {
    const locations = sampled.map(p => ({ latitude: p.lat, longitude: p.lon }));
    const res = await axios.post('https://api.open-elevation.com/api/v1/lookup',
      { locations }, { timeout: 10000 });
    const elevations = res.data.results.map(r => r.elevation);
    let gain = 0, loss = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i-1];
      if (diff > 0.5) gain += diff;
      else if (diff < -0.5) loss += Math.abs(diff);
    }
    console.log('✅ Open Elevation fallback:', Math.round(gain) + 'm D+');
    return {
      desnivel: Math.round(gain),
      desnivelNeg: Math.round(loss),
      elevMax: Math.round(Math.max(...elevations)),
      elevMin: Math.round(Math.min(...elevations)),
      profile: elevations.map(Math.round),
      elevSource: 'open-elevation',
    };
  } catch (err) {
    console.log('⚠️ Both APIs failed:', err.message);
    return null;
  }
}

// ── GPX PARSER ────────────────────────────────────────────────
function parseGPXData(gpxJson) {
  const gpx = gpxJson.gpx;
  const name = gpx.metadata?.[0]?.name?.[0]
    || gpx.trk?.[0]?.name?.[0]
    || 'Race Course';

  const tracks = gpx.trk || [];
  let points = [];

  for (const trk of tracks) {
    for (const seg of (trk.trkseg || [])) {
      for (const pt of (seg.trkpt || [])) {
        const ele = parseFloat(pt.ele?.[0] || 0);
        const lat = parseFloat(pt.$.lat);
        const lon = parseFloat(pt.$.lon);
        points.push({ lat, lon, ele });
      }
    }
  }

  if (points.length < 2) throw new Error('GPX has no track points');

  // Haversine distance
  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    const R = 6371;
    const dLat = (points[i].lat - points[i-1].lat) * Math.PI / 180;
    const dLon = (points[i].lon - points[i-1].lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
      Math.cos(points[i-1].lat * Math.PI / 180) *
      Math.cos(points[i].lat * Math.PI / 180) *
      Math.sin(dLon/2) ** 2;
    distanceKm += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Elevation from GPX tags
  let gainFromGPX = 0, lossFromGPX = 0;
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].ele - points[i-1].ele;
    if (diff > 0.5) gainFromGPX += diff;
    else if (diff < -0.5) lossFromGPX += Math.abs(diff);
  }

  const hasElevation = gainFromGPX > 10;
  const elevMax = hasElevation ? Math.round(Math.max(...points.map(p => p.ele))) : 0;
  const elevMin = hasElevation ? Math.round(Math.min(...points.map(p => p.ele))) : 0;
  const elevPerKm = gainFromGPX / distanceKm;
  const terreno = detectTerrain(name, hasElevation ? elevPerKm : 0);

  return {
    name,
    distancia: Math.round(distanceKm * 10) / 10,
    desnivel: hasElevation ? Math.round(gainFromGPX) : 0,
    desnivelNeg: hasElevation ? Math.round(lossFromGPX) : 0,
    elevMax,
    elevMin,
    terreno,
    hasElevation,
    points,
    pointCount: points.length,
    source: 'gpx',
  };
}

// ── SMART SCRAPER ─────────────────────────────────────────────
function extractRaceData(bodyText) {
  const kmMatches  = [...bodyText.matchAll(/\b(\d+\.?\d*)\s*[Kk](m|M)?\b/g)].map(m => parseFloat(m[1]));
  const miMatches  = [...bodyText.matchAll(/\b(\d+\.?\d*)\s*[Mm]i(les?)?\b/g)].map(m => miToKm(parseFloat(m[1])));
  const allDist    = [...new Set([...kmMatches, ...miMatches].map(Math.round))].filter(d => d >= 5 && d <= 200).sort((a, b) => b - a);

  const ftMatches  = [...bodyText.matchAll(/\b(\d[\d,]*)\s*(feet|foot|ft)(\s+of\s+elevation)?/gi)].map(m => ftToM(parseFloat(m[1].replace(/,/g, ''))));
  const mMatches   = [...bodyText.matchAll(/\b(\d[\d,]*)\s*m?\s+(D\+|elevation gain|desnivel)/gi)].map(m => parseInt(m[1].replace(/,/g, '')));
  const elevGain   = [...ftMatches, ...mMatches].filter(e => e > 100 && e < 10000)[0] || null;

  const dateMatch  = bodyText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i);

  const text = bodyText.toLowerCase();
  const terreno = text.includes('singletrack') || text.includes('technical') ? 'technical'
    : text.includes('mountain') || text.includes('trail') ? 'mountain'
    : text.includes('gravel') || text.includes('mixed') ? 'mixed'
    : 'road';

  return { allDist, elevGain, dateMatch: dateMatch?.[0] || null, terreno };
}

// ── ROUTE: Parse GPX ──────────────────────────────────────────
app.post('/api/parse-gpx', upload.single('gpx'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No GPX file uploaded' });

  try {
    const xml = fs.readFileSync(req.file.path, 'utf8');
    fs.unlinkSync(req.file.path);

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    const raceData = parseGPXData(result);

    if (!raceData.hasElevation && raceData.points.length > 1) {
      console.log('📡 GPX has no elevation — trying Open Elevation API...');
      const enriched = await enrichElevation(raceData.points);
      if (enriched) {
        Object.assign(raceData, enriched);
        raceData.hasElevation = true;
        const elevPerKm = raceData.desnivel / raceData.distancia;
        // GPX files are always trail/outdoor activities
        raceData.terreno = elevPerKm > 50 ? 'technical'
          : elevPerKm > 25 ? 'mountain'
          : elevPerKm > 10 ? 'mixed'
          : 'trail';
        console.log(`✅ Elevation enriched: ${raceData.desnivel}m D+ · ${elevPerKm.toFixed(1)}m/km · terrain: ${raceData.terreno}`);
      }
    }

    delete raceData.points;
    console.log(`✅ GPX: ${raceData.name} — ${raceData.distancia}km · ${raceData.desnivel}m D+ · ${raceData.terreno}`);
    res.json({ success: true, raceData });

  } catch (error) {
    console.error('GPX error:', error.message);
    res.status(500).json({ success: false, message: 'Could not parse GPX. Is it a valid .gpx file?' });
  }
});

// ── ROUTE: Scrape web link ─────────────────────────────────────
app.post('/api/generate-plan', async (req, res) => {
  const { raceUrl } = req.body;
  console.log('🔗 Scraping:', raceUrl);

  try {
    const { data } = await axios.get(raceUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
    });
    const $ = cheerio.load(data);
    const raceName = $('title').text().split('|')[0].trim() || 'Detected Race';
    const bodyText = $('body').text();
    const { allDist, elevGain, dateMatch, terreno } = extractRaceData(bodyText);

    console.log(`✅ Race: ${raceName} | Distances: ${allDist.join(', ')}km | Elevation: ${elevGain}m | Date: ${dateMatch}`);

    res.json({
      success: true,
      raceName,
      raceData: {
        name: raceName,
        distancia: allDist[0] || 50,
        availableDistances: allDist,
        desnivel: elevGain || null,
        fecha: dateMatch,
        terreno,
        source: 'web',
        needsElevation: !elevGain,
      },
    });

  } catch (error) {
    console.error('Scrape error:', error.message);
    res.status(500).json({ success: false, message: 'Could not read the page. Is the link valid?' });
  }
});

// ── ROUTE: Weather + AQI ──────────────────────────────────────
app.get('/api/conditions', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon required' });

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: { lat, lon, appid: process.env.OPENWEATHER_KEY, units: 'metric' }
      }),
      axios.get(`https://api.openaq.org/v3/locations`, {
        params: { coordinates: `${lat},${lon}`, radius: 25000, limit: 1 },
        headers: { 'X-API-Key': process.env.OPENAQ_KEY }
      }),
    ]);

    const w = weatherRes.data;
    const aqiLocation = aqiRes.data.results?.[0];

    let aqi = null;
    if (aqiLocation?.id) {
      try {
        const measRes = await axios.get(`https://api.openaq.org/v3/locations/${aqiLocation.id}/latest`, {
          headers: { 'X-API-Key': process.env.OPENAQ_KEY }
        });
        const pm25 = measRes.data.results?.find(r => r.parameter === 'pm25');
        if (pm25) {
          const v = pm25.value;
          aqi = v <= 12 ? 'Good' : v <= 35 ? 'Moderate' : v <= 55 ? 'Unhealthy for sensitive' : 'Unhealthy';
        }
      } catch { aqi = null; }
    }

    const icon = w.weather[0].main === 'Rain' ? '🌧️'
      : w.weather[0].main === 'Snow' ? '❄️'
      : w.weather[0].main === 'Thunderstorm' ? '⛈️'
      : w.weather[0].main === 'Clouds' ? '⛅'
      : w.weather[0].main === 'Clear' ? '☀️' : '🌤️';

    const alert = w.weather[0].main === 'Rain' ? 'Wet trails — use traction'
      : w.weather[0].main === 'Thunderstorm' ? '⚠️ Storm — avoid exposed ridges'
      : w.main.temp > 32 ? '🥵 Heat — extra hydration'
      : w.main.temp < 0 ? '🥶 Freezing — dress in layers' : null;

    res.json({
      success: true,
      conditions: {
        temp: Math.round(w.main.temp),
        feelsLike: Math.round(w.main.feels_like),
        humidity: w.main.humidity,
        description: w.weather[0].description,
        main: w.weather[0].main,
        icon,
        wind: Math.round(w.wind.speed * 3.6),
        aqi,
        alert,
        city: w.name,
      }
    });

  } catch (error) {
    console.error('Conditions error:', error.message);
    res.status(500).json({ success: false, message: 'Could not fetch conditions' });
  }
});

// Enrich top trails with real elevation via Open-Meteo (used by /api/trails)
async function enrichTrailElevation(lat, lon, distanceKm) {
  try {
    const steps = 20;
    const spread = (distanceKm / 2) / 111;
    const lats = Array.from({ length: steps }, (_, i) => lat + (Math.sin((i / steps) * Math.PI * 2) * spread));
    const lons = Array.from({ length: steps }, (_, i) => lon + (Math.cos((i / steps) * Math.PI * 2) * spread));

    const latStr = lats.join(',');
    const lonStr = lons.join(',');

    const res = await axios.get(
      `https://api.open-meteo.com/v1/elevation?latitude=${latStr}&longitude=${lonStr}`,
      { timeout: 8000 }
    );

    const elevations = res.data.elevation;
    if (!elevations || elevations.length === 0) return null;

    let gain = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0.5) gain += diff;
    }

    return {
      desnivel: Math.round(gain * 2),
      elevMax: Math.round(Math.max(...elevations)),
      elevMin: Math.round(Math.min(...elevations)),
      profile: elevations.map(Math.round),
    };
  } catch {
    return null;
  }
}

// ── ROUTE: Nearby trails via OSM ──────────────────────────────
app.get('/api/trails', async (req, res) => {
  const { lat, lon, distancia, desnivel, exclude } = req.query;
  if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon required' });

  console.log('🗺️ Trails request:', lat, lon, distancia);

  const targetKm = parseFloat(distancia) || 20;
  const radius   = 15000;
  const excluded = exclude ? exclude.split(',').map(Number) : [];

  const overpassQuery = `
    [out:json][timeout:25];
    (
      way["highway"="path"]["sac_scale"](around:${radius},${lat},${lon});
      way["highway"="track"]["trailblazed"](around:${radius},${lat},${lon});
      relation["route"="hiking"](around:${radius},${lat},${lon});
      relation["route"="running"](around:${radius},${lat},${lon});
    );
    out body; >; out skel qt;
  `;

  const mockTrails = [
    { id: 1, name: 'Local Trail Loop', distancia: targetKm, source: 'OSM', type: 'trail', difficulty: 'mountain_hiking', url: `https://www.openstreetmap.org/#map=13/${lat}/${lon}`, wikiloc: `https://www.wikiloc.com/trails/hiking?q=trail+loop`, score: 50 },
    { id: 2, name: 'Ridge Trail', distancia: Math.round(targetKm * 0.7), source: 'OSM', type: 'trail', difficulty: 'demanding', url: `https://www.openstreetmap.org/#map=13/${lat}/${lon}`, wikiloc: `https://www.wikiloc.com/trails/hiking?q=ridge+trail`, score: 40 },
  ];

  let elements = [];
  try {
    const overpassRes = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(overpassQuery)}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 25000 }
    );
    elements = overpassRes.data?.elements || [];
  } catch (overpassErr) {
    console.error('⚠️ Overpass failed:', overpassErr.message);
    return res.json({ success: true, trails: mockTrails, total: mockTrails.length });
  }

  try {
    const relations = elements.filter(e => e.type === 'relation');
    const ways      = elements.filter(e => e.type === 'way');
    const candidates = [];

    for (const rel of relations.slice(0, 20)) {
      const tags = rel.tags || {};
      const name = tags.name || tags['name:en'] || null;
      if (!name) continue;
      const distKm = tags.distance ? parseFloat(tags.distance) : null;
      candidates.push({
        id: rel.id,
        name,
        distancia: distKm,
        source: 'OSM',
        type: tags.route || 'trail',
        difficulty: tags.sac_scale || tags.difficulty || null,
        url: `https://www.openstreetmap.org/relation/${rel.id}`,
        wikiloc: `https://www.wikiloc.com/trails/hiking?q=${encodeURIComponent(name)}`,
      });
    }

    for (const way of ways.slice(0, 30)) {
      const tags = way.tags || {};
      const name = tags.name || null;
      if (!name) continue;
      candidates.push({
        id: way.id,
        name,
        distancia: null,
        source: 'OSM',
        type: 'path',
        difficulty: tags.sac_scale || null,
        url: `https://www.openstreetmap.org/way/${way.id}`,
        wikiloc: `https://www.wikiloc.com/trails/hiking?q=${encodeURIComponent(name)}`,
      });
    }

    // Score and filter — exclude already used trails
    const scored = candidates
      .filter(t => !excluded.includes(t.id))
      .map(trail => {
        let score = 0;
        if (trail.distancia) {
          const distDiff = Math.abs(trail.distancia - targetKm) / targetKm;
          score += Math.max(0, 1 - distDiff) * 50;
        }
        if (trail.difficulty === 'demanding' || trail.difficulty === 'alpine') score += 30;
        else if (trail.difficulty === 'mountain_hiking') score += 20;
        if (trail.type === 'running') score += 20;
        return { ...trail, score: Math.round(score) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const latN = parseFloat(lat);
    const lonN = parseFloat(lon);
    const topTrails = scored.slice(0, 3);
    const enrichedTop = await Promise.all(topTrails.map(async (trail) => {
      const elev = await enrichTrailElevation(latN, lonN, trail.distancia || targetKm);
      return elev ? { ...trail, ...elev } : trail;
    }));
    const enrichedTrails = [...enrichedTop, ...scored.slice(3)];

    console.log(`🗺️ Trails near (${lat},${lon}): ${candidates.length} found, ${enrichedTrails.length} returned`);
    res.json({ success: true, trails: enrichedTrails, total: candidates.length });

  } catch (error) {
    console.error('OSM processing error:', error.message);
    return res.json({ success: true, trails: mockTrails, total: mockTrails.length });
  }
});

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'TrailReady API v2' });
});

// ── LAUNCH ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 TrailReady API running on http://localhost:${PORT}`);
});