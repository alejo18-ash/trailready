import { useState, useEffect } from 'react';
import { t } from '../i18n';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const phaseKey = { base:'basePhase', build:'buildPhase', peak:'peakPhase', taper:'taperPhase' };

const s = {
  wrap: { minHeight:'100vh', background:'#0d0d1a', fontFamily:'system-ui, sans-serif' },
  header: { padding:'14px 20px 10px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  weekLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5 },
  activityTitle: { fontSize:20, fontWeight:700, color:'#fff', marginTop:3 },
  activitySub: { fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 },
  weatherBox: { textAlign:'right', minWidth:80 },
  weatherIcon: { fontSize:20 },
  weatherTemp: { fontSize:13, fontWeight:600, color:'#4ade80', marginTop:1 },
  weatherDesc: { fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 },
  weatherWind: { fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 },
  aqiBadge: (good) => ({ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:9, fontWeight:600, marginTop:3, background: good ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)', color: good ? '#4ade80' : '#fbbf24' }),
  alert: { margin:'0 20px 8px', background:'rgba(251,191,36,0.1)', border:'0.5px solid rgba(251,191,36,0.25)', borderRadius:10, padding:'8px 12px', fontSize:11, color:'#fbbf24' },
  divider: { height:'0.5px', background:'rgba(255,255,255,0.07)', margin:'0 20px' },
  locationBtn: { margin:'8px 20px 0', background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontSize:11, color:'rgba(255,255,255,0.5)', cursor:'pointer', textAlign:'center' },
  routeCard: { margin:'12px 20px', background:'rgba(29,158,117,0.1)', border:'1px solid rgba(29,158,117,0.25)', borderRadius:14, padding:14 },
  routeLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:6 },
  routeName: { fontSize:14, fontWeight:600, color:'#fff' },
  routeSub: { fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 },
  statsRow: { display:'flex', gap:6, marginTop:10 },
  statBox: { flex:1, background:'rgba(255,255,255,0.06)', borderRadius:8, padding:'8px 6px', textAlign:'center' },
  statBoxTime: { flex:1.12, background:'rgba(96,165,250,0.14)', border:'1px solid rgba(96,165,250,0.45)', borderRadius:10, padding:'10px 6px', textAlign:'center', boxShadow:'0 0 14px rgba(96,165,250,0.15)' },
  statVal: (color) => ({ fontSize:15, fontWeight:700, color }),
  statValTime: { fontSize:18, fontWeight:800, color:'#93c5fd', letterSpacing:'-0.02em' },
  statLbl: { fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 },
  statLblTime: { fontSize:10, color:'rgba(147,197,253,0.95)', marginTop:4, fontWeight:600, letterSpacing:0.2 },
  dots: { display:'flex', gap:6, marginTop:8, justifyContent:'center' },
  dot: (active) => ({ width:7, height:7, borderRadius:'50%', cursor:'pointer', background: active ? '#4ade80' : 'rgba(255,255,255,0.2)' }),
  wikiloc: { marginTop:10, background:'rgba(29,158,117,0.25)', borderRadius:8, padding:'9px', textAlign:'center', fontSize:11, fontWeight:600, color:'#4ade80', cursor:'pointer' },
  section: { padding:'0 20px', marginTop:12 },
  sectionLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:8 },
  recoveryRow: { display:'flex', gap:8 },
  recoveryCard: (bg, border) => ({ flex:1, background:bg, border:`0.5px solid ${border}`, borderRadius:11, padding:'10px 8px', textAlign:'center', cursor:'pointer' }),
  recoveryIcon: { fontSize:16, marginBottom:3 },
  recoveryTitle: (color) => ({ fontSize:10, color, fontWeight:500 }),
  recoverySub: { fontSize:9, color:'rgba(255,255,255,0.25)', marginTop:2 },
  nav: { display:'flex', borderTop:'0.5px solid rgba(255,255,255,0.07)', marginTop:20 },
  navBtn: (active) => ({ flex:1, padding:'14px 0', textAlign:'center', fontSize:11, fontWeight: active ? 600 : 400, color: active ? '#4ade80' : 'rgba(255,255,255,0.35)', cursor:'pointer', background:'none', border:'none' }),
};

