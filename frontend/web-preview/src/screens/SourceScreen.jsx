import { useState } from 'react';
import { t } from '../i18n';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const s = {
  wrap: { minHeight:'100vh', background:'#F0F4F8', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter', system-ui, sans-serif" },
  card: { width:'100%', maxWidth:340 },
  header: { textAlign:'center', marginBottom:20 },
  logo: { fontSize:12, color:'rgba(18,29,41,0.62)', letterSpacing:0.5, marginBottom:6 },
  heading: { fontSize:32, fontWeight:700, color:'#121D29', fontFamily:'var(--font-display)', lineHeight:1.05 },
  option: (active) => ({
    display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
    background: active ? 'rgba(234,42,48,0.08)' : '#FFFFFF',
    border: active ? '1px solid rgba(234,42,48,0.25)' : '0.5px solid rgba(18,29,41,0.1)',
    borderRadius:12, marginBottom:6, cursor:'pointer',
    boxShadow: active ? 'none' : '0 1px 3px rgba(18,29,41,0.04)',
  }),
  iconBox: (active) => ({
    width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
    background: active ? 'rgba(234,42,48,0.1)' : 'rgba(18,29,41,0.05)', flexShrink:0,
  }),
  optTitle: (active) => ({ fontSize:13, fontWeight:600, color: active ? '#121D29' : 'rgba(18,29,41,0.65)' }),
  optSub: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:2 },
  check: { marginLeft:'auto', width:16, height:16, borderRadius:'50%', background:'#EA2A30', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#FFFFFF', fontWeight:700, flexShrink:0 },
  divider: { height:'0.5px', background:'rgba(18,29,41,0.08)', margin:'12px 0' },
  label: { fontSize:12, color:'rgba(18,29,41,0.62)', marginBottom:6, display:'block' },
  input: { width:'100%', background:'#FFFFFF', border:'0.5px solid rgba(18,29,41,0.12)', borderRadius:10, padding:'11px 13px', color:'#121D29', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:8 },
  upload: (hasFile) => ({
    display:'block', border: hasFile ? '1.5px solid rgba(234,42,48,0.4)' : '1.5px dashed rgba(18,29,41,0.15)',
    borderRadius:12, padding:'18px', textAlign:'center', cursor:'pointer',
    color: hasFile ? '#EA2A30' : 'rgba(18,29,41,0.64)', fontSize:12, marginBottom:8,
    background: hasFile ? 'rgba(234,42,48,0.06)' : 'transparent',
  }),
  gpxInfo: { background:'rgba(234,42,48,0.06)', border:'0.5px solid rgba(234,42,48,0.15)', borderRadius:10, padding:'10px 12px', marginBottom:8 },
  gpxRow: { display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 },
  gpxKey: { color:'rgba(18,29,41,0.62)' },
  gpxVal: { color:'#EA2A30', fontWeight:600 },
  stravaBox: { background:'rgba(252,76,2,0.06)', border:'0.5px solid rgba(252,76,2,0.2)', borderRadius:12, padding:'14px', marginBottom:8 },
  stravaBtn: { display:'block', background:'#FC4C02', borderRadius:9, padding:'11px', textAlign:'center', fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', marginBottom:8, border:'none', width:'100%' },
  stravaOr: { textAlign:'center', fontSize:12, color:'rgba(18,29,41,0.62)', margin:'8px 0' },
  manualRow: { marginBottom:8 },
  select: { width:'100%', background:'#FFFFFF', border:'0.5px solid rgba(18,29,41,0.12)', borderRadius:10, padding:'11px 13px', color:'#121D29', fontSize:13, outline:'none', boxSizing:'border-box' },
  btn: (loading, disabled) => ({
    marginTop:12, background: disabled ? 'rgba(234,42,48,0.3)' : loading ? 'rgba(234,42,48,0.6)' : '#EA2A30',
    borderRadius:12, padding:13, textAlign:'center', fontSize:13, fontWeight:600, color:'#fff',
    cursor: disabled || loading ? 'default' : 'pointer', border:'none', width:'100%',
  }),
  error: { color:'#EA2A30', fontSize:12, textAlign:'center', marginTop:8 },
  distancePicker: { marginBottom:8 },
  distanceRow: { display:'flex', gap:6, flexWrap:'wrap', marginTop:6 },
  distBtn: (active) => ({
    padding:'7px 13px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
    background: active ? 'rgba(234,42,48,0.1)' : 'rgba(18,29,41,0.04)',
    border: active ? '1px solid rgba(234,42,48,0.25)' : '0.5px solid rgba(18,29,41,0.09)',
    color: active ? '#EA2A30' : 'rgba(18,29,41,0.64)',
  }),
};

export default function SourceScreen({ lang, onNext }) {
  const [goal, setGoal]           = useState(null); // null | 'race' | 'base' | 'prebase'
  const [tab, setTab]             = useState('gpx');
  const [gpxFile, setGpxFile]     = useState(null);
  const [gpxData, setGpxData]     = useState(null);
  const [url, setUrl]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [manual, setManual]       = useState({ name:'', distancia:'', desnivel:'', fecha:'', terreno:'mountain' });

  const set = (k, v) => setManual(m => ({ ...m, [k]: v }));

  const calcWeeks = (fecha) => {
    if (!fecha) return 24;
    const diff = new Date(fecha) - new Date();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)));
  };

  // ── GPX Upload ──────────────────────────────────────────────
  const normalizeGpxRaceData = (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    const n = (v, fallback = 0) => {
      if (v === null || v === undefined || v === '') return fallback;
      const num = Number(v);
      return Number.isFinite(num) ? num : fallback;
    };
    return {
      name: raw.name ?? 'Race Course',
      distancia: n(raw.distancia),
      desnivel: n(raw.desnivel ?? raw.elevationGain ?? raw.desnivel_positivo ?? raw.dPlus),
      desnivelNeg: n(raw.desnivelNeg ?? raw.desnivel_negativo ?? raw.elevationLoss ?? raw.dMinus),
      elevMax: n(raw.elevMax ?? raw.elev_max ?? raw.maxElevation),
      elevMin: n(raw.elevMin ?? raw.elev_min ?? raw.minElevation),
      terreno: raw.terreno ?? raw.terrain ?? 'mixed',
      hasElevation: Boolean(raw.hasElevation),
      pointCount: raw.pointCount != null ? n(raw.pointCount, 0) : undefined,
      source: raw.source ?? 'gpx',
      profile: raw.profile,
    };
  };

  const handleGpxChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGpxFile(file);
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('gpx', file);
      const res = await fetch(`${API_URL}/api/parse-gpx`, { method:'POST', body: formData });
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        setError(data.message || `Server error (${res.status})`);
        setGpxData(null);
        return;
      }
      if (data.success) {
        const raw = data.raceData ?? data.data?.raceData;
        const normalized = normalizeGpxRaceData(raw);
        setGpxData(normalized);
        if (!normalized) setError(data.message || 'Invalid race data from server');
      } else {
        setGpxData(null);
        setError(data.message || 'Could not parse GPX');
      }
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  const handleGpxNext = () => {
    if (!gpxData) return setError('Upload a GPX file first');
    onNext({ ...gpxData, weeksAvailable: 24 });
  };

  // ── Web Link ────────────────────────────────────────────────
  const FORMAT = {
    fixed_distance:   { es:'Distancia fija', en:'Fixed distance' },
    timed:            { es:'Por tiempo', en:'Timed' },
    backyard:         { es:'Backyard (vueltas cada hora)', en:'Backyard (hourly loops)' },
    elimination_loop: { es:'Vueltas con eliminación', en:'Elimination loops' },
    stage_race:       { es:'Por etapas', en:'Stage race' },
    other:            { es:'Otro formato', en:'Other format' },
  };
  const [race, setRace] = useState(null);          // what the coach read
  const [conf, setConf] = useState(null);          // what the runner confirms

  const handleWeb = async () => {
    if (!url.trim()) return setError(lang==='es' ? 'Pega el link de la carrera' : 'Paste the race link');
    setLoading(true); setError(''); setRace(null); setConf(null);
    try {
      const res = await fetch(`${API_URL}/api/race/analyze`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ url: url.trim(), lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || (lang==='es' ? 'No pudimos analizar la carrera.' : "Couldn't analyze the race."));
      const r = data.race;
      setRace(r);
      setConf({
        name: r.name || '',
        fecha: r.date || '',
        distancia: r.training_km_equivalent || r.distances_km?.[0] || '',
        desnivel: r.elevation_gain_m ?? '',
        terreno: r.terrain === 'road' ? 'flat' : r.terrain === 'technical' ? 'technical' : r.terrain === 'mountain' ? 'mountain' : 'mixed',
      });
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const handleWebNext = () => {
    if (!race || !conf) return;
    const es = lang === 'es';
    if (!conf.fecha) return setError(es ? 'Confirma la fecha de la carrera.' : 'Confirm the race date.');
    if (new Date(conf.fecha + 'T23:59:59') < new Date()) return setError(es ? 'La fecha de la carrera ya pasó.' : 'Race date is in the past.');
    if (!Number(conf.distancia)) return setError(es ? 'Pon la distancia para tu plan.' : 'Set the distance for your plan.');
    onNext({
      name: conf.name || race.name, distancia: Number(conf.distancia), desnivel: Number(conf.desnivel) || 0,
      fecha: conf.fecha, weeksAvailable: calcWeeks(conf.fecha), terreno: conf.terreno, source:'web', url: url.trim(),
      analysis: { format: race.format, distances_km: race.distances_km, loop_km: race.loop_km, time_limit_hours: race.time_limit_hours, location: race.location, facts: race.facts, insight: race.insight, readAt: Date.now() },
    });
  };

  // ── Manual ──────────────────────────────────────────────────
  const handleManual = () => {
    const { name, distancia, desnivel, fecha } = manual;
    if (!name || !distancia || !desnivel || !fecha) return setError(lang==='es' ? 'Completa todos los campos' : 'Fill in all fields');
    if (new Date(fecha + 'T23:59:59') < new Date()) return setError(lang==='es' ? 'La fecha de la carrera ya pasó' : 'Race date is in the past');
    onNext({ name, distancia: Number(distancia), desnivel: Number(desnivel), fecha, weeksAvailable: calcWeeks(fecha), terreno: manual.terreno, source:'manual' });
  };

  const handleBaseNext = () => {
    onNext({
      name: lang === 'es' ? 'Plan Base' : 'Base Plan',
      nombre: lang === 'es' ? 'Plan Base' : 'Base Plan',
      distancia: 0,
      desnivel: 0,
      isBasePlan: true,
      weeksAvailable: 8,
      source: 'base',
    });
  };

  const handlePreBaseNext = () => {
    onNext({
      name: lang === 'es' ? 'Plan Pre-Base' : 'Pre-Base Plan',
      nombre: lang === 'es' ? 'Plan Pre-Base' : 'Pre-Base Plan',
      distancia: 0,
      desnivel: 0,
      isPreBase: true,
      weeksAvailable: 4,
      source: 'prebase',
    });
  };

  const GOAL_CARDS = [
    { id:'race',    icon:'flag', label: lang==='es' ? 'Plan de Carrera — Tengo una carrera' : 'Race Plan — I have a race', sub: lang==='es' ? 'Trail o asfalto, 21K–100K' : 'Trail or road, 21K–100K', disabled: false },
    { id:'base',    icon:'activity', label: lang==='es' ? 'Plan Base — Construir mi base' : 'Base Plan — Build my base', sub: lang==='es' ? 'Aeróbico sólido antes de un plan' : 'Solid aerobic engine before a plan', disabled: false },
    { id:'prebase', icon:'footprints', label: lang==='es' ? 'Soy principiante' : "I'm a beginner", sub: lang==='es' ? 'Empezar desde cero, 4 semanas' : 'Start from scratch, 4 weeks', disabled: false },
    { id:'rehab',   icon:'heart', label: lang==='es' ? 'Plan de Recuperación — Rehab' : 'Recovery Plan — Rehab', sub: lang==='es' ? 'Próximamente' : 'Coming soon', disabled: true },
  ];

  const RACE_TABS = [
    { id:'gpx',    icon:'file', label: t(lang, 'sourcePdf'),    sub: t(lang, 'sourcePdfSub') },
    { id:'web',    icon:'link', label: t(lang, 'sourceWeb'),    sub: t(lang, 'sourceWebSub') },
    { id:'manual', icon:'pencil', label: t(lang, 'sourceManual'), sub: t(lang, 'sourceManualSub') },
  ];

  return (
    <div className="screen-enter" style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ ...s.logo, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><Logo size={20} /> TRAILREADY</div>
          {goal && (
            <button
              type="button"
              onClick={() => { setGoal(null); setError(''); }}
              style={{ background:'none', border:'none', color:'rgba(18,29,41,0.62)', fontSize:12, cursor:'pointer', marginBottom:6, fontFamily:'inherit', padding:0 }}
            >
              ← {lang==='es' ? 'Volver' : 'Back'}
            </button>
          )}
          <div style={s.heading}>
            {!goal
              ? (lang==='es' ? '¿Cuál es tu objetivo?' : "What's your goal?")
              : goal === 'race'
                ? (lang==='es' ? '¿Cómo agregamos tu carrera?' : 'How do we add your race?')
                : goal === 'base'
                  ? t(lang, 'sourceOptions.base')
                  : t(lang, 'sourceOptions.prebase')
            }
          </div>
        </div>

        {/* ── STEP 1: Goal selection ── */}
        {!goal && GOAL_CARDS.map(gc => (
          <div
            key={gc.id}
            style={{
              ...s.option(false),
              opacity: gc.disabled ? 0.4 : 1,
              cursor: gc.disabled ? 'default' : 'pointer',
            }}
            onClick={() => { if (!gc.disabled) { setGoal(gc.id); setError(''); } }}
          >
            <div style={s.iconBox(false)}><Icon name={gc.icon} size={20} /></div>
            <div style={{flex:1}}>
              <div style={s.optTitle(false)}>{gc.label}</div>
              <div style={s.optSub}>{gc.sub}</div>
            </div>
          </div>
        ))}

        {/* ── STEP 2a: Race — sub-tabs ── */}
        {goal === 'race' && (
          <>
            {RACE_TABS.map(tb => (
              <div key={tb.id} style={s.option(tab===tb.id)} onClick={() => { setTab(tb.id); setError(''); }}>
                <div style={s.iconBox(tab===tb.id)}><Icon name={tb.icon} size={20} /></div>
                <div style={{flex:1}}>
                  <div style={s.optTitle(tab===tb.id)}>{tb.label}</div>
                  <div style={s.optSub}>{tb.sub}</div>
                </div>
                {tab===tb.id && <div style={s.check}>✓</div>}
              </div>
            ))}

            <div style={s.divider} />

            {tab==='gpx' && (
              <>
                <label style={s.upload(!!gpxFile)}>
                  <input type="file" accept=".gpx" style={{display:'none'}} onChange={handleGpxChange} />
                  {loading ? (lang==='es' ? '⏳ Analizando GPX...' : '⏳ Parsing GPX...') :
                   gpxFile ? `✓ ${gpxFile.name}` :
                   (lang==='es' ? '+ Subir archivo .gpx' : '+ Upload .gpx file')}
                </label>
                {gpxData && (
                  <div style={s.gpxInfo}>
                    {[
                      [lang==='es' ? 'Nombre' : 'Name', gpxData.name],
                      [lang==='es' ? 'Distancia' : 'Distance', `${gpxData.distancia} km`],
                      ['D+', `${Number(gpxData.desnivel).toLocaleString()} m`],
                      ['D-', `${Number(gpxData.desnivelNeg).toLocaleString()} m`],
                      [lang==='es' ? 'Elevación máx' : 'Max elevation', `${Number(gpxData.elevMax).toLocaleString()} m`],
                      [lang==='es' ? 'Elevación mín' : 'Min elevation', `${Number(gpxData.elevMin).toLocaleString()} m`],
                      [lang==='es' ? 'Terreno' : 'Terrain', gpxData.terreno],
                    ].map(([k, v]) => (
                      <div key={k} style={s.gpxRow}>
                        <span style={s.gpxKey}>{k}</span>
                        <span style={s.gpxVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button style={s.btn(loading, !gpxData)} onClick={handleGpxNext} disabled={!gpxData || loading}>
                  {lang==='es' ? 'Continuar →' : 'Continue →'}
                </button>
              </>
            )}

            {tab==='web' && (
              <>
                {!race && (
                  <>
                    <input style={{ ...s.input, fontSize:16 }} type="url" inputMode="url" placeholder="https://ultrasignup.com/..." value={url} onChange={e => setUrl(e.target.value)} aria-label={lang==='es' ? 'Link de la carrera' : 'Race link'} />
                    <button style={s.btn(loading, false)} onClick={handleWeb} disabled={loading}>
                      {loading ? (lang==='es' ? 'El coach está leyendo la carrera…' : 'Your coach is reading the race…') : (lang==='es' ? 'Analizar con el coach' : 'Analyze with the coach')}
                    </button>
                    {error && (
                      <button type="button" onClick={() => { setError(''); setTab('manual'); }} style={{ display:'block', margin:'8px auto 0', background:'none', border:'none', color:'#EA2A30', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', minHeight:44 }}>
                        {lang==='es' ? 'Ingresarla a mano' : 'Enter it manually'}
                      </button>
                    )}
                  </>
                )}
                {race && conf && (
                  <div>
                    <div style={{ background:'#121D29', color:'#fff', borderRadius:16, padding:16, marginBottom:12 }}>
                      <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:'#FF8A8E', textTransform:'uppercase', marginBottom:6 }}>
                        {lang==='es' ? 'Lectura del coach' : "Coach's read"} · {FORMAT[race.format]?.[lang==='es' ? 'es' : 'en']}
                      </div>
                      <div style={{ fontSize:14, lineHeight:1.55, color:'rgba(255,255,255,0.92)' }}>{race.insight?.[lang==='es' ? 'es' : 'en']}</div>
                    </div>
                    {race.facts?.length > 0 && (
                      <div style={{ background:'#fff', borderRadius:16, border:'1px solid rgba(18,29,41,0.08)', padding:'8px 14px', marginBottom:12 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'rgba(18,29,41,0.66)', margin:'6px 0' }}>{lang==='es' ? 'Lo que encontré en la página' : 'What I found on the page'}</div>
                        {race.facts.map((f, i) => (
                          <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:10, padding:'8px 0', borderTop: i ? '1px solid rgba(18,29,41,0.06)' : 'none', fontSize:13 }}>
                            <span style={{ color:'rgba(18,29,41,0.66)' }}>{lang==='es' ? f.label_es : f.label_en}</span>
                            <span style={{ textAlign:'right', color:'#121D29', fontWeight:600 }}>
                              {lang==='es' ? f.value_es : f.value_en}
                              <span style={{ display:'block', fontSize:12, fontWeight:600, color: f.confirmed ? '#15803d' : '#b45309' }}>
                                {f.confirmed ? (lang==='es' ? '✓ confirmado' : '✓ confirmed') : (lang==='es' ? '~ estimado' : '~ estimated')}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize:13, fontWeight:600, color:'#121D29', margin:'4px 0 8px' }}>{lang==='es' ? 'Confirma o corrige antes de crear el plan:' : 'Confirm or fix before creating the plan:'}</div>
                    <label style={s.label}>{lang==='es' ? 'Nombre' : 'Name'}</label>
                    <input style={{ ...s.input, fontSize:16 }} value={conf.name} onChange={e => setConf({ ...conf, name:e.target.value })} />
                    <label style={s.label}>{lang==='es' ? 'Fecha de la carrera' : 'Race date'}{!race.date && <b style={{ color:'#b45309' }}> · {lang==='es' ? 'no estaba en la página' : 'not on the page'}</b>}</label>
                    <input style={{ ...s.input, fontSize:16 }} type="date" value={conf.fecha} onChange={e => setConf({ ...conf, fecha:e.target.value })} />
                    {race.distances_km?.length > 1 && (
                      <div style={s.distanceRow}>
                        {race.distances_km.map(d => (
                          <button type="button" key={d} style={{ ...s.distBtn(Number(conf.distancia)===d), fontFamily:'inherit', minHeight:36 }} onClick={() => setConf({ ...conf, distancia:d })}>{d} km</button>
                        ))}
                      </div>
                    )}
                    <label style={{ ...s.label, marginTop:8 }}>{lang==='es' ? 'Distancia para tu plan (km)' : 'Distance for your plan (km)'}{['timed','backyard','elimination_loop'].includes(race.format) && <b style={{ color:'#b45309' }}> · {lang==='es' ? 'tu objetivo' : 'your target'}</b>}</label>
                    <input style={{ ...s.input, fontSize:16 }} type="number" inputMode="decimal" value={conf.distancia} onChange={e => setConf({ ...conf, distancia:e.target.value })} />
                    <label style={s.label}>{lang==='es' ? 'Desnivel positivo (m)' : 'Elevation gain (m)'}{race.elevation_gain_m == null && <b style={{ color:'#b45309' }}> · {lang==='es' ? 'no estaba en la página' : 'not on the page'}</b>}</label>
                    <input style={{ ...s.input, fontSize:16 }} type="number" inputMode="numeric" value={conf.desnivel} onChange={e => setConf({ ...conf, desnivel:e.target.value })} placeholder="0" />
                    <label style={s.label}>{lang==='es' ? 'Terreno' : 'Terrain'}</label>
                    <select style={{ ...s.select, fontSize:16 }} value={conf.terreno} onChange={e => setConf({ ...conf, terreno:e.target.value })}>
                      <option value="mountain">{lang==='es' ? 'Montaña' : 'Mountain'}</option>
                      <option value="technical">{lang==='es' ? 'Técnico' : 'Technical'}</option>
                      <option value="mixed">{lang==='es' ? 'Mixto' : 'Mixed'}</option>
                      <option value="flat">{lang==='es' ? 'Plano / asfalto' : 'Flat / road'}</option>
                    </select>
                    <button style={s.btn(false, false)} onClick={handleWebNext}>{lang==='es' ? 'Crear mi plan con esto →' : 'Create my plan with this →'}</button>
                    <button type="button" onClick={() => { setRace(null); setConf(null); }} style={{ display:'block', margin:'8px auto 0', background:'none', border:'none', color:'rgba(18,29,41,0.66)', fontSize:13, cursor:'pointer', fontFamily:'inherit', minHeight:44 }}>
                      {lang==='es' ? 'Probar otro link' : 'Try another link'}
                    </button>
                  </div>
                )}
              </>
            )}

            {tab==='manual' && (
              <>
                {[
                  { key:'name',      label: lang==='es' ? 'Nombre de la carrera' : 'Race name',       placeholder:'Thunderbunny Trail Race', type:'text' },
                  { key:'distancia', label: lang==='es' ? 'Distancia (km)'       : 'Distance (km)',    placeholder:'21',  type:'number' },
                  { key:'desnivel',  label: lang==='es' ? 'Desnivel positivo (m)': 'Elevation gain (m)', placeholder:'1200', type:'number' },
                  { key:'fecha',     label: lang==='es' ? 'Fecha de la carrera'  : 'Race date',        placeholder:'', type:'date' },
                ].map(f => (
                  <div key={f.key} style={s.manualRow}>
                    <label style={s.label}>{f.label}</label>
                    <input style={s.input} type={f.type} placeholder={f.placeholder} value={manual[f.key]} onChange={e => set(f.key, e.target.value)} />
                  </div>
                ))}
                <div style={s.manualRow}>
                  <label style={s.label}>{lang==='es' ? 'Tipo de terreno' : 'Terrain type'}</label>
                  <select style={s.select} value={manual.terreno} onChange={e => set('terreno', e.target.value)}>
                    <option value="mountain">{lang==='es' ? 'Montaña' : 'Mountain'}</option>
                    <option value="technical">{lang==='es' ? 'Técnico' : 'Technical'}</option>
                    <option value="mixed">{lang==='es' ? 'Mixto' : 'Mixed'}</option>
                    <option value="road">{lang==='es' ? 'Ruta' : 'Road'}</option>
                  </select>
                </div>
                <button style={s.btn(false, false)} onClick={handleManual}>
                  {lang==='es' ? 'Continuar →' : 'Continue →'}
                </button>
              </>
            )}
          </>
        )}

        {/* ── STEP 2b: Base plan ── */}
        {goal === 'base' && (
          <>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.55, marginBottom:10 }}>
              {t(lang, 'basePlan.subtitle')}
            </div>
            <button style={s.btn(false, false)} onClick={handleBaseNext}>
              {lang==='es' ? 'Continuar →' : 'Continue →'}
            </button>
          </>
        )}

        {/* ── STEP 2c: Pre-base plan ── */}
        {goal === 'prebase' && (
          <>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.55, marginBottom:10 }}>
              {t(lang, 'prebase.subtitle')}
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.55, marginBottom:16, fontStyle:'italic' }}>
              {t(lang, 'prebase.coachNote')}
            </div>
            <button style={s.btn(false, false)} onClick={handlePreBaseNext}>
              {lang==='es' ? 'Continuar →' : 'Continue →'}
            </button>
          </>
        )}

        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  );
}