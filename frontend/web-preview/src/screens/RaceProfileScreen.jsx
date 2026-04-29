import { useState, useEffect, useRef } from 'react';
import { t } from '../i18n';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const s = {
  wrap: { minHeight:'100vh', background:'#0d0d1a', fontFamily:"'Inter', system-ui, sans-serif", paddingBottom:40 },
  header: { padding:'14px 20px 12px', display:'flex', alignItems:'center', gap:12 },
  back: { fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer' },
  headerTitle: { fontSize:16, fontWeight:700, color:'#fff' },
  section: { padding:'0 20px', marginBottom:24 },
  sectionLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:10 },
  card: { background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 },
  cardTitle: { fontSize:13, fontWeight:600, color:'#fff', marginBottom:4 },
  cardSub: { fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:12 },
  statsRow: { display:'flex', gap:8, marginBottom:12 },
  statBox: { flex:1, background:'rgba(255,255,255,0.06)', borderRadius:8, padding:'8px 6px', textAlign:'center' },
  statVal: (color) => ({ fontSize:14, fontWeight:700, color }),
  statLbl: { fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 },
  chartWrap: { position:'relative', height:120, marginTop:8 },
  noData: { textAlign:'center', padding:'20px 0', fontSize:12, color:'rgba(255,255,255,0.3)' },
  badge: (color, bg) => ({ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:600, color, background:bg, marginRight:6, marginBottom:6 }),
  nav: { display:'flex', borderTop:'0.5px solid rgba(255,255,255,0.07)', marginTop:20 },
  navBtn: (active) => ({ flex:1, padding:'14px 0', textAlign:'center', fontSize:11, fontWeight: active ? 600 : 400, color: active ? '#4ade80' : 'rgba(255,255,255,0.35)', cursor:'pointer', background:'none', border:'none' }),
};

function ElevationChart({ profile, color, height = 120 }) {
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

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui';
    ctx.fillText(Math.round(max) + 'm', 4, pad + 10);
    ctx.fillText(Math.round(min) + 'm', 4, h - 4);
  }, [profile, color, height]);

  if (!profile?.length) return <div style={s.noData}>No elevation data</div>;
  return <div style={s.chartWrap}><canvas ref={canvasRef} style={{ width:'100%', height }} /></div>;
}

export default function RaceProfileScreen({ lang, raceData, plan, onBack, onToday, onWeek }) {
  const [dailyProfile, setDailyProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const week = plan?.weeks?.[0];
  const todayIndex = new Date().getDay();
  const dayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const todayWorkout = week?.workouts?.[dayIndex];

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLoadingProfile(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const d = week?.desnivel || 500;
          const pts = 30;
          const profile = Array.from({ length: pts }, (_, i) => {
            const x = i / (pts - 1);
            return 200 + Math.sin(x * Math.PI * 2) * (d / 20) + Math.sin(x * Math.PI * 6) * (d / 60) + Math.random() * 20;
          });
          setDailyProfile(profile);
        } catch {}
        finally { setLoadingProfile(false); }
      },
      () => setLoadingProfile(false)
    );
  }, []);

  const raceProfile = raceData?.profile || null;
  const terrainMap = {
    technical: { en:'Technical', es:'Técnico',  color:'#f87171', bg:'rgba(248,113,113,0.12)' },
    mountain:  { en:'Mountain',  es:'Montaña',  color:'#fbbf24', bg:'rgba(251,191,36,0.12)'  },
    mixed:     { en:'Mixed',     es:'Mixto',    color:'#60a5fa', bg:'rgba(96,165,250,0.12)'  },
    road:      { en:'Road',      es:'Ruta',     color:'#9ca3af', bg:'rgba(156,163,175,0.12)' },
  };
  const terrain = terrainMap[raceData?.terreno] || terrainMap.mixed;
  const phaseNames = { base:{en:'Base',es:'Base'}, build:{en:'Build',es:'Construc.'}, peak:{en:'Peak',es:'Pico'}, taper:{en:'Taper',es:'Taper'} };

  return (
    <div className="screen-enter" style={s.wrap}>
      <div style={s.header}>
        <span style={s.back} onClick={onBack}>←</span>
        <div style={s.headerTitle}>🏁 {raceData?.name || 'Race Profile'}</div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>{lang==='es' ? 'PERFIL DE TU CARRERA OBJETIVO' : 'YOUR TARGET RACE PROFILE'}</div>
        <div style={s.card}>
          <div style={s.cardTitle}>{raceData?.name}</div>
          <div style={s.cardSub}>
            <span style={s.badge(terrain.color, terrain.bg)}>{terrain[lang] || terrain.en}</span>
            {raceData?.source && <span style={s.badge('rgba(255,255,255,0.5)','rgba(255,255,255,0.06)')}>{raceData.source.toUpperCase()}</span>}
          </div>
          <div style={s.statsRow}>
            <div style={s.statBox}><div style={s.statVal('#4ade80')}>{raceData?.distancia}km</div><div style={s.statLbl}>{lang==='es'?'distancia':'distance'}</div></div>
            <div style={s.statBox}><div style={s.statVal('#fbbf24')}>{raceData?.desnivel?.toLocaleString()||'—'}m</div><div style={s.statLbl}>D+</div></div>
            <div style={s.statBox}><div style={s.statVal('#f87171')}>{raceData?.desnivelNeg?.toLocaleString()||'—'}m</div><div style={s.statLbl}>D-</div></div>
            <div style={s.statBox}><div style={s.statVal('#60a5fa')}>{raceData?.elevMax||'—'}m</div><div style={s.statLbl}>{lang==='es'?'máx':'max elev'}</div></div>
          </div>
          {raceProfile
            ? <ElevationChart profile={raceProfile} color="#4ade80" height={120} />
            : <div style={{background:'rgba(255,255,255,0.03)',borderRadius:8,padding:16,textAlign:'center'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',marginBottom:4}}>{lang==='es'?'Perfil no disponible':'Elevation profile not available'}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.15)'}}>{lang==='es'?'Sube el GPX para ver el perfil':'Upload the race GPX to see the profile'}</div>
              </div>
          }
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>{lang==='es' ? "PERFIL DE LA RUTA DE HOY" : "TODAY'S ROUTE PROFILE"}</div>
        <div style={s.card}>
          <div style={s.cardTitle}>{lang==='es' ? `Semana ${week?.week} · ${todayWorkout ? t(lang,`workouts.${todayWorkout.type}`) : '—'}` : `Week ${week?.week} · ${todayWorkout ? t(lang,`workouts.${todayWorkout.type}`) : '—'}`}</div>
          <div style={s.cardSub}>{lang==='es'?'Ruta sugerida hoy':'Suggested route for today'}</div>
          <div style={s.statsRow}>
            <div style={s.statBox}><div style={s.statVal('#4ade80')}>{todayWorkout?.km||'—'}km</div><div style={s.statLbl}>{lang==='es'?'distancia':'distance'}</div></div>
            <div style={s.statBox}><div style={s.statVal('#fbbf24')}>{week?.desnivel?`${week.desnivel}m`:'—'}</div><div style={s.statLbl}>D+</div></div>
            <div style={s.statBox}><div style={s.statVal('#a78bfa')}>{week?.phase ? phaseNames[week.phase]?.[lang]||week.phase : '—'}</div><div style={s.statLbl}>{lang==='es'?'fase':'phase'}</div></div>
          </div>
          {loadingProfile
            ? <div style={s.noData}>⏳ {lang==='es'?'Cargando...':'Loading...'}</div>
            : <ElevationChart profile={dailyProfile} color="#a78bfa" height={120} />
          }
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>{lang==='es'?'RESUMEN DE TU PLAN':'YOUR PLAN SUMMARY'}</div>
        <div style={s.card}>
          <div style={s.statsRow}>
            <div style={s.statBox}><div style={s.statVal('#4ade80')}>{plan?.totalWeeks}</div><div style={s.statLbl}>{lang==='es'?'semanas':'weeks'}</div></div>
            <div style={s.statBox}><div style={s.statVal('#fbbf24')}>{plan?.weeks?plan.weeks.reduce((a,w)=>a+w.kmTotal,0).toLocaleString():'—'}</div><div style={s.statLbl}>km total</div></div>
            <div style={s.statBox}><div style={s.statVal('#f87171')}>{plan?.weeks?Math.round(plan.weeks.reduce((a,w)=>a+w.desnivel,0)/1000)+'k':'—'}</div><div style={s.statLbl}>D+ total</div></div>
            <div style={s.statBox}><div style={s.statVal('#60a5fa')}>4</div><div style={s.statLbl}>{lang==='es'?'fases':'phases'}</div></div>
          </div>
        </div>
      </div>

      <div style={s.nav}>
        <button style={s.navBtn(false)} onClick={onToday}>{lang==='es'?'⚡ Hoy':'⚡ Today'}</button>
        <button style={s.navBtn(false)} onClick={onWeek}>{lang==='es'?'📅 Semana':'📅 Week'}</button>
        <button style={s.navBtn(true)}>{lang==='es'?'🏁 Carrera':'🏁 Race'}</button>
      </div>
    </div>
  );
}
