import { useState, useEffect } from 'react';
import { t } from '../i18n';
import BottomNav from '../components/BottomNav';
import Icon, { IconBadge } from '../components/Icon';
import RouteCard from '../components/RouteCard';
import { shoeKm, buyUrl, DEFAULT_SHOE_LIMIT } from '../utils/gear';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const phaseKey = {
  base:'basePhase', build:'buildPhase', peak:'peakPhase', taper:'taperPhase',
  basePlan1: 'basePlan.phase1',
  basePlan2: 'basePlan.phase2',
  preBase1: 'prebase.phase1',
  preBase2: 'prebase.phase2',
};

// Typical effort and pace per session type, used for the hero stats (approximate).
const ZONE = { easy:'Z2', longTrail:'Z2', shortTrail:'Z2', backToBack:'Z2', recovery:'Z1', tempo:'Z3', intervals:'Z4–5', strides:'Z2+', walk:'Z1', walk_run:'Z1–2', cross:'Z2', treadmillIntervals:'Z4' };
const PACE = { easy:6.5, longTrail:8, shortTrail:7.5, backToBack:8, recovery:7, tempo:5.5, intervals:6, strides:6.5, walk:11, walk_run:9, cross:6.5 };
const fmtMin = (m) => m >= 60 ? `${Math.floor(m/60)}h${String(Math.round(m%60)).padStart(2,'0')}` : `${Math.round(m)}`;

