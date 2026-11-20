// Real running loops: OpenRouteService generates round trips from the runner's
// location; we measure them and pick the best for today's session and weather.
// Claude only explains the pick — it never invents a route.
const axios = require('axios');
const { verifyFirebaseToken } = require('./coach');

const ORS_BASES = (process.env.ORS_BASE_URL ? [process.env.ORS_BASE_URL] : [])
  .concat(['https://api.heigit.org/openrouteservice']); // api.openrouteservice.org was shut down in Nov 2026
const TRAIL_TYPES = new Set(['longTrail', 'shortTrail', 'backToBack']);
const HARD_TYPES = new Set(['tempo', 'intervals', 'strides']);
const UNPAVED = new Set([2, 8, 9, 10, 11, 12, 15, 16, 17]); // ORS surface codes
const DAILY_LIMIT = Number(process.env.ROUTES_DAILY_LIMIT || 15);

const cache = new Map();   // same place + session + day → same answer
const usage = new Map();

function takeQuota(uid) {
  const day = new Date().toISOString().slice(0, 10);
  const u = usage.get(uid);
  const count = u && u.day === day ? u.count : 0;
  if (count >= DAILY_LIMIT) return false;
  usage.set(uid, { day, count: count + 1 });
  return true;
}

// Share of the route (by distance) whose extra_info value matches a test.
function shareOf(extra, test) {
  if (!extra?.summary) return null;
  let hit = 0, total = 0;
  for (const s of extra.summary) { total += s.amount; if (test(s.value)) hit += s.amount; }
  return total ? hit / total : null;
}
function weightedAvg(extra) {
  if (!extra?.summary) return null;
  let sum = 0, total = 0;
  for (const s of extra.summary) { sum += s.value * s.amount; total += s.amount; }
  return total ? sum / total : null;
}
function simplify(coords, maxPts = 160) {
  const step = Math.max(1, Math.ceil(coords.length / maxPts));
  const out = coords.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== coords[coords.length - 1]) out.push(coords[coords.length - 1]);
  return out.map(([lon, lat, ele]) => [Math.round(lat * 1e5) / 1e5, Math.round(lon * 1e5) / 1e5, ele != null ? Math.round(ele) : null]);
}
function mapsUrl(pts) {
  const pick = (f) => pts[Math.floor(f * (pts.length - 1))];
  const o = pts[0], w = [pick(0.25), pick(0.5), pick(0.75)];
  return `https://www.google.com/maps/dir/?api=1&origin=${o[0]},${o[1]}&destination=${o[0]},${o[1]}`
    + `&waypoints=${w.map(p => `${p[0]},${p[1]}`).join('%7C')}&travelmode=walking`;
}

async function orsRoundTrip(lat, lon, meters, profile, seed) {
  let lastErr;
  for (const base of ORS_BASES) {
    try {
      const r = await axios.post(`${base}/v2/directions/${profile}/geojson`, {
        coordinates: [[lon, lat]],
        options: { round_trip: { length: meters, points: 5, seed } },
        elevation: true,
        instructions: false,
        extra_info: ['surface', 'green'],
      }, { headers: { Authorization: process.env.ORS_API_KEY, 'Content-Type': 'application/json' }, timeout: 20000 });
      return r.data;
    } catch (e) {
      lastErr = e;
      if (e.response && e.response.status !== 404) throw e; // real API error: don't try other hosts
    }
  }
  throw lastErr;
}

function scoreRoute(r, { km, type, temp }) {
  let score = 100 - Math.abs(r.km - km) / Math.max(km, 1) * 120;          // right distance
  const climbPerKm = r.ascentM / Math.max(r.km, 0.1);
  if (HARD_TYPES.has(type)) score -= climbPerKm * 1.5;                      // fast work wants flat
  if (TRAIL_TYPES.has(type)) score += (r.unpavedPct ?? 0) * 0.4 + Math.min(climbPerKm, 40) * 0.5;
  if (type === 'recovery' || type === 'easy') score -= Math.max(0, climbPerKm - 15);
  if (temp != null && temp >= 24) score += (r.green ?? 0) * 3;              // heat → greener, shadier
  return score;
}

