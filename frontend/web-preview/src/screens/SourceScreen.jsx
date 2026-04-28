import { useState } from 'react';
import { t } from '../i18n';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const s = {
  wrap: { minHeight:'100vh', background:'#0d0d1a', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'system-ui, sans-serif' },
  card: { width:'100%', maxWidth:340 },
  header: { textAlign:'center', marginBottom:20 },
  logo: { fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:6 },
  heading: { fontSize:20, fontWeight:700, color:'#fff' },
  option: (active) => ({
    display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
    background: active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
    border: active ? '1px solid rgba(74,222,128,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
    borderRadius:12, marginBottom:6, cursor:'pointer',
  }),
  iconBox: (active) => ({
    width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
    background: active ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)', flexShrink:0,
  }),
  optTitle: (active) => ({ fontSize:13, fontWeight:600, color: active ? '#fff' : 'rgba(255,255,255,0.6)' }),
  optSub: { fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2 },
  check: { marginLeft:'auto', width:16, height:16, borderRadius:'50%', background:'#4ade80', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#0d0d1a', fontWeight:700, flexShrink:0 },
  divider: { height:'0.5px', background:'rgba(255,255,255,0.07)', margin:'12px 0' },
  label: { fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, display:'block' },
  input: { width:'100%', background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:8 },
  upload: (hasFile) => ({
    display:'block', border: hasFile ? '1.5px solid rgba(74,222,128,0.4)' : '1.5px dashed rgba(255,255,255,0.15)',
    borderRadius:12, padding:'18px', textAlign:'center', cursor:'pointer',
    color: hasFile ? '#4ade80' : 'rgba(255,255,255,0.35)', fontSize:12, marginBottom:8,
    background: hasFile ? 'rgba(74,222,128,0.06)' : 'transparent',
  }),
  gpxInfo: { background:'rgba(74,222,128,0.08)', border:'0.5px solid rgba(74,222,128,0.2)', borderRadius:10, padding:'10px 12px', marginBottom:8 },
  gpxRow: { display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 },
  gpxKey: { color:'rgba(255,255,255,0.4)' },
  gpxVal: { color:'#4ade80', fontWeight:600 },
  stravaBox: { background:'rgba(252,76,2,0.08)', border:'0.5px solid rgba(252,76,2,0.2)', borderRadius:12, padding:'14px', marginBottom:8 },
  stravaBtn: { display:'block', background:'#FC4C02', borderRadius:9, padding:'11px', textAlign:'center', fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', marginBottom:8, border:'none', width:'100%' },
  stravaOr: { textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.3)', margin:'8px 0' },
  manualRow: { marginBottom:8 },
  select: { width:'100%', background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 13px', color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' },
  btn: (loading, disabled) => ({
    marginTop:12, background: disabled ? 'rgba(29,158,117,0.3)' : loading ? 'rgba(29,158,117,0.6)' : '#1d9e75',
    borderRadius:12, padding:13, textAlign:'center', fontSize:13, fontWeight:600, color:'#fff',
    cursor: disabled || loading ? 'default' : 'pointer', border:'none', width:'100%',
  }),
  error: { color:'#f87171', fontSize:11, textAlign:'center', marginTop:8 },
  distancePicker: { marginBottom:8 },
  distanceRow: { display:'flex', gap:6, flexWrap:'wrap', marginTop:6 },
  distBtn: (active) => ({
    padding:'7px 13px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
    background: active ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid rgba(74,222,128,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
    color: active ? '#4ade80' : 'rgba(255,255,255,0.5)',
  }),
};

export default function SourceScreen({ lang, onNext }) {
  const [tab, setTab]             = useState('gpx');
  const [gpxFile, setGpxFile]     = useState(null);
  const [gpxData, setGpxData]     = useState(null);
  const [url, setUrl]             = useState('');
  const [urlData, setUrlData]     = useState(null);
  const [selectedDist, setDist]   = useState(null);
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
  const handleWeb = async () => {
    if (!url) return setError('Paste a link first');
    setLoading(true); setError(''); setUrlData(null); setDist(null);
    try {
      const res = await fetch(`${API_URL}/api/generate-plan`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ raceUrl: url }),
      });
      const data = await res.json();
      if (data.success) {
        setUrlData(data.raceData);
        setDist(data.raceData.availableDistances?.[0] || data.raceData.distancia);
      } else setError(data.message);
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  const handleWebNext = () => {
    if (!urlData) return;
    onNext({ ...urlData, distancia: selectedDist, weeksAvailable: 24 });
  };

  // ── Manual ──────────────────────────────────────────────────
  const handleManual = () => {
    const { name, distancia, desnivel, fecha } = manual;
    if (!name || !distancia || !desnivel || !fecha) return setError(lang==='es' ? 'Completa todos los campos' : 'Fill in all fields');
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

  const tabs = [
    { id:'gpx',    icon:'📁', label: t(lang, 'sourcePdf'),    sub: t(lang, 'sourcePdfSub') },
    { id:'web',    icon:'🔗', label: t(lang, 'sourceWeb'),    sub: t(lang, 'sourceWebSub') },
    { id:'manual', icon:'✏️', label: t(lang, 'sourceManual'), sub: t(lang, 'sourceManualSub') },
    { id:'base',   icon:'🏃', label: t(lang, 'sourceOptions.base'), sub: t(lang, 'sourceOptions.baseSubtitle') },
  ];

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>🏔️ TRAILREADY</div>
          <div style={s.heading}>{lang==='es' ? '¿Cómo agregamos tu carrera?' : 'How do we add your race?'}</div>
        </div>

        {tabs.map(tb => (
          <div key={tb.id} style={s.option(tab===tb.id)} onClick={() => { setTab(tb.id); setError(''); }}>
            <div style={s.iconBox(tab===tb.id)}>{tb.icon}</div>
            <div style={{flex:1}}>
              <div style={s.optTitle(tab===tb.id)}>{tb.label}</div>
              <div style={s.optSub}>{tb.sub}</div>
            </div>
            {tab===tb.id && <div style={s.check}>✓</div>}
          </div>
        ))}

        <div style={s.divider} />

        {/* ── GPX ── */}
        {tab==='gpx' && (
          <>
            <label style={s.upload(!!gpxFile)}>
              <input type="file" accept=".gpx" style={{display:'none'}} onChange={handleGpxChange} />
              {loading ? (lang==='es' ? '⏳ Analizando GPX...' : '⏳ Parsing GPX...') :
               gpxFile ? `📍 ${gpxFile.name}` :
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

        {/* ── STRAVA ── */}
        {tab==='strava' && (
          <div style={s.stravaBox}>
            <button style={s.stravaBtn} onClick={() => setError('Strava OAuth coming soon!')}>
              🟠 {lang==='es' ? 'Conectar con Strava' : 'Connect with Strava'}
            </button>
            <div style={s.stravaOr}>{lang==='es' ? '— o exporta el GPX desde Strava —' : '— or export GPX from Strava —'}</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.6}}>
              {lang==='es'
                ? '1. Abre la actividad en Strava\n2. ··· → Exportar GPX\n3. Sube el archivo en la pestaña GPX'
                : '1. Open the activity in Strava\n2. ··· → Export GPX\n3. Upload the file in the GPX tab'}
            </div>
          </div>
        )}

        {/* ── BASE PLAN ── */}
        {tab==='base' && (
          <>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1.55, marginBottom:10 }}>
              {t(lang, 'basePlan.subtitle')}
            </div>
            <button style={s.btn(false, false)} onClick={handleBaseNext}>
              {lang==='es' ? 'Continuar →' : 'Continue →'}
            </button>
          </>
        )}

        {/* ── WEB LINK ── */}
        {tab==='web' && (
          <>
            <input style={s.input} placeholder="https://ultrasignup.com/..." value={url} onChange={e => setUrl(e.target.value)} />
            {urlData?.availableDistances?.length > 1 && (
              <div style={s.distancePicker}>
                <label style={s.label}>{lang==='es' ? '¿Qué distancia vas a correr?' : 'Which distance are you running?'}</label>
                <div style={s.distanceRow}>
                  {urlData.availableDistances.map(d => (
                    <div key={d} style={s.distBtn(selectedDist===d)} onClick={() => setDist(d)}>{d}K</div>
                  ))}
                </div>
              </div>
            )}
            {urlData && (
              <div style={s.gpxInfo}>
                <div style={s.gpxRow}><span style={s.gpxKey}>{lang==='es' ? 'Carrera' : 'Race'}</span><span style={s.gpxVal}>{urlData.name}</span></div>
                <div style={s.gpxRow}><span style={s.gpxKey}>{lang==='es' ? 'Distancia seleccionada' : 'Selected distance'}</span><span style={s.gpxVal}>{selectedDist}km</span></div>
              </div>
            )}
            <button style={s.btn(loading, false)} onClick={urlData ? handleWebNext : handleWeb} disabled={loading}>
              {loading ? (lang==='es' ? 'Analizando...' : 'Analyzing...') :
               urlData ? (lang==='es' ? 'Continuar →' : 'Continue →') :
               (lang==='es' ? 'Analizar carrera' : 'Analyze race')}
            </button>
          </>
        )}

        {/* ── MANUAL ── */}
        {tab==='manual' && (
          <>
            {[
              { key:'name',      label: lang==='es' ? 'Nombre de la carrera' : 'Race name',       placeholder:'Thunderbunny Trail Race', type:'text' },
              { key:'distancia', label: lang==='es' ? 'Distancia (km)'       : 'Distance (km)',    placeholder:'21',  type:'number' },
              { key:'desnivel',  label: lang==='es' ? 'Desnivel positivo (m)': 'Elevation gain (m)', placeholder:'2500', type:'number' },
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

        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  );
}