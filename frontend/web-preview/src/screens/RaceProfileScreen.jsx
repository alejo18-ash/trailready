import { useState, useEffect, useRef } from 'react';
import { t } from '../i18n';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const s = {
  wrap: { minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", paddingBottom:80, paddingLeft:16, paddingRight:16, maxWidth:600, margin:'0 auto', width:'100%', boxSizing:'border-box' },
  header: { padding:'14px 20px 12px', display:'flex', alignItems:'center', gap:12 },
  back: { fontSize:12, color:'rgba(18,29,41,0.62)', cursor:'pointer' },
  headerTitle: { fontSize:24, fontWeight:700, color:'#121D29', fontFamily:'var(--font-display)', lineHeight:1.05 },
  section: { padding:'0 20px', marginBottom:24 },
  sectionLabel: { fontSize:12, color:'rgba(18,29,41,0.62)', letterSpacing:0.5, marginBottom:10 },
  card: { background:'#FFFFFF', border:'0.5px solid rgba(18,29,41,0.08)', borderRadius:14, padding:16, boxShadow:'0 1px 4px rgba(18,29,41,0.06)' },
  cardTitle: { fontSize:13, fontWeight:600, color:'#121D29', marginBottom:4 },
  cardSub: { fontSize:12, color:'rgba(18,29,41,0.62)', marginBottom:12 },
  statsRow: { display:'flex', gap:8, marginBottom:12 },
  statBox: { flex:1, background:'rgba(18,29,41,0.04)', borderRadius:8, padding:'8px 6px', textAlign:'center' },
  statVal: (color) => ({ fontSize:22, fontWeight:700, color, fontFamily:'var(--font-display)', lineHeight:1.1 }),
  statLbl: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:1 },
  chartWrap: { position:'relative', height:120, marginTop:8 },
  noData: { textAlign:'center', padding:'20px 0', fontSize:12, color:'rgba(18,29,41,0.62)' },
  badge: (color, bg) => ({ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, color, background:bg, marginRight:6, marginBottom:6 }),
};

