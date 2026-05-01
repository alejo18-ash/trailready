import { useState, useEffect } from 'react';
import { t } from '../i18n';

const phaseKey = {
  base:'basePhase', build:'buildPhase', peak:'peakPhase', taper:'taperPhase',
  basePlan1: 'basePlan.phase1',
  basePlan2: 'basePlan.phase2',
  preBase1: 'prebase.phase1',
  preBase2: 'prebase.phase2',
};

const workoutColors = {
  rest:              { dot:'rgba(255,255,255,0.15)' },
  easy:              { dot:'#4ade80' },
  tempo:             { dot:'#60a5fa' },
  medium:            { dot:'#4ade80' },
  intervals:         { dot:'#fbbf24' },
  strength:          { dot:'#a78bfa' },
  strength_beginner: { dot:'#a78bfa' },
  longTrail:         { dot:'#4ade80' },
  shortTrail:        { dot:'#4ade80' },
  recovery:          { dot:'rgba(255,255,255,0.2)' },
  backToBack:        { dot:'#f87171' },
  strides:           { dot:'#2dd4bf' },
  cross:             { dot:'#2dd4bf' },
  treadmillIntervals:{ dot:'#f59e0b' },
  walk:              { dot:'#4ade80' },
  walk_run:          { dot:'#00FF87' },
  mobility:          { dot:'#2dd4bf' },
};

const dayKeys = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const zoneMap = {
  easy:'Zone 2', tempo:'Zone 3', intervals:'Zone 4–5', longTrail:'Zone 2',
  recovery:'Zone 1', backToBack:'Zone 2–3', strides:'Zone 4', shortTrail:'Zone 2',
  cross:'Zone 2', treadmillIntervals:'Zone 3–4',
};