async function explain(best, others, ctx) {
  const why = TRAIL_TYPES.has(ctx.type) ? ['Tiene más sendero y desnivel para tu sesión de trail', 'Most trail and climbing for your trail session']
    : HARD_TYPES.has(ctx.type) ? ['Es la más plana, ideal para sostener el ritmo', 'Flattest option, ideal for holding pace']
    : ['Es la que mejor se ajusta a tu distancia de hoy', "Best match for today's distance"];
  const fallback = { es: `${why[0]}: ${best.km} km y ${best.ascentM} m de desnivel.`, en: `${why[1]}: ${best.km} km and ${best.ascentM} m of climbing.` };
  if (!process.env.ANTHROPIC_API_KEY) return fallback;
  try {
    const r = await axios.post('https://api.anthropic.com/v1/messages', {
      model: process.env.COACH_MODEL || 'claude-sonnet-5-5',
      max_tokens: 200,
      system: 'You are a running coach. In one sentence (max 28 words), say why this route suits today\'s session and weather. Use only the numbers given; never invent places or facts. Reply as JSON: {"es":"...","en":"..."}.',
      messages: [{ role: 'user', content: JSON.stringify({
        session: { type: ctx.type, targetKm: ctx.km },
        weather: ctx.weather || null,
        chosen: { km: best.km, climbM: best.ascentM, unpavedPct: best.unpavedPct, greenScore0to10: best.green },
        alternatives: others.map(o => ({ km: o.km, climbM: o.ascentM, unpavedPct: o.unpavedPct })),
      }) }],
    }, { headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, timeout: 20000 });
    const text = (r.data?.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    return (json.es && json.en) ? { es: String(json.es).slice(0, 220), en: String(json.en).slice(0, 220) } : fallback;
  } catch (e) {
    console.error('Route explain error:', e.response?.status || e.message);
    return fallback;
  }
}

function registerRoutes(app) {
  app.get('/api/routes/enabled', (req, res) => res.json({ enabled: Boolean(process.env.ORS_API_KEY) }));

  app.post('/api/routes', async (req, res) => {
    const es = req.body?.lang === 'es';
    if (!process.env.ORS_API_KEY) return res.status(503).json({ error: es ? 'Rutas no configuradas todavía.' : 'Routes are not configured yet.' });

    let user;
    try { user = await verifyFirebaseToken((req.headers.authorization || '').replace(/^Bearer /, '')); }
    catch { return res.status(401).json({ error: es ? 'Inicia sesión para ver rutas.' : 'Sign in to see routes.' }); }

    const lat = Number(req.body?.lat), lon = Number(req.body?.lon);
    const km = Math.min(42, Math.max(2, Number(req.body?.km) || 8));
    const type = String(req.body?.type || 'easy');
    const weather = req.body?.weather || null;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return res.status(400).json({ error: 'Bad location' });

    const key = [lat.toFixed(3), lon.toFixed(3), km, type, new Date().toISOString().slice(0, 10)].join('|');
    if (cache.has(key)) return res.json(cache.get(key));
    if (!takeQuota(user.sub)) return res.status(429).json({ error: es ? 'Llegaste al límite de rutas de hoy.' : "You've reached today's route limit." });

    const profile = TRAIL_TYPES.has(type) ? 'foot-hiking' : 'foot-walking';
    const seeds = [1, 2, 3];
    const results = await Promise.allSettled(seeds.map(seed => orsRoundTrip(lat, lon, Math.round(km * 1000), profile, seed)));
    const routes = results.flatMap((r, i) => {
      if (r.status !== 'fulfilled') { console.error('ORS error:', r.reason?.response?.status, JSON.stringify(r.reason?.response?.data || r.reason?.message).slice(0, 300)); return []; }
      const f = r.value?.features?.[0];
      if (!f) return [];
      const p = f.properties || {};
      const pts = simplify(f.geometry.coordinates);
      const unpaved = shareOf(p.extras?.surface, v => UNPAVED.has(v));
      const green = weightedAvg(p.extras?.green);
      return [{
        id: seeds[i],
        km: Math.round((p.summary?.distance || 0) / 100) / 10,
        ascentM: Math.round(p.ascent || 0),
        descentM: Math.round(p.descent || 0),
        unpavedPct: unpaved == null ? null : Math.round(unpaved * 100),
        green: green == null ? null : Math.round(green * 10) / 10,
        points: pts,
        mapsUrl: mapsUrl(pts),
      }];
    });
    if (!routes.length) return res.status(502).json({ error: es ? 'No encontramos rutas cerca de ti ahora.' : "We couldn't find routes near you right now." });

    const ctx = { km, type, temp: weather?.temp, weather };
    routes.sort((a, b) => scoreRoute(b, ctx) - scoreRoute(a, ctx));
    const reason = await explain(routes[0], routes.slice(1), ctx);
    const payload = { routes, best: 0, reason, source: 'OpenRouteService · © OpenStreetMap contributors' };
    cache.set(key, payload);
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    res.json(payload);
  });
}

module.exports = { registerRoutes, scoreRoute, shareOf, simplify, mapsUrl };