function ElevationChart({ profile, color, height = 120, lang }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !profile?.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.offsetWidth;
    const h = height;
    canvas.width = w;
    canvas.height = h;

    const min = Math.min(...profile);
    const max = Math.max(...profile);
    const range = max - min || 1;
    const pad = 10;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '08');

    ctx.beginPath();
    ctx.moveTo(0, h);
    profile.forEach((val, i) => {
      const x = (i / (profile.length - 1)) * w;
      const y = pad + ((max - val) / range) * (h - pad * 2);
      i === 0 ? ctx.lineTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    profile.forEach((val, i) => {
      const x = (i / (profile.length - 1)) * w;
      const y = pad + ((max - val) / range) * (h - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.fillStyle = 'rgba(18,29,41,0.45)';
    ctx.font = '10px system-ui';
    ctx.fillText(Math.round(max) + 'm', 4, pad + 10);
    ctx.fillText(Math.round(min) + 'm', 4, h - 4);
  }, [profile, color, height]);

  if (!profile?.length) return <div style={s.noData}>{lang === 'es' ? 'Sin datos de elevación' : 'No elevation data'}</div>;
  return <div style={s.chartWrap}><canvas ref={canvasRef} style={{ width:'100%', height }} /></div>;
}

export default function RaceProfileScreen({ lang, raceData, plan, onBack, onToday, onWeek, onPlans, onProfile }) {

  const raceProfile = raceData?.profile || null;
  const terrainMap = {
    technical: { en:'Technical', es:'Técnico',  color:'#EA2A30', bg:'rgba(234,42,48,0.1)' },
    mountain:  { en:'Mountain',  es:'Montaña',  color:'#b45309', bg:'rgba(251,191,36,0.12)' },
    mixed:     { en:'Mixed',     es:'Mixto',    color:'#1d4ed8', bg:'rgba(96,165,250,0.12)' },
    road:      { en:'Road',      es:'Ruta',     color:'#6b7280', bg:'rgba(156,163,175,0.12)' },
    flat:      { en:'Flat / road', es:'Plano / asfalto', color:'#6b7280', bg:'rgba(156,163,175,0.12)' },
  };
  const terrain = terrainMap[raceData?.terreno] || terrainMap.mixed;
  const isPreBase  = Boolean(raceData?.isPreBase);
  const isBasePlan = Boolean(raceData?.isBasePlan);
  const phaseNames = { base:{en:'Base',es:'Base'}, build:{en:'Build',es:'Construc.'}, peak:{en:'Peak',es:'Pico'}, taper:{en:'Taper',es:'Taper'}, preBase1:{en:'Intro',es:'Intro'}, preBase2:{en:'Progresión',es:'Progresión'} };

  return (
    <div className="screen-enter" style={s.wrap}>
      <div style={s.header}>
        <span style={s.back} onClick={onBack}>←</span>
        <div style={{ ...s.headerTitle, display:'flex', alignItems:'center', gap:8 }}><Icon name="flag" size={18} color="#EA2A30" />{raceData?.name || 'Race Profile'}</div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>{lang==='es' ? 'PERFIL DE TU CARRERA OBJETIVO' : 'YOUR TARGET RACE PROFILE'}</div>
        <div style={s.card}>
          <div style={s.cardTitle}>{raceData?.name}</div>
          <div style={s.cardSub}>
            <span style={s.badge('#121D29', 'rgba(18,29,41,0.06)')}>{terrain[lang] || terrain.en}</span>
            {raceData?.source && <span style={s.badge('rgba(18,29,41,0.64)','rgba(18,29,41,0.06)')}>{raceData.source.toUpperCase()}</span>}
          </div>
          {(!isPreBase && !isBasePlan) && (
            <div style={s.statsRow}>
              <div style={s.statBox}><div style={s.statVal('#121D29')}>{raceData?.distancia}km</div><div style={s.statLbl}>{lang==='es'?'distancia':'distance'}</div></div>
              <div style={s.statBox}><div style={s.statVal('#121D29')}>{raceData?.desnivel ? `${raceData.desnivel.toLocaleString()}m` : '—'}</div><div style={s.statLbl}>D+</div></div>
              <div style={s.statBox}><div style={s.statVal('#121D29')}>{raceData?.desnivelNeg ? `${raceData.desnivelNeg.toLocaleString()}m` : '—'}</div><div style={s.statLbl}>D-</div></div>
              <div style={s.statBox}><div style={s.statVal('#121D29')}>{raceData?.elevMax ? `${raceData.elevMax}m` : '—'}</div><div style={s.statLbl}>{lang==='es'?'máx':'max elev'}</div></div>
            </div>
          )}
          {(isPreBase || isBasePlan) && (
            <div style={s.statsRow}>
              <div style={s.statBox}><div style={s.statVal('#121D29')}>{plan?.totalWeeks}</div><div style={s.statLbl}>{lang==='es'?'semanas':'weeks'}</div></div>
              <div style={s.statBox}><div style={s.statVal('#121D29')}>{plan?.weeks ? [...new Set(plan.weeks.map(w=>w.phase).filter(Boolean))].length : '—'}</div><div style={s.statLbl}>{lang==='es'?'fases':'phases'}</div></div>
              <div style={s.statBox}><div style={s.statVal('#121D29')}>{plan?.weeks ? plan.weeks.reduce((a,w)=>a+(w.volumeMin||0),0) : '—'}</div><div style={s.statLbl}>{lang==='es'?'min total':'total min'}</div></div>
            </div>
          )}
          {raceProfile
            ? <ElevationChart profile={raceProfile} color="#EA2A30" height={120} lang={lang} />
            : <div style={{background:'rgba(18,29,41,0.03)',borderRadius:8,padding:16,textAlign:'center'}}>
                <div style={{fontSize:12,color:'rgba(18,29,41,0.62)',marginBottom:4}}>{lang==='es'?'Perfil no disponible':'Elevation profile not available'}</div>
                <div style={{fontSize:12,color:'rgba(18,29,41,0.64)'}}>{lang==='es'?'Sube el GPX para ver el perfil':'Upload the race GPX to see the profile'}</div>
              </div>
          }
        </div>
      </div>

      {raceData?.analysis?.insight && (
        <div style={s.section}>
          <div style={s.sectionLabel}>{lang==='es' ? 'LECTURA DEL COACH' : "COACH'S READ"}</div>
          <div style={{ background:'#121D29', color:'#fff', borderRadius:16, padding:16 }}>
            <div style={{ fontSize:14, lineHeight:1.55, color:'rgba(255,255,255,0.92)' }}>{raceData.analysis.insight[lang==='es' ? 'es' : 'en']}</div>
            {raceData.url && (
              <a href={raceData.url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:10, fontSize:13, fontWeight:600, color:'#FF8A8E', textDecoration:'none', minHeight:32 }}>
                {lang==='es' ? 'Página oficial de la carrera ↗' : 'Official race page ↗'}
              </a>
            )}
          </div>
          {raceData.analysis.facts?.length > 0 && (
            <div style={{ ...s.card, marginTop:8 }}>
              {raceData.analysis.facts.map((f, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:10, padding:'8px 0', borderTop: i ? '1px solid rgba(18,29,41,0.06)' : 'none', fontSize:13 }}>
                  <span style={{ color:'rgba(18,29,41,0.66)' }}>{lang==='es' ? f.label_es : f.label_en}</span>
                  <span style={{ textAlign:'right', color:'#121D29', fontWeight:600 }}>{lang==='es' ? f.value_es : f.value_en}
                    <span style={{ display:'block', fontSize:12, color: f.confirmed ? '#15803d' : '#b45309' }}>{f.confirmed ? (lang==='es' ? '✓ confirmado' : '✓ confirmed') : (lang==='es' ? '~ estimado' : '~ estimated')}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={s.section}>
        <div style={s.sectionLabel}>{lang==='es'?'RESUMEN DE TU PLAN':'YOUR PLAN SUMMARY'}</div>
        <div style={s.card}>
          <div style={s.statsRow}>
            <div style={s.statBox}><div style={s.statVal('#121D29')}>{plan?.totalWeeks}</div><div style={s.statLbl}>{lang==='es'?'semanas':'weeks'}</div></div>
            <div style={s.statBox}><div style={s.statVal('#121D29')}>{plan?.weeks ? (isBasePlan||isPreBase) ? plan.weeks.reduce((a,w)=>a+(w.volumeMin||0),0)+' min' : plan.weeks.reduce((a,w)=>a+w.kmTotal,0).toLocaleString()+'km' : '—'}</div><div style={s.statLbl}>{lang==='es'?'volumen':'volume'}</div></div>
            <div style={s.statBox}><div style={s.statVal('#121D29')}>{plan?.weeks && !isPreBase && !isBasePlan ? Math.round(plan.weeks.reduce((a,w)=>a+w.desnivel,0)/1000)+'k' : '—'}</div><div style={s.statLbl}>D+ total</div></div>
            <div style={s.statBox}><div style={s.statVal('#121D29')}>4</div><div style={s.statLbl}>{lang==='es'?'fases':'phases'}</div></div>
          </div>
        </div>
      </div>

      <BottomNav active="profile" lang={lang} onToday={onToday} onPlan={onWeek} onPlans={onPlans} onProfile={onProfile} />
    </div>
  );
}