export default function WeekScreen({ lang, plan, profile, raceData, currentWeek, setCurrentWeek, onToday, onRecovery, onStrength }) {
  const todayIndex    = new Date().getDay();
  const todayDayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  const [selectedWeek, setSelectedWeek] = useState(currentWeek ?? 0);
  const [completions, setCompletions]   = useState({});
  const [selectedDay, setSelectedDay]   = useState(todayDayIndex);

  useEffect(() => { setSelectedWeek(currentWeek ?? 0); }, [currentWeek]);
  useEffect(() => { setSelectedDay(selectedWeek === 0 ? todayDayIndex : 0); }, [selectedWeek]);
  useEffect(() => {
    const result = {};
    for (let i = 0; i < 7; i++) {
      const saved = localStorage.getItem(`trailready_workout_${selectedWeek}_${i}`);
      if (saved) { try { result[i] = JSON.parse(saved).status; } catch {} }
    }
    setCompletions(result);
  }, [selectedWeek]);

  if (!plan || !plan.weeks.length) return null;

  const isBasePlan = Boolean(raceData?.isBasePlan);
  const isPreBase  = Boolean(raceData?.isPreBase);
  const flatRunner = profile?.terrain === 'flat' && Number(raceData?.desnivel) > 1500;
  const week       = plan.weeks[selectedWeek];
  const fmtDur     = (n) => t(lang, 'workout.duration').replace('{n}', String(n));

  const flatRunnerKeyBanner = flatRunner && week.keyWorkout && (
    week.keyWorkout.type === 'treadmillIntervals'
    || (week.phase === 'taper' && week.keyWorkout.type === 'strides' && week.keyWorkout.day === 'Sat')
  );

  const vol     = (w) => ((isBasePlan || isPreBase) ? (w.volumeMin ?? 0) : w.kmTotal);
  const totalVol = plan.weeks.reduce((a, w) => a + vol(w), 0);
  const doneVol  = plan.weeks.slice(0, selectedWeek).reduce((a, w) => a + vol(w), 0);
  const pct      = totalVol > 0 ? Math.round((doneVol / totalVol) * 100) : 0;

  const selWorkout    = week.workouts[selectedDay];
  const selIsToday    = selectedWeek === 0 && selectedDay === todayDayIndex;
  const selIsDone     = selectedWeek === 0 && selectedDay < todayDayIndex;
  const selIsRecovery = selWorkout && ['stretching','iceBath','nutrition'].includes(selWorkout.type);
  const selIsStrength = selWorkout && (selWorkout.type === 'strength' || selWorkout.type === 'strength_beginner');

  // Compute actual calendar date for each day in the selected week
  const weekStartDate = (() => {
    const today = new Date();
    const dow = today.getDay();
    const toMonday = dow === 0 ? -6 : 1 - dow;
    const d = new Date(today);
    d.setDate(today.getDate() + toMonday + selectedWeek * 7);
    return d;
  })();
  const dayDate = (i) => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + i);
    return d.getDate();
  };

  const dayLetters = lang === 'es'
    ? ['L','M','X','J','V','S','D']
    : ['M','T','W','T','F','S','S'];

  // Key workout duration string
  const kwDur = week.keyWorkout
    ? (week.keyWorkout.duracion != null
        ? fmtDur(week.keyWorkout.duracion)
        : week.keyWorkout.km
          ? `${week.keyWorkout.km} km`
          : week.keyWorkout.duration
            ? `${week.keyWorkout.duration} min`
            : null)
    : null;

  // Selected day metadata
  const selDuration = selWorkout?.duracion != null
    ? fmtDur(selWorkout.duracion)
    : selWorkout?.km
      ? `${selWorkout.km} km`
      : selWorkout?.duration
        ? `${selWorkout.duration} min`
        : null;
  const selZone = zoneMap[selWorkout?.type] ?? null;
  const selMeta = [selDuration, selZone].filter(Boolean).join(' · ');

  // Plan title for header
  const planTitle = isPreBase
    ? t(lang, 'prebase.title')
    : isBasePlan
      ? t(lang, 'basePlan.title')
      : (raceData?.name || raceData?.nombre || t(lang, 'thisWeek'));

  // Weekly volume string
  const weekVol = (isBasePlan || isPreBase)
    ? `${week.volumeMin ?? 0} min`
    : `${week.kmTotal} km`;

  return (
    <div className="screen-enter" style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Inter', system-ui, sans-serif", display:'flex', flexDirection:'column' }}>

      {/* ── SECTION 1: HEADER ── */}
      <div style={{ background:'#080808', padding:'20px 24px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:20, fontWeight:600, color:'#fff', letterSpacing:'-0.02em' }}>
            {planTitle}
          </div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>
            {weekVol}
          </div>
        </div>
        <div style={{ fontSize:11, letterSpacing:'0.1em', color:'rgba(255,255,255,0.3)', marginTop:4, textTransform:'uppercase' }}>
          {t(lang,'week')} {week.week} {t(lang,'of')} {plan.totalWeeks} · {t(lang, phaseKey[week.phase] || 'buildPhase').toUpperCase()}
        </div>
        <div style={{ height:2, background:'rgba(255,255,255,0.08)', borderRadius:100, margin:'12px 0 0' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:'#00FF87', borderRadius:100, minWidth: pct > 0 ? 4 : 0 }} />
        </div>
      </div>

      {/* ── SECTION 2: WEEK SELECTOR ── */}
      <div style={{ display:'flex', gap:8, padding:'16px 24px', overflowX:'auto' }}>
        {plan.weeks.map((w, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setSelectedWeek(i); setCurrentWeek?.(i); }}
            style={{
              padding:'6px 14px', borderRadius:100, fontSize:13, cursor:'pointer',
              fontFamily:'inherit', flexShrink:0, whiteSpace:'nowrap',
              background: selectedWeek === i ? '#00FF87' : 'transparent',
              border: selectedWeek === i ? '1px solid #00FF87' : '1px solid rgba(255,255,255,0.1)',
              color: selectedWeek === i ? '#000000' : 'rgba(255,255,255,0.4)',
              fontWeight: selectedWeek === i ? 600 : 400,
            }}
          >
            {lang === 'es' ? `SEM ${w.week}` : `W${w.week}`}
          </button>
        ))}
      </div>

      {/* ── SECTION 3: KEY WORKOUT CARD ── */}
      {week.keyWorkout && !isPreBase && (
        <div style={{ margin:'0 16px 12px', background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:16, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
              <span style={{ fontSize:20 }}>⭐</span>
              <div style={{ fontSize:15, fontWeight:600, color:'#FFB800' }}>
                {flatRunnerKeyBanner
                  ? t(lang, 'keyWorkoutFlatRunner')
                  : week.keyWorkout.type === 'treadmillIntervals'
                    ? (t(lang, 'workoutNames.treadmillIntervals') || t(lang, 'workouts.treadmillIntervals'))
                    : t(lang, `workouts.${week.keyWorkout.type}`)}
              </div>
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginLeft:8 }}>
              {t(lang, `days.${week.keyWorkout.day}`)}
            </div>
          </div>
          {(kwDur || week.keyWorkout.desc) && (
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:8 }}>
              {[kwDur, week.keyWorkout.desc?.[lang] || week.keyWorkout.desc?.en].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION 4: 7-DAY STRIP ── */}
      <div style={{ display:'flex', padding:'0 16px 12px' }}>
        {week.workouts.map((workout, i) => {
          const isToday  = selectedWeek === 0 && i === todayDayIndex;
          const isSelect = selectedDay === i;
          const done     = completions[i] === 'completed';
          const missed   = completions[i] === 'missed';
          const isKey    = !isPreBase && week.keyWorkout?.day === dayKeys[i];
          const dotColor = (workoutColors[workout.type] || workoutColors.rest).dot;

          return (
            <div
              key={i}
              onClick={() => setSelectedDay(i)}
              style={{
                flex:1, textAlign:'center', padding:'10px 4px', borderRadius:12, cursor:'pointer',
                background: isSelect ? 'rgba(0,255,135,0.12)' : 'transparent',
                border: isSelect ? '1px solid rgba(0,255,135,0.25)' : '1px solid transparent',
              }}
            >
              <div style={{ fontSize:11, color: isSelect ? '#00FF87' : isToday ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.3)', fontWeight: isSelect || isToday ? 600 : 400, marginBottom:6 }}>
                {dayLetters[i]}
              </div>
              <div style={{ fontSize:15, fontWeight:500, color: isSelect ? '#fff' : isToday ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                {dayDate(i)}
              </div>
              <div style={{ height:14, display:'flex', alignItems:'center', justifyContent:'center', marginTop:4 }}>
                {done   && <div style={{ width:6, height:6, borderRadius:'50%', background:'#00FF87' }} />}
                {missed && <div style={{ width:6, height:6, borderRadius:'50%', background:'#FF4444' }} />}
                {!done && !missed && isKey && <span style={{ fontSize:10 }}>⭐</span>}
                {!done && !missed && !isKey && workout.type !== 'rest' && <div style={{ width:6, height:6, borderRadius:'50%', background: dotColor }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SECTION 5: SELECTED DAY DETAIL ── */}
      {selWorkout && (
        <div style={{ margin:'0 16px', background:'#111111', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>
                {t(lang, `days.${dayKeys[selectedDay]}`)}
                {selIsToday ? ` · ${lang==='es' ? 'HOY' : 'TODAY'}` : ''}
              </div>
              <div style={{ fontSize:20, fontWeight:600, color: selIsDone ? 'rgba(255,255,255,0.3)' : '#fff', letterSpacing:'-0.01em' }}>
                {selWorkout.type === 'rest'
                  ? (lang === 'es' ? 'Descanso' : 'Rest')
                  : selWorkout.type === 'treadmillIntervals'
                    ? (t(lang, 'workoutNames.treadmillIntervals') || t(lang, 'workouts.treadmillIntervals'))
                    : (t(lang, `workouts.${selWorkout.type}`) || selWorkout.type)}
              </div>
              {selWorkout.type === 'rest' ? (
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:6 }}>
                  {lang === 'es' ? 'Descanso · Recuperación activa' : 'Rest · Active recovery'}
                </div>
              ) : selMeta ? (
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:6 }}>
                  {selMeta}
                </div>
              ) : null}
            </div>
            <div style={{ marginLeft:12, paddingTop:2 }}>
              {completions[selectedDay] === 'completed'
                ? <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(0,255,135,0.2)', border:'1px solid #00FF87', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#00FF87', fontWeight:700 }}>✓</div>
                : completions[selectedDay] === 'missed'
                  ? <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(255,68,68,0.2)', border:'1px solid #FF4444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#FF4444', fontWeight:700 }}>✗</div>
                  : <div style={{ width:24, height:24, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.15)' }} />}
            </div>
          </div>

          {(selIsRecovery || selIsStrength) && (
            <button
              type="button"
              style={{ marginTop:14, width:'100%', background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px', textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.6)', cursor:'pointer', fontFamily:'inherit' }}
              onClick={() => {
                if (selIsRecovery) onRecovery?.(selWorkout.type);
                else if (selIsStrength) onStrength?.(selWorkout.type === 'strength_beginner' ? 'beginner' : week.phase);
              }}
            >
              {selIsStrength
                ? t(lang, 'strength.seeFullSession')
                : `${lang==='es' ? 'Ver guía' : 'Open guide'} ↗`}
            </button>
          )}
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <div style={{ display:'flex', borderTop:'0.5px solid rgba(255,255,255,0.07)', marginTop:'auto' }}>
        <button
          type="button"
          style={{ flex:1, padding:'14px 0', textAlign:'center', fontSize:11, fontWeight:400, color:'rgba(255,255,255,0.35)', cursor:'pointer', background:'none', border:'none', fontFamily:'inherit' }}
          onClick={() => { setCurrentWeek?.(selectedWeek); onToday(); }}
        >
          {lang==='es' ? '⚡ Hoy' : '⚡ Today'}
        </button>
        <button
          type="button"
          style={{ flex:1, padding:'14px 0', textAlign:'center', fontSize:11, fontWeight:600, color:'#4ade80', cursor:'pointer', background:'none', border:'none', fontFamily:'inherit' }}
        >
          {lang==='es' ? '📅 Semana' : '📅 Week'}
        </button>
      </div>
    </div>
  );
}