export default function TodayScreen({ lang, plan, onWeek, onRecovery, onRaceProfile }) {
  const [conditions, setConditions]       = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [trails, setTrails]               = useState([]);
  const [trailIndex, setTrailIndex]       = useState(0);

  useEffect(() => { fetchConditions(); }, []);

  const fetchTrails = (lat, lon, km, desnivel) => {
    // Get previously shown trail IDs from localStorage
    const usedIds = JSON.parse(localStorage.getItem('usedTrails') || '[]');
    const exclude = usedIds.join(',');
  
    fetch(`${API_URL}/api/trails?lat=${lat}&lon=${lon}&distancia=${km}&desnivel=${desnivel}&exclude=${exclude}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.trails.length) {
          setTrails(data.trails);
          // Save first trail as used
          const newId = data.trails[0]?.id;
          if (newId && !usedIds.includes(newId)) {
            const updated = [...usedIds, newId].slice(-20); // keep last 20
            localStorage.setItem('usedTrails', JSON.stringify(updated));
          }
        }
      })
      .catch(() => {});
  };

  const fetchConditions = () => {
    if (!navigator.geolocation) return setLocationError(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const km = plan?.weeks[0]?.workouts[new Date().getDay() === 0 ? 6 : new Date().getDay()-1]?.km || 20;
          const desnivel = plan?.weeks[0]?.desnivel || 800;
          fetchTrails(lat, lon, km, desnivel);
          const res = await fetch(`${API_URL}/api/conditions?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data.success) setConditions(data.conditions);
        } catch { setLocationError(true); }
      },
      () => setLocationError(true)
    );
  };

  if (!plan || !plan.weeks.length) return null;

  const week         = plan.weeks[0];
  const todayIndex   = new Date().getDay();
  const dayIndex     = todayIndex === 0 ? 6 : todayIndex - 1;
  const todayWorkout = week.workouts[dayIndex];
  const phaseLabel   = t(lang, phaseKey[week.phase] || 'buildPhase');
  const workoutName  = t(lang, `workouts.${todayWorkout.type}`) || todayWorkout.type;
  const isGoodAqi    = !conditions?.aqi || conditions.aqi === 'Good' || conditions.aqi === 'Moderate';

  const activeTrail = trails[trailIndex] || null;
  const routeName   = activeTrail?.name || 'Cerro La Campana — Norte';
  const routeKm     = activeTrail?.distancia ? Math.round(activeTrail.distancia) : (todayWorkout.km || 12);
  const routeSource = activeTrail ? 'OSM · OpenStreetMap' : 'Wikiloc (mock)';
  const routeUrl    = activeTrail?.wikiloc || 'https://wikiloc.com';
  const routeTime   = `${Math.floor(routeKm/7)}:${String(Math.round((routeKm/7%1)*60)).padStart(2,'0')}h`;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={s.weekLabel}>
            {t(lang,'today')} · {t(lang,'week')} {week.week} {t(lang,'of')} {plan.totalWeeks}
          </div>
          <div style={s.activityTitle}>{workoutName}</div>
          <div style={s.activitySub}>
            {phaseLabel}{todayWorkout.km ? ` · ${todayWorkout.km} km · ${Math.floor(todayWorkout.km / 7)}h${String(Math.round((todayWorkout.km / 7 % 1) * 60)).padStart(2, '0')}` : ''}
          </div>
        </div>

        <div style={s.weatherBox}>
          {conditions ? (
            <>
              <div style={s.weatherIcon}>{conditions.icon}</div>
              <div style={s.weatherTemp}>{conditions.temp}°C</div>
              <div style={s.weatherDesc}>{conditions.description}</div>
              <div style={s.weatherWind}>💨 {conditions.wind} km/h</div>
              {conditions.aqi && <div style={s.aqiBadge(isGoodAqi)}>AQI: {conditions.aqi}</div>}
            </>
          ) : locationError ? (
            <div style={{fontSize:10, color:'rgba(255,255,255,0.3)', textAlign:'right'}}>
              📍 {lang==='es' ? 'Sin ubicación' : 'No location'}
            </div>
          ) : (
            <div style={{fontSize:18}}>⏳</div>
          )}
        </div>
      </div>

      {conditions?.alert && <div style={s.alert}>⚠️ {conditions.alert}</div>}

      {locationError && (
        <div style={s.locationBtn} onClick={fetchConditions}>
          📍 {lang==='es' ? 'Permitir ubicación para rutas y clima reales' : 'Allow location for real routes and weather'}
        </div>
      )}

      <div style={s.divider} />

      <div style={s.routeCard}>
        <div style={s.routeLabel}>{t(lang,'todaysRoute')}</div>
        <div style={s.routeName}>{routeName}</div>
        <div style={s.routeSub}>{routeSource}</div>
        <div style={s.statsRow}>
          <div style={s.statBox}>
            <div style={s.statVal('#4ade80')}>{routeKm}km</div>
            <div style={s.statLbl}>{t(lang,'distance')}</div>
          </div>
          <div style={s.statBox}>
            <div style={s.statVal('#fbbf24')}>{week.desnivel ? `${week.desnivel}m` : '—'}</div>
            <div style={s.statLbl}>{t(lang,'elevation')}</div>
          </div>
          <div style={s.statBoxTime}>
            <div style={s.statValTime}>{routeTime}</div>
            <div style={s.statLblTime}>{t(lang,'estimated')}</div>
          </div>
        </div>

        {trails.length > 1 && (
          <div style={s.dots}>
            {trails.map((_, i) => (
              <div key={i} style={s.dot(i===trailIndex)} onClick={() => setTrailIndex(i)} />
            ))}
          </div>
        )}

        <div style={s.wikiloc} onClick={() => window.open(routeUrl, '_blank')}>
          {activeTrail
            ? (lang==='es' ? 'Buscar en Wikiloc ↗' : 'Search on Wikiloc ↗')
            : t(lang,'openWikiloc')}
        </div>
      </div>

      {todayWorkout?.flatAlternative && (
        <div style={{margin:'8px 20px', background:'rgba(251,191,36,0.1)', border:'0.5px solid rgba(251,191,36,0.25)', borderRadius:12, padding:'12px 14px'}}>
          <div style={{fontSize:10, color:'#fbbf24', fontWeight:600, letterSpacing:0.5, marginBottom:6}}>
            {lang==='es' ? '🏔️ SIMULACIÓN DE DESNIVEL' : '🏔️ ELEVATION SIMULATION'}
          </div>
          <div style={{fontSize:12, color:'rgba(255,255,255,0.7)', lineHeight:1.6}}>
            {todayWorkout.flatTips?.[lang] || todayWorkout.flatTips?.en}
          </div>
        </div>
      )}

      <div style={s.section}>
        <div style={s.sectionLabel}>{t(lang,'afterRun')}</div>
        <div style={s.recoveryRow}>
          <div style={s.recoveryCard('rgba(167,139,250,0.1)','rgba(167,139,250,0.2)')} onClick={() => onRecovery('stretching')}>
            <div style={s.recoveryIcon}>🧘</div>
            <div style={s.recoveryTitle('#a78bfa')}>{t(lang,'stretching')}</div>
            <div style={s.recoverySub}>15 {t(lang,'min')} ↗</div>
          </div>
          <div style={s.recoveryCard('rgba(96,165,250,0.1)','rgba(96,165,250,0.2)')} onClick={() => onRecovery('iceBath')}>
            <div style={s.recoveryIcon}>🧊</div>
            <div style={s.recoveryTitle('#60a5fa')}>{t(lang,'iceBath')}</div>
            <div style={s.recoverySub}>10 {t(lang,'min')} ↗</div>
          </div>
          <div style={s.recoveryCard('rgba(251,191,36,0.1)','rgba(251,191,36,0.2)')} onClick={() => onRecovery('nutrition')}>
            <div style={s.recoveryIcon}>🍌</div>
            <div style={s.recoveryTitle('#fbbf24')}>{t(lang,'nutrition')}</div>
            <div style={s.recoverySub}>{t(lang,'guide')} ↗</div>
          </div>
        </div>
      </div>

      <div style={s.nav}>
        <button style={s.navBtn(true)}>{lang==='es' ? '⚡ Hoy' : '⚡ Today'}</button>
        <button style={s.navBtn(false)} onClick={onWeek}>{lang==='es' ? '📅 Semana' : '📅 Week'}</button>
        <button style={s.navBtn(false)} onClick={onRaceProfile}>{lang==='es' ? '🏁 Carrera' : '🏁 Race'}</button>
      </div>
    </div>
  );
}