// TrailReady AI coach: verifies the Firebase user, limits usage, asks Claude,
// and returns advice plus an optional plan change for the user to approve.
const crypto = require('crypto');
const axios = require('axios');

const FIREBASE_PROJECT = process.env.FIREBASE_PROJECT_ID || 'olympus-app-9de55';
const MODEL = process.env.COACH_MODEL || 'claude-sonnet-5-5';
const DAILY_LIMIT = Number(process.env.COACH_DAILY_LIMIT || 20);
const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// ── Firebase ID token verification (no extra dependencies) ──────
let certCache = { certs: null, exp: 0 };
async function getCerts() {
  if (certCache.certs && Date.now() < certCache.exp) return certCache.certs;
  const r = await axios.get(CERTS_URL, { timeout: 8000 });
  const maxAge = Number((r.headers['cache-control'] || '').match(/max-age=(\d+)/)?.[1] || 3600);
  certCache = { certs: r.data, exp: Date.now() + maxAge * 1000 };
  return r.data;
}
const b64json = (s) => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));

async function verifyFirebaseToken(token) {
  const [h, p, sig] = (token || '').split('.');
  if (!h || !p || !sig) throw new Error('malformed token');
  const header = b64json(h), payload = b64json(p);
  if (header.alg !== 'RS256') throw new Error('bad alg');
  const cert = (await getCerts())[header.kid];
  if (!cert) throw new Error('unknown key');
  const ok = crypto.createVerify('RSA-SHA256').update(`${h}.${p}`).verify(cert, Buffer.from(sig, 'base64url'));
  if (!ok) throw new Error('bad signature');
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error('expired');
  if (payload.aud !== FIREBASE_PROJECT || payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT}`) throw new Error('wrong project');
  if (!payload.sub) throw new Error('no subject');
  return payload;
}

// ── Daily limit per user (in memory; resets if the server restarts) ──
const usage = new Map();
function takeQuota(uid) {
  const day = new Date().toISOString().slice(0, 10);
  const u = usage.get(uid);
  const count = u && u.day === day ? u.count : 0;
  if (count >= DAILY_LIMIT) return { ok: false, remaining: 0 };
  usage.set(uid, { day, count: count + 1 });
  return { ok: true, remaining: DAILY_LIMIT - count - 1 };
}

const WORKOUT_TYPES = ['rest','easy','recovery','tempo','intervals','strides','longTrail','shortTrail','backToBack','strength','cross','mobility','walk','walk_run'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const TOOLS = [{
  name: 'propose_plan_change',
  description: 'Propose concrete changes to the runner\'s training plan. The runner sees them and must approve before anything changes. Use only when a change is warranted; otherwise just answer.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'One sentence, in the runner\'s language, describing the change.' },
      changes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            week: { type: 'integer', description: '1-based week number in the plan' },
            day: { type: 'string', enum: DAYS },
            type: { type: 'string', enum: WORKOUT_TYPES },
            km: { type: ['number', 'null'], description: 'Distance in km, null for rest/strength/mobility' },
            desc_es: { type: 'string' },
            desc_en: { type: 'string' },
          },
          required: ['week', 'day', 'type', 'km', 'desc_es', 'desc_en'],
        },
      },
    },
    required: ['summary', 'changes'],
  },
}];

function systemPrompt(lang) {
  const es = lang === 'es';
  return `You are the TrailReady running coach: experienced in trail and road running from 5K to ultras, practical and direct.
Reply in ${es ? 'Spanish' : 'English'}, short and concrete (under 180 words unless a protocol is requested). Use the runner's plan, week, race and history provided in context.

You can adjust the plan with the propose_plan_change tool: reduce load after pain or fatigue, move sessions when they lose days, rebalance after missed workouts. Keep changes minimal and only for upcoming days (from today on). Never change past weeks.

Safety rules (always):
- You are not a doctor or physical therapist. Do not diagnose.
- Red flags: sharp or worsening pain, swelling, pain that changes your gait, pain at rest or at night, numbness, chest pain, dizziness, fainting. Then tell them to stop running and see a professional, and propose rest/easy changes only.
- For a known injury, keep training conservative and suggest what to ask their PT.
- Never encourage racing or running through pain.

When the runner is deciding something (a race, a jump in distance), add one short "Devil's advocate" line with the main risk they may be missing.
When facts about a race are not given to you, say they are estimates and that they should confirm with the organizer. Never invent race details.
If a race analysis is provided, respect its format: timed, backyard and elimination-loop events are about sustaining effort, pacing per loop, fueling and recovering between laps, not just distance.`;
}

function planContext(body) {
  const { plan, raceData, profile, currentWeek = 0, completions = {}, lang } = body || {};
  const weeks = plan?.weeks || [];
  const today = new Date();
  const dow = DAYS[(today.getDay() + 6) % 7];
  const near = weeks.slice(Math.max(0, currentWeek - 1), currentWeek + 3).map((w, i) => ({
    week: Math.max(0, currentWeek - 1) + i + 1, phase: w.phase, kmTotal: w.kmTotal,
    workouts: (w.workouts || []).map(x => ({ day: x.day, type: x.type, km: x.km, desc: x.desc?.[lang === 'es' ? 'es' : 'en'] || x.desc })),
  }));
  const outline = weeks.map((w, i) => `${i + 1}:${w.phase}:${w.kmTotal}km`).join(' ');
  const done = Object.entries(completions).slice(-14).map(([k, v]) => `${k}=${v.status}`).join(', ');
  return `Today: ${today.toISOString().slice(0, 10)} (${dow}). Current plan week: ${currentWeek + 1} of ${weeks.length}.
Race: ${JSON.stringify({ name: raceData?.name, km: raceData?.distancia, elevationGainM: raceData?.desnivel, date: raceData?.fecha, terrain: raceData?.terreno })}
Race analysis from the official page (format, rules; 'confirmed' = stated on the page): ${raceData?.analysis ? JSON.stringify({ format: raceData.analysis.format, loopKm: raceData.analysis.loop_km, timeLimitHours: raceData.analysis.time_limit_hours, facts: (raceData.analysis.facts || []).map(f => `${f.label_en}: ${f.value_en}${f.confirmed ? '' : ' (estimated)'}`), yourEarlierRead: raceData.analysis.insight?.en }) : 'none'}
Runner interests: ${JSON.stringify(body?.interests || [])}
Runner profile: ${JSON.stringify(profile || {})}
Plan outline (week:phase:km): ${outline}
Nearby weeks in detail: ${JSON.stringify(near)}
Recent check-ins (weekIndex_dayIndex=status, 0-based): ${done || 'none'}`;
}

function sanitizeProposal(input, weeksLen) {
  if (!input || !Array.isArray(input.changes)) return null;
  const changes = input.changes.filter(c =>
    Number.isInteger(c.week) && c.week >= 1 && c.week <= weeksLen &&
    DAYS.includes(c.day) && WORKOUT_TYPES.includes(c.type)
  ).slice(0, 21).map(c => ({ ...c, km: typeof c.km === 'number' && c.km >= 0 && c.km <= 80 ? Math.round(c.km * 10) / 10 : null }));
  return changes.length ? { summary: String(input.summary || '').slice(0, 300), changes } : null;
}

function registerCoach(app) {
  app.post('/api/coach', async (req, res) => {
    const es = req.body?.lang === 'es';
    if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: es ? 'El coach no está configurado todavía.' : 'Coach is not configured yet.' });

    let user;
    try {
      user = await verifyFirebaseToken((req.headers.authorization || '').replace(/^Bearer /, ''));
    } catch (e) {
      return res.status(401).json({ error: es ? 'Inicia sesión para usar el coach.' : 'Sign in to use the coach.' });
    }

    const quota = takeQuota(user.sub);
    if (!quota.ok) return res.status(429).json({ error: es ? `Llegaste al límite de ${DAILY_LIMIT} mensajes de hoy. Vuelve mañana.` : `You reached today's limit of ${DAILY_LIMIT} messages. Come back tomorrow.` });

    const history = (Array.isArray(req.body?.messages) ? req.body.messages : [])
      .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (!history.length || history[history.length - 1].role !== 'user') return res.status(400).json({ error: 'No message' });
    while (history.length && history[0].role !== 'user') history.shift();

    try {
      const r = await axios.post('https://api.anthropic.com/v1/messages', {
        model: MODEL,
        max_tokens: 1200,
        system: systemPrompt(req.body?.lang) + '\n\n--- Runner context ---\n' + planContext(req.body),
        tools: TOOLS,
        messages: history,
      }, {
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        timeout: 60000,
      });
      const blocks = r.data?.content || [];
      const text = blocks.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
      const tool = blocks.find(b => b.type === 'tool_use' && b.name === 'propose_plan_change');
      const proposal = sanitizeProposal(tool?.input, req.body?.plan?.weeks?.length || 0);
      res.json({ text: text || proposal?.summary || '', proposal, remaining: quota.remaining });
    } catch (e) {
      console.error('Coach error:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 500));
      res.status(502).json({ error: es ? 'El coach no respondió. Intenta de nuevo en un momento.' : 'The coach did not respond. Try again in a moment.' });
    }
  });
}

module.exports = { registerCoach, verifyFirebaseToken, sanitizeProposal, planContext };
