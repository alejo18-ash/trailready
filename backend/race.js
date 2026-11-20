// Reads a race page like a coach would: format, rules, what's confirmed vs. assumed,
// and what that means for training. Claude extracts; it never fills gaps silently.
const axios = require('axios');
const cheerio = require('cheerio');
const dns = require('dns').promises;
const net = require('net');

const MODEL = process.env.COACH_MODEL || 'claude-sonnet-5-5';
const PER_IP_DAILY = Number(process.env.RACE_DAILY_LIMIT || 10);
const usage = new Map();
const cache = new Map();

function takeQuota(ip) {
  const day = new Date().toISOString().slice(0, 10);
  const u = usage.get(ip);
  const n = u && u.day === day ? u.count : 0;
  if (n >= PER_IP_DAILY) return false;
  usage.set(ip, { day, count: n + 1 });
  return true;
}

// Only public http(s) pages: refuse localhost / private networks.
async function assertPublicUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { throw new Error('bad url'); }
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('bad url');
  const host = u.hostname;
  const addrs = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map(a => a.address);
  const priv = (ip) => /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|::1|fc|fd|fe80)/i.test(ip);
  if (!addrs.length || addrs.some(priv)) throw new Error('bad url');
  return u.toString();
}

async function pageText(startUrl) {
  // Follow redirects by hand so every hop is checked against private networks.
  let url = startUrl, data;
  for (let hop = 0; hop < 4; hop++) {
    const r = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (TrailReady race reader)', 'Accept-Language': 'en,es;q=0.8' },
      timeout: 12000, maxContentLength: 3 * 1024 * 1024, responseType: 'text',
      maxRedirects: 0, validateStatus: (st) => st >= 200 && st < 400,
    });
    if (r.status >= 300 && r.headers.location) { url = await assertPublicUrl(new URL(r.headers.location, url).toString()); continue; }
    data = r.data; break;
  }
  if (typeof data !== 'string') throw new Error('too many redirects');
  const $ = cheerio.load(data);
  $('script, style, noscript, svg, iframe, nav, footer, header form').remove();
  const title = $('title').first().text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  return { title, text: `${title}\n${metaDesc}\n${text}`.slice(0, 18000) };
}

const TOOL = {
  name: 'report_race',
  description: 'Report what the race page says. Only state facts the page supports; mark everything else as estimated.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      date: { type: ['string', 'null'], description: 'YYYY-MM-DD if the page states it, else null' },
      location: { type: ['string', 'null'] },
      format: { type: 'string', enum: ['fixed_distance', 'timed', 'backyard', 'elimination_loop', 'stage_race', 'other'] },
      distances_km: { type: 'array', items: { type: 'number' }, description: 'All race distances offered, in km' },
      loop_km: { type: ['number', 'null'] },
      time_limit_hours: { type: ['number', 'null'], description: 'Duration of a timed event or overall cutoff' },
      elevation_gain_m: { type: ['number', 'null'] },
      terrain: { type: 'string', enum: ['road', 'trail', 'technical', 'mountain', 'mixed'] },
      facts: {
        type: 'array',
        description: 'Key facts for training, each marked confirmed (stated on the page) or estimated',
        items: { type: 'object', properties: {
          label_es: { type: 'string' }, label_en: { type: 'string' },
          value_es: { type: 'string' }, value_en: { type: 'string' },
          confirmed: { type: 'boolean' },
        }, required: ['label_es', 'label_en', 'value_es', 'value_en', 'confirmed'] },
      },
      training_km_equivalent: { type: 'number', description: 'Distance (km) to build the training plan around. For timed/loop formats, a realistic target for a mid-pack runner; say so in the insight.' },
      coach_insight_es: { type: 'string', description: 'Max 90 words, Spanish. Like a coach reading the race: what it really demands, what a runner would wrongly assume, and how training changes.' },
      coach_insight_en: { type: 'string', description: 'Same insight in English.' },
    },
    required: ['name', 'format', 'distances_km', 'terrain', 'facts', 'training_km_equivalent', 'coach_insight_es', 'coach_insight_en'],
  },
};

const SYSTEM = `You are an experienced trail and ultra running coach reading a race's official page for an athlete.
Extract the race format and rules precisely. Distinguish fixed-distance races from timed events, backyard ultras and elimination/loop formats.
Never invent numbers: if the page does not state something, leave it null or mark the fact as estimated (confirmed=false).
Today's date: ${new Date().toISOString().slice(0, 10)}. If the page lists several editions, use the next upcoming one.
Always call report_race.`;

function sanitize(r) {
  const num = (x, max) => (typeof x === 'number' && isFinite(x) && x >= 0 && x <= max ? Math.round(x * 10) / 10 : null);
  const date = typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : null;
  return {
    name: String(r.name || '').slice(0, 120),
    date, location: r.location ? String(r.location).slice(0, 120) : null,
    format: r.format, terrain: r.terrain,
    distances_km: (r.distances_km || []).map(d => num(d, 1000)).filter(Boolean).slice(0, 8),
    loop_km: num(r.loop_km, 200), time_limit_hours: num(r.time_limit_hours, 400),
    elevation_gain_m: num(r.elevation_gain_m, 30000),
    facts: (r.facts || []).slice(0, 10).map(f => ({ ...f, confirmed: !!f.confirmed })),
    training_km_equivalent: num(r.training_km_equivalent, 400) || null,
    insight: { es: String(r.coach_insight_es || '').slice(0, 700), en: String(r.coach_insight_en || '').slice(0, 700) },
  };
}

function registerRace(app) {
  app.post('/api/race/analyze', async (req, res) => {
    const es = req.body?.lang === 'es';
    const fail = (status, es_, en_) => res.status(status).json({ success: false, message: es ? es_ : en_ });
    if (!process.env.ANTHROPIC_API_KEY) return fail(503, 'El análisis con IA no está disponible.', 'AI analysis is not available.');

    let url;
    try { url = await assertPublicUrl(String(req.body?.url || '').trim()); }
    catch { return fail(400, 'Ese link no es válido.', "That link isn't valid."); }

    if (cache.has(url)) return res.json(cache.get(url));
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (!takeQuota(ip)) return fail(429, 'Llegaste al límite de análisis de hoy.', "You've reached today's analysis limit.");

    let page;
    try { page = await pageText(url); }
    catch (e) { console.error('Race fetch error:', e.message); return fail(502, 'No pudimos abrir esa página. Revisa el link o ingresa los datos a mano.', "We couldn't open that page. Check the link or enter the details manually."); }
    if (page.text.length < 200) return fail(422, 'La página casi no tiene texto (puede necesitar iniciar sesión). Ingresa los datos a mano.', 'The page has almost no text (it may need a login). Enter the details manually.');

    try {
      const r = await axios.post('https://api.anthropic.com/v1/messages', {
        model: MODEL, max_tokens: 1500, system: SYSTEM,
        tools: [TOOL], tool_choice: { type: 'tool', name: 'report_race' },
        messages: [{ role: 'user', content: `Race page (${url}):\n\n${page.text}` }],
      }, { headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, timeout: 60000 });
      const tool = (r.data?.content || []).find(b => b.type === 'tool_use');
      if (!tool) throw new Error('no tool output');
      const payload = { success: true, url, race: sanitize(tool.input) };
      cache.set(url, payload);
      if (cache.size > 300) cache.delete(cache.keys().next().value);
      res.json(payload);
    } catch (e) {
      console.error('Race analyze error:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 400));
      fail(502, 'No pudimos analizar la carrera ahora. Intenta de nuevo o ingrésala a mano.', "We couldn't analyze the race right now. Try again or enter it manually.");
    }
  });
}

module.exports = { registerRace, sanitize, assertPublicUrl };