const s = {
  wrap: { background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", paddingBottom:80, paddingLeft:16, paddingRight:16, maxWidth:600, margin:'0 auto', width:'100%', boxSizing:'border-box' },
  header: { padding:'20px 20px 14px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  weekLabel: { fontSize:12, color:'rgba(18,29,41,0.62)', letterSpacing:1, textTransform:'uppercase' },
  activityTitle: { fontSize:48, fontWeight:700, color:'#121D29', marginTop:4, fontFamily:'var(--font-display)', lineHeight:0.95, textTransform:'uppercase' },
  activitySub: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:4 },
  weatherBox: { textAlign:'right', minWidth:80 },
  weatherIcon: { fontSize:20 },
  weatherTemp: { fontSize:13, fontWeight:600, color:'#EA2A30', marginTop:1 },
  weatherDesc: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:1 },
  weatherWind: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:1 },
  aqiBadge: (good) => ({ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:12, fontWeight:600, marginTop:3, background: good ? 'rgba(234,42,48,0.08)' : 'rgba(251,191,36,0.15)', color: good ? '#EA2A30' : '#fbbf24' }),
  alert: { margin:'0 0 16px', background:'rgba(251,191,36,0.1)', border:'0.5px solid rgba(251,191,36,0.25)', borderRadius:10, padding:'8px 12px', fontSize:12, color:'#b45309' },
  divider: { height:'0.5px', background:'rgba(18,29,41,0.08)', margin:'0 20px' },
  locationBtn: { margin:'8px 20px 0', background:'#FFFFFF', border:'0.5px solid rgba(18,29,41,0.1)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'rgba(18,29,41,0.62)', cursor:'pointer', textAlign:'center' },
  routeCard: { margin:'0 0 16px', background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.08)', borderRadius:20, padding:20, boxShadow:'0 1px 4px rgba(18,29,41,0.06)' },
  routeLabel: { fontSize:12, color:'rgba(18,29,41,0.62)', letterSpacing:0.5, marginBottom:6 },
  routeName: { fontSize:14, fontWeight:600, color:'#121D29' },
  routeSub: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:2 },
  statsRow: { display:'flex', gap:6, marginTop:10 },
  statBox: { flex:1, background:'rgba(18,29,41,0.04)', borderRadius:8, padding:'8px 6px', textAlign:'center' },
  statBoxTime: { flex:1.12, background:'rgba(234,42,48,0.06)', border:'1px solid rgba(234,42,48,0.18)', borderRadius:10, padding:'10px 6px', textAlign:'center' },
  statVal: (color) => ({ fontSize:22, fontWeight:700, color, fontFamily:'var(--font-display)', lineHeight:1.1 }),
  statValTime: { fontSize:18, fontWeight:800, color:'#EA2A30', letterSpacing:'-0.02em' },
  statLbl: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:1 },
  statLblTime: { fontSize:12, color:'#EA2A30', marginTop:4, fontWeight:600, letterSpacing:0.2 },
  dots: { display:'flex', gap:6, marginTop:8, justifyContent:'center' },
  dot: (active) => ({ width:7, height:7, borderRadius:'50%', cursor:'pointer', background: active ? '#EA2A30' : 'rgba(18,29,41,0.18)' }),
  wikiloc: { marginTop:10, background:'rgba(234,42,48,0.07)', borderRadius:8, padding:'9px', textAlign:'center', fontSize:12, fontWeight:600, color:'#EA2A30', cursor:'pointer' },
  section: { padding:0, marginTop:8 },
  sectionLabel: { fontSize:12, fontWeight:600, color:'rgba(18,29,41,0.66)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 },
  recoveryRow: { display:'flex', gap:8, marginBottom:16 },
  recoveryCard: () => ({ flex:1, background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.08)', borderRadius:16, padding:'16px 8px', textAlign:'center', cursor:'pointer', fontFamily:'inherit', display:'flex', flexDirection:'column', alignItems:'center', gap:8, minHeight:44 }),
  recoveryIcon: { fontSize:16, marginBottom:3 },
  recoveryTitle: () => ({ fontSize:14, color:'#121D29', fontWeight:600 }),
  recoverySub: { fontSize:12, color:'rgba(18,29,41,0.62)', marginTop:2 },
  baseMotivationCard: { margin:'0 0 16px', background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.08)', borderRadius:14, padding:14, boxShadow:'0 1px 4px rgba(18,29,41,0.06)' },
  baseMotivationText: { fontSize:13, color:'#121D29', lineHeight:1.55 },
};


export default function TodayScreen({ lang, plan, raceData, currentWeek, onWeek, onRecovery, onRaceProfile, onNewPlan, onStrength, onPlans, onProfile, user, onLogout, onShowLogin, completions, onWorkoutStatus, gear, onGear }) {
  const [conditions, setConditions]           = useState(null);
  const [locationError, setLocationError]     = useState(false);
  const [trails, setTrails]                   = useState([]);
  const [trailIndex, setTrailIndex]           = useState(0);
  const [workoutStatus, setWorkoutStatus]     = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [weatherFailed, setWeatherFailed]     = useState(false);
  const [geoBusy, setGeoBusy]                 = useState(false);
  const [geoHelp, setGeoHelp]                 = useState(null); // 'denied' | 'unavailable' | null

  useEffect(() => { fetchConditions(); }, [currentWeek]);
  // Signing in after the page loaded: fetch routes without asking for location again.
  useEffect(() => {
    if (user && lastPos && routeState === 'login') {
      const wk = plan?.weeks?.[currentWeek ?? 0] ?? plan?.weeks?.[0];
      const di = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
      fetchRoutes(lastPos.lat, lastPos.lon, wk?.workouts?.[di], conditions);
    }
  }, [user]);

  useEffect(() => {
    const cw = currentWeek ?? 0;
    const ti = new Date().getDay();
    const di = ti === 0 ? 6 : ti - 1;
    const fromAccount = completions?.[`${cw}_${di}`]?.status;
    if (fromAccount) { setWorkoutStatus(fromAccount); return; }
    const saved = localStorage.getItem(`trailready_workout_${cw}_${di}`);
    if (!saved) { setWorkoutStatus(null); return; }
    try { setWorkoutStatus(JSON.parse(saved).status ?? null); } catch { setWorkoutStatus(null); }
  }, [currentWeek, completions]);

  const [routeState, setRouteState] = useState('off');
  const [routeData, setRouteData] = useState(null);
  const [routeError, setRouteError] = useState('');
  const [lastPos, setLastPos] = useState(null);

  // Real loops for today's run (needs an account; the server builds and picks them).
  const fetchRoutes = async (lat, lon, tw, weather) => {
    const RUN = !tw || ['rest','recovery','strength','strength_beginner','mobility','treadmillIntervals','cross'].includes(tw.type) ? null : tw;
    if (!RUN) { setRouteState('off'); return; }
    if (!user) {
      // Only invite sign-in when the routes feature is actually switched on.
      try { const r = await fetch(`${API_URL}/api/routes/enabled`); const j = await r.json(); setRouteState(j.enabled ? 'login' : 'off'); }
      catch { setRouteState('off'); }
      return;
    }
    setRouteState('loading'); setRouteError('');
    try {
      const token = await user.getIdToken();
      const km = RUN.km ?? (RUN.duracion != null ? Math.max(3, Math.round(RUN.duracion / 7)) : 8);
      const res = await fetch(`${API_URL}/api/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lat, lon, km, type: RUN.type, lang, weather: weather ? { temp: weather.temp, description: weather.description, wind: weather.wind } : null }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) { setRouteState('off'); return; }   // feature not switched on yet
      if (!res.ok) throw new Error(data.error);
      setRouteData(data); setRouteState('ready');
    } catch (e) {
      setRouteError(e.message || ''); setRouteState('error');
    }
  };

  const fetchConditions = (fromTap = false) => {
    if (!navigator.geolocation) { setLocationError(true); if (fromTap) setGeoHelp('unavailable'); return; }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoBusy(false); setGeoHelp(null);
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const cw = currentWeek ?? 0;
          const wk = plan?.weeks?.[cw] ?? plan?.weeks?.[0];
          const di = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
          const tw = wk?.workouts?.[di];
          const km = tw?.km ?? (tw?.duracion != null ? Math.max(8, Math.round(tw.duracion / 4)) : 20);
          const desnivel = wk?.desnivel || 800;
          setLastPos({ lat, lon });
          setLocationError(false); setWeatherFailed(false);
          const res = await fetch(`${API_URL}/api/conditions?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data.success) setConditions(data.conditions); else setWeatherFailed(true);
          fetchRoutes(lat, lon, tw, data.success ? data.conditions : null);
        } catch { setWeatherFailed(true); }
      },
      (err) => {
        // The browser won't ask again once location was blocked: explain how to turn it on.
        setGeoBusy(false); setLocationError(true);
        if (fromTap) setGeoHelp(err?.code === 1 ? 'denied' : 'unavailable');
      },
      { timeout: 15000, maximumAge: 10 * 60 * 1000 }
    );
  };

  if (!plan || !plan.weeks.length) return null;

  const cw = currentWeek ?? 0;
  const week         = plan.weeks[cw] ?? plan.weeks[0];
  const todayIndex   = new Date().getDay();
  const dayIndex     = todayIndex === 0 ? 6 : todayIndex - 1;
  const storageKey   = `trailready_workout_${cw}_${dayIndex}`;
  const handleStatus = (status) => {
    setWorkoutStatus(status);
    if (status) localStorage.setItem(storageKey, JSON.stringify({ status, date: Date.now() }));
    else localStorage.removeItem(storageKey);
    onWorkoutStatus?.(`${cw}_${dayIndex}`, status);
  };
  const todayWorkout = week.workouts[dayIndex];
  const phaseLabel   = t(lang, phaseKey[week.phase] || 'buildPhase');
  const isBasePlan   = Boolean(raceData?.isBasePlan);
  const isPreBase    = Boolean(raceData?.isPreBase);
  const baseWeekNum  = week.weekNumber ?? week.week ?? 1;
  const fmtDur = (n) => t(lang, 'workout.duration').replace('{n}', String(n));
  const isTreadmill  = todayWorkout.type === 'treadmillIntervals';
  const treadmillLabel = t(lang, 'workoutNames.treadmillIntervals') || t(lang, 'workouts.treadmillIntervals');
  const workoutName  = isTreadmill ? treadmillLabel : (t(lang, `workouts.${todayWorkout.type}`) || todayWorkout.type);
  const isGoodAqi    = !conditions?.aqi || conditions.aqi === 'Good' || conditions.aqi === 'Moderate';

  const isStrength = todayWorkout.type === 'strength' || todayWorkout.type === 'strength_beginner';

  const daysToRace = (!isBasePlan && raceData?.fecha)
    ? Math.round((new Date(raceData.fecha) - new Date()) / 86400000)
    : null;
  const isRaceWeek = daysToRace !== null && daysToRace >= 0 && daysToRace < 7;
  const safeTrailIndex = trails.length ? Math.min(trailIndex, trails.length - 1) : 0;
  const activeTrail = trails[safeTrailIndex] ?? null;
  const routeName   = activeTrail?.name || null;
  const routeKm =
    activeTrail != null && activeTrail.distancia != null && activeTrail.distancia !== ''
      ? Math.round(Number(activeTrail.distancia))
      : (todayWorkout.km
        ?? (todayWorkout.duracion != null ? Math.max(8, Math.round(todayWorkout.duracion / 4)) : 12));
  const routeElev =
    activeTrail != null && activeTrail.desnivel != null && activeTrail.desnivel !== ''
      ? Number(activeTrail.desnivel)
      : week.desnivel;
  const routeSource = 'OSM · OpenStreetMap';
  const routeUrl    = activeTrail?.wikiloc || null;
  const routeTime   = `${Math.floor(routeKm/7)}:${String(Math.round((routeKm/7%1)*60)).padStart(2,'0')}h`;

  const isRunDay = !['rest','recovery','strength','strength_beginner','mobility'].includes(todayWorkout.type);
  const minutes = todayWorkout.duracion ?? todayWorkout.duration ?? (todayWorkout.km && PACE[todayWorkout.type] ? todayWorkout.km * PACE[todayWorkout.type] : null);
  const heroStats = isRunDay ? [
    todayWorkout.km ? { value: todayWorkout.km, unit:'km', label: lang==='es' ? 'distancia' : 'distance' } : null,
    minutes ? { value: '~' + fmtMin(minutes), unit: minutes >= 60 ? '' : 'min', label: lang==='es' ? 'tiempo aprox.' : 'approx. time' } : null,
    ZONE[todayWorkout.type] ? { value: ZONE[todayWorkout.type], unit:'', label: lang==='es' ? 'intensidad' : 'intensity' } : null,
  ].filter(Boolean) : [];

  // Shoe wear: warn from 85% of the replacement mileage.
  const shoe = (gear || []).find(g => g.type === 'shoes' && g.default && !g.retiredAt);
  const shoeTotal = shoe ? shoeKm(shoe, plan, completions) : 0;
  const shoeLimit = shoe?.limitKm || DEFAULT_SHOE_LIMIT;
  const shoeWorn = shoe && shoeTotal >= shoeLimit * 0.85;

  // Weekly progress for the "end" moment after checking off a session.
  const weekSessions = week.workouts.filter(w => w && w.type !== 'rest').length;
  const weekDone = week.workouts.reduce((n, w, di) => {
    if (!w || w.type === 'rest') return n;
    let st = completions?.[`${cw}_${di}`]?.status;
    if (!st) { try { st = JSON.parse(localStorage.getItem(`trailready_workout_${cw}_${di}`) || 'null')?.status; } catch { st = null; } }
    if (di === dayIndex && workoutStatus) st = workoutStatus;
    return n + (st === 'completed' ? 1 : 0);
  }, 0);

  return (
    <div className="screen-enter" style={s.wrap}>
      {/* ── Top bar: date, account, weather ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 4px 12px', gap:12 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(18,29,41,0.66)', letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
          {new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday:'long', day:'numeric', month:'short' })}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
          {conditions ? (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.08)', borderRadius:999, padding:'6px 12px', fontSize:13, fontWeight:600, color:'#121D29' }}>
              <span aria-hidden="true">{conditions.icon}</span>{conditions.temp}°
              <span style={{ color:'rgba(18,29,41,0.66)', fontWeight:500, display:'inline-flex', alignItems:'center', gap:3 }}><Icon name="wind" size={13} />{conditions.wind}</span>
            </div>
          ) : locationError ? (
            <button type="button" onClick={() => fetchConditions(true)} disabled={geoBusy} style={{ display:'flex', alignItems:'center', gap:6, background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.08)', borderRadius:999, padding:'8px 12px', fontSize:12, fontWeight:600, color:'#121D29', cursor:'pointer', fontFamily:'inherit', minHeight:36, opacity: geoBusy ? 0.6 : 1 }}>
              <Icon name="pin" size={14} color="#EA2A30" />{geoBusy ? '…' : (lang==='es' ? 'Clima' : 'Weather')}
            </button>
          ) : weatherFailed ? (
            <button type="button" onClick={() => fetchConditions(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.08)', borderRadius:999, padding:'8px 12px', fontSize:12, color:'rgba(18,29,41,0.66)', cursor:'pointer', fontFamily:'inherit', minHeight:36 }}>
              <Icon name="cloudSun" size={14} />{lang==='es' ? 'Reintentar clima' : 'Retry weather'}
            </button>
          ) : (
            <div className="tr-skeleton" style={{ width:84, height:32, borderRadius:999 }} aria-label={lang==='es' ? 'Cargando clima' : 'Loading weather'} />
          )}
          {user ? (
            <button type="button" onClick={onProfile} aria-label={lang==='es' ? 'Perfil' : 'Profile'} style={{ background:'none', border:'none', padding:0, cursor:'pointer', width:36, height:36 }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }} />
                : <span style={{ width:36, height:36, borderRadius:'50%', background:'#121D29', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700 }}>{user.displayName?.[0] || '?'}</span>}
            </button>
          ) : (
            <button type="button" onClick={onShowLogin} style={{ background:'none', border:'none', fontSize:13, color:'#EA2A30', cursor:'pointer', fontFamily:'inherit', fontWeight:600, padding:'8px 4px', minHeight:36 }}>
              {lang === 'es' ? 'Entrar' : 'Sign in'}
            </button>
          )}
        </div>
      </div>

      {geoHelp && (
        <div role="alert" style={{ background:'#FFFFFF', border:'1px solid rgba(234,42,48,0.25)', borderRadius:16, padding:16, marginBottom:12, fontSize:14, color:'rgba(18,29,41,0.78)', lineHeight:1.5 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
            <strong style={{ color:'#121D29' }}>{lang==='es' ? 'La ubicación está bloqueada' : 'Location is blocked'}</strong>
            <button type="button" onClick={() => setGeoHelp(null)} aria-label={lang==='es' ? 'Cerrar' : 'Close'} style={{ background:'none', border:'none', padding:4, cursor:'pointer', color:'rgba(18,29,41,0.66)' }}><Icon name="x" size={16} /></button>
          </div>
          {geoHelp === 'denied' ? (
            <ol style={{ margin:'8px 0 0', paddingLeft:18 }}>
              <li>{lang==='es' ? 'En el iPhone: Ajustes → Privacidad y seguridad → Localización → activa tu navegador (Chrome o Safari) con "Al usar la app".' : 'On iPhone: Settings → Privacy & Security → Location Services → set your browser (Chrome or Safari) to "While Using".'}</li>
              <li>{lang==='es' ? 'En Safari también: Ajustes → Apps → Safari → Ubicación → Preguntar o Permitir.' : 'For Safari also: Settings → Apps → Safari → Location → Ask or Allow.'}</li>
              <li>{lang==='es' ? 'Vuelve, recarga la página y toca "Clima" otra vez.' : 'Come back, reload the page and tap "Weather" again.'}</li>
            </ol>
          ) : (
            <div style={{ marginTop:6 }}>{lang==='es' ? 'No pudimos obtener tu ubicación. Revisa que la localización esté activa e inténtalo de nuevo.' : "We couldn't get your location. Check that location is on and try again."}</div>
          )}
        </div>
      )}

      {conditions?.alert && <div style={{ ...s.alert, margin:'0 0 12px', display:'flex', gap:8, alignItems:'flex-start' }}><Icon name="alert" size={16} />{conditions.alert}</div>}

      {/* ── Hero: today's session ── */}
      <div style={{ background:'#FFFFFF', borderRadius:24, padding:24, boxShadow:'0 1px 2px rgba(18,29,41,0.04), 0 8px 24px rgba(18,29,41,0.06)', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:700, color:'#EA2A30', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            {phaseLabel} · {t(lang,'week')} {week.week}/{plan.totalWeeks}
          </span>
          {daysToRace !== null && daysToRace >= 0 && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:600, whiteSpace:'nowrap', color: isRaceWeek ? '#EA2A30' : 'rgba(18,29,41,0.66)' }}>
              <Icon name="flag" size={13} />{isRaceWeek ? t(lang, 'countdown.raceWeek') : `${daysToRace} ${lang==='es' ? 'días' : 'days'}`}
            </span>
          )}
        </div>
        <h1 style={{ ...s.activityTitle, margin:0 }}>{workoutName}</h1>
        {(todayWorkout.desc?.[lang] || todayWorkout.desc?.en) && !isStrength && (
          <p style={{ fontSize:16, color:'rgba(18,29,41,0.78)', lineHeight:1.5, margin:'8px 0 0' }}>
            {todayWorkout.desc?.[lang] || todayWorkout.desc?.en}
          </p>
        )}
        {heroStats.length > 0 && (
          <div style={{ display:'flex', gap:24, marginTop:20 }}>
            {heroStats.map(st => (
              <div key={st.label}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'#121D29', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
                  {st.value}<span style={{ fontSize:16, marginLeft:2, color:'rgba(18,29,41,0.66)' }}>{st.unit}</span>
                </div>
                <div style={{ fontSize:12, color:'rgba(18,29,41,0.66)', marginTop:4 }}>{st.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>



      {(todayWorkout.type === 'rest' || todayWorkout.type === 'recovery') ? (
        <div style={{ margin:'0 0 16px', background:'#FFFFFF', border:'0.5px solid rgba(18,29,41,0.08)', borderRadius:14, padding:'20px 16px', textAlign:'center', boxShadow:'0 1px 4px rgba(18,29,41,0.05)' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}><IconBadge name={todayWorkout.type === 'recovery' ? 'stretch' : 'moon'} size={48} /></div>
          <div style={{ fontSize:13, fontWeight:600, color:'rgba(18,29,41,0.75)', marginBottom:4 }}>
            {todayWorkout.type === 'recovery'
              ? (lang==='es' ? 'Día de recuperación activa' : 'Active recovery day')
              : (lang==='es' ? 'Día de descanso' : 'Rest day')}
          </div>
          <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)', lineHeight:1.6 }}>
            {lang==='es' ? 'Tu cuerpo se adapta mientras descansas. Es parte del plan.' : 'Your body adapts while you rest. This is part of the plan.'}
          </div>
        </div>
      ) : isStrength ? (
        <div style={{ margin:'0 0 16px', background:'#FFFFFF', border:'1px solid rgba(234,42,48,0.2)', borderRadius:14, padding:14, boxShadow:'0 1px 4px rgba(18,29,41,0.06)' }}>
          <div style={{ fontSize:12, color:'#EA2A30', letterSpacing:0.5, marginBottom:6, fontWeight:600 }}>
            {lang==='es' ? 'SESIÓN DE FUERZA' : 'STRENGTH SESSION'}
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:'#121D29', marginBottom:4 }}>
            {todayWorkout.type === 'strength_beginner' ? workoutName : t(lang,'strength.title')}
          </div>
          <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)', lineHeight:1.55, marginBottom:12 }}>
            {todayWorkout.type === 'strength_beginner'
              ? t(lang, 'prebase.coachNote')
              : t(lang,'strength.whyStrength')}
          </div>
          <button
            type="button"
            onClick={() => onStrength?.(todayWorkout.type === 'strength_beginner' ? 'beginner' : week.phase)}
            style={{ background:'rgba(234,42,48,0.08)', border:'1px solid rgba(234,42,48,0.25)', borderRadius:10, padding:'10px 16px', fontSize:13, fontWeight:700, color:'#EA2A30', cursor:'pointer', fontFamily:'inherit', width:'100%' }}
          >
            {t(lang,'strength.seeFullSession')}
          </button>
        </div>
      ) : isTreadmill ? (
        <>
          <div style={{ margin:'0 0 16px', background:'#FFFFFF', border:'1px solid rgba(251,191,36,0.3)', borderRadius:14, padding:14, boxShadow:'0 1px 4px rgba(18,29,41,0.06)' }}>
            <div style={{ fontSize:12, color:'#b45309', letterSpacing:0.5, marginBottom:6, fontWeight:600 }}>
              {t(lang,'treadmillSession').toUpperCase()}
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:'#121D29', marginBottom:4 }}>
              {treadmillLabel}
            </div>
            <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)', lineHeight:1.45, marginBottom:8 }}>
              {t(lang, 'workoutDescriptions.treadmillIntervals')}
            </div>
            <div style={{ fontSize:12, color:'rgba(18,29,41,0.7)', lineHeight:1.55, marginBottom:10 }}>
              {todayWorkout.treadmillNote?.[lang] || todayWorkout.treadmillNote?.en}
            </div>
            <ul style={{ margin:0, paddingLeft:18, fontSize:12, color:'rgba(18,29,41,0.62)', lineHeight:1.65 }}>
              <li>{t(lang,'treadmillTipIncline')}</li>
              <li>{t(lang,'treadmillTipHR')}</li>
              <li>{t(lang,'treadmillTipPoles')}</li>
            </ul>
          </div>
          {routeName && <div style={{ margin:'0 0 16px', background:'rgba(18,29,41,0.03)', border:'0.5px solid rgba(18,29,41,0.07)', borderRadius:12, padding:'10px 14px', opacity:0.75 }}>
            <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)', marginBottom:4 }}>{t(lang,'treadmillOptionalOutdoor')}</div>
            <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)' }}>{routeName} · ~{routeKm} km</div>
          </div>}
        </>
      ) : isPreBase ? (
        <div style={{ margin:'0 0 16px', background:'#FFFFFF', border:'1px solid rgba(234,42,48,0.15)', borderRadius:14, padding:14, boxShadow:'0 1px 4px rgba(18,29,41,0.06)' }}>
          <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)', lineHeight:1.55, marginBottom:8 }}>
            {t(lang, 'prebase.todayMotivation')}
          </div>
          {todayWorkout.duracion != null && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(234,42,48,0.08)', border:'0.5px solid rgba(234,42,48,0.2)', borderRadius:20, padding:'3px 11px', fontSize:12, color:'#EA2A30', fontWeight:600 }}>
              <Icon name="clock" size={13} />{fmtDur(todayWorkout.duracion)}
            </div>
          )}
          {todayWorkout.desc?.[lang] && (
            <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)', lineHeight:1.5, marginTop:8 }}>
              {todayWorkout.desc[lang]}
            </div>
          )}
        </div>
      ) : isBasePlan ? (
        <div style={s.baseMotivationCard}>
          <div style={s.baseMotivationText}>{t(lang, 'basePlan.todayMotivation')}</div>
        </div>
      ) : null}

      {isRunDay && !isTreadmill && (
        <RouteCard lang={lang} state={routeState} data={routeData} error={routeError}
          onRetry={() => lastPos && fetchRoutes(lastPos.lat, lastPos.lon, todayWorkout, conditions)} onLogin={onShowLogin} />
      )}

      {todayWorkout?.flatAlternative && todayWorkout.type !== 'treadmillIntervals' && todayWorkout.flatTips && (
        <div style={{margin:'0 0 16px', background:'rgba(251,191,36,0.08)', border:'0.5px solid rgba(251,191,36,0.3)', borderRadius:12, padding:'12px 14px'}}>
          <div style={{fontSize:12, color:'#b45309', fontWeight:600, letterSpacing:0.5, marginBottom:6}}>
            {lang==='es' ? 'SIMULACIÓN DE DESNIVEL' : 'ELEVATION SIMULATION'}
          </div>
          <div style={{fontSize:12, color:'rgba(18,29,41,0.66)', lineHeight:1.6}}>
            {todayWorkout.flatTips?.[lang] || todayWorkout.flatTips?.en}
          </div>
        </div>
      )}


      {todayWorkout.type !== 'rest' && todayWorkout.type !== 'recovery' && (
        workoutStatus === 'completed' ? (
          <div role="status" aria-live="polite" style={{ background:'#121D29', color:'#FFFFFF', borderRadius:24, padding:24, marginBottom:16, display:'flex', gap:16, alignItems:'center' }}>
            <span className="tr-pop" style={{ width:56, height:56, borderRadius:'50%', background:'#EA2A30', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 0 8px rgba(234,42,48,0.18)' }}>
              <Icon name="check" size={28} strokeWidth={3} />
            </span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, lineHeight:1, textTransform:'uppercase' }}>
                {lang==='es' ? '¡Hecho!' : 'Done!'}
              </div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.78)', marginTop:4 }}>
                {weekDone}/{weekSessions} {lang==='es' ? 'sesiones esta semana' : 'sessions this week'}
                {weekDone >= weekSessions ? (lang==='es' ? ' · ¡semana completa!' : ' · week complete!') : ''}
              </div>
              <div style={{ height:6, background:'rgba(255,255,255,0.14)', borderRadius:3, marginTop:10, overflow:'hidden' }}>
                <div className="tr-fill" style={{ height:'100%', width:`${Math.min(100, Math.round(weekDone / Math.max(1, weekSessions) * 100))}%`, background:'#EA2A30', borderRadius:3 }} />
              </div>
              <button type="button" onClick={() => handleStatus(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.66)', fontSize:12, padding:'10px 0 0', cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:4 }}>
                <Icon name="undo" size={12} />{lang==='es' ? 'Deshacer' : 'Undo'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom:16 }}>
            <button type="button" onClick={() => handleStatus('completed')}
              style={{ width:'100%', minHeight:56, borderRadius:16, border:'none', background:'#EA2A30', color:'#FFFFFF', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 16px rgba(234,42,48,0.28), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
              <Icon name="check" size={20} strokeWidth={2.5} />{lang==='es' ? 'Marcar como hecho' : 'Mark as done'}
            </button>
            {workoutStatus === 'missed' ? (
              <div style={{ fontSize:14, color:'rgba(18,29,41,0.78)', lineHeight:1.5, marginTop:12, textAlign:'center' }}>
                {t(lang, 'workout.missedMsg')}{' '}
                <button type="button" onClick={() => handleStatus(null)} style={{ background:'none', border:'none', color:'#EA2A30', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit', padding:0 }}>
                  {lang==='es' ? 'Deshacer' : 'Undo'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => handleStatus('missed')}
                style={{ width:'100%', minHeight:44, marginTop:8, background:'none', border:'none', color:'rgba(18,29,41,0.66)', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                {lang==='es' ? 'Hoy no pude entrenar' : "I couldn't train today"}
              </button>
            )}
          </div>
        )
      )}

      {shoeWorn && (
        <div style={{ background:'#FFFFFF', border:'1px solid rgba(234,42,48,0.25)', borderRadius:20, padding:16, marginBottom:16, display:'flex', gap:12, alignItems:'center' }}>
          <IconBadge name="footprints" size={44} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#121D29' }}>
              {shoeTotal >= shoeLimit ? (lang==='es' ? 'Toca cambiar tus zapatillas' : 'Time to replace your shoes') : (lang==='es' ? 'Tus zapatillas están cerca del límite' : 'Your shoes are near their limit')}
            </div>
            <div style={{ fontSize:13, color:'rgba(18,29,41,0.66)', marginTop:2 }}>
              {[shoe.brand, shoe.model].filter(Boolean).join(' ')} · {shoeTotal}/{shoeLimit} km
            </div>
            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <a href={buyUrl(shoe)} target="_blank" rel="noopener noreferrer sponsored" style={{ fontSize:13, fontWeight:700, color:'#EA2A30', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4, minHeight:32 }}>
                {lang==='es' ? 'Ver reemplazo' : 'See replacement'}<Icon name="arrowUpRight" size={14} />
              </a>
              <button type="button" onClick={onGear} style={{ background:'none', border:'none', padding:0, fontSize:13, color:'rgba(18,29,41,0.66)', cursor:'pointer', fontFamily:'inherit', minHeight:32 }}>
                {lang==='es' ? 'Mi equipo' : 'My gear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {todayWorkout.type !== 'rest' && todayWorkout.type !== 'recovery' && (
      <div style={s.section}>
        <div style={s.sectionLabel}>{t(lang,'afterRun')}</div>
        <div style={s.recoveryRow}>
          <button type="button" style={s.recoveryCard()} onClick={() => onRecovery('stretching')}>
            <IconBadge name="stretch" size={36} />
            <div style={s.recoveryTitle()}>{t(lang,'stretching')}</div>
            <div style={s.recoverySub}>15 {t(lang,'min')} ↗</div>
          </button>
          {!isBasePlan && !isPreBase && cw >= 1 && (
            <button type="button" style={s.recoveryCard()} onClick={() => onRecovery('iceBath')}>
              <IconBadge name="snowflake" size={36} />
              <div style={s.recoveryTitle()}>{t(lang,'iceBath')}</div>
              <div style={s.recoverySub}>10 {t(lang,'min')} ↗</div>
            </button>
          )}
          {!isBasePlan && !isPreBase && (
            <button type="button" style={s.recoveryCard()} onClick={() => onRecovery('nutrition')}>
              <IconBadge name="apple" size={36} />
              <div style={s.recoveryTitle()}>{t(lang,'nutrition')}</div>
              <div style={s.recoverySub}>{t(lang,'guide')} ↗</div>
            </button>
          )}
          {(isBasePlan || isPreBase) && baseWeekNum >= 2 && (
            <button type="button" style={s.recoveryCard()} onClick={() => onRecovery('nutrition')}>
              <IconBadge name="apple" size={36} />
              <div style={s.recoveryTitle()}>{t(lang,'nutrition')}</div>
              <div style={s.recoverySub}>{t(lang,'guide')} ↗</div>
            </button>
          )}
          {isBasePlan && baseWeekNum >= 5 && (
            <button type="button" style={s.recoveryCard()} onClick={() => onRecovery('iceBath')}>
              <IconBadge name="snowflake" size={36} />
              <div style={s.recoveryTitle()}>{t(lang,'iceBath')}</div>
              <div style={s.recoverySub}>10 {t(lang,'min')} ↗</div>
            </button>
          )}
          {isPreBase && baseWeekNum >= 3 && (
            <button type="button" style={s.recoveryCard()} onClick={() => onRecovery('iceBath')}>
              <IconBadge name="snowflake" size={36} />
              <div style={s.recoveryTitle()}>{t(lang,'iceBath')}</div>
              <div style={s.recoverySub}>10 {t(lang,'min')} ↗</div>
            </button>
          )}
        </div>
      </div>
      )}

      <BottomNav active="today" lang={lang || 'es'} onToday={null} onPlan={onWeek} onPlans={onPlans} onProfile={onProfile || onRaceProfile} />

      {showConfirmModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(18,29,41,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'0 24px' }}>
          <div style={{ background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.1)', borderRadius:16, padding:'28px 24px', maxWidth:320, width:'100%', boxShadow:'0 8px 32px rgba(18,29,41,0.15)' }}>
            <div style={{ fontSize:18, fontWeight:600, color:'#121D29', marginBottom:8 }}>
              {t(lang, 'modal.newPlan.title')}
            </div>
            <div style={{ fontSize:14, color:'rgba(18,29,41,0.62)', marginBottom:24, lineHeight:1.5 }}>
              {t(lang, 'modal.newPlan.subtitle')}
            </div>
            <button
              type="button"
              onClick={() => { onNewPlan?.(); setShowConfirmModal(false); }}
              style={{ display:'block', width:'100%', background:'#EA2A30', color:'#fff', border:'none', borderRadius:100, padding:14, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}
            >
              {t(lang, 'modal.newPlan.confirm')}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              style={{ display:'block', width:'100%', background:'transparent', color:'rgba(18,29,41,0.62)', border:'1px solid rgba(18,29,41,0.15)', borderRadius:100, padding:14, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}
            >
              {t(lang, 'modal.newPlan.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}