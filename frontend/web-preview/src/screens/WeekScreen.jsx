import { useState } from 'react';
import { t } from '../i18n';

const phaseKey = {
  base:'basePhase', build:'buildPhase', peak:'peakPhase', taper:'taperPhase',
  basePlan1: 'basePlan.phase1',
  basePlan2: 'basePlan.phase2',
};

const workoutColors = {
  rest:       { bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.05)', dot:'rgba(255,255,255,0.1)' },
  easy:       { bg:'rgba(74,222,128,0.07)',  border:'rgba(74,222,128,0.12)',  dot:'#4ade80' },
  tempo:      { bg:'rgba(96,165,250,0.07)',  border:'rgba(96,165,250,0.12)',  dot:'#60a5fa' },
  medium:     { bg:'rgba(74,222,128,0.09)',  border:'rgba(74,222,128,0.15)',  dot:'#4ade80' },
  intervals:  { bg:'rgba(251,191,36,0.08)',  border:'rgba(251,191,36,0.15)',  dot:'#fbbf24' },
  strength:   { bg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.15)',dot:'#a78bfa' },
  longTrail:  { bg:'rgba(74,222,128,0.09)',  border:'rgba(74,222,128,0.15)',  dot:'#4ade80' },
  shortTrail: { bg:'rgba(74,222,128,0.07)',  border:'rgba(74,222,128,0.12)',  dot:'#4ade80' },
  recovery:   { bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.06)', dot:'rgba(255,255,255,0.2)' },
  backToBack: { bg:'rgba(248,113,113,0.07)', border:'rgba(248,113,113,0.15)',dot:'#f87171' },
  strides:    { bg:'rgba(45,212,191,0.07)',  border:'rgba(45,212,191,0.12)',  dot:'#2dd4bf' },
  cross:      { bg:'rgba(45,212,191,0.07)',  border:'rgba(45,212,191,0.12)',  dot:'#2dd4bf' },
  treadmillIntervals: { bg:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.28)', dot:'#f59e0b' },
};

const s = {
  wrap: { minHeight:'100vh', background:'#0d0d1a', fontFamily:'system-ui, sans-serif' },
  header: { padding:'14px 20px 10px' },
  weekLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5 },
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 },
  title: { fontSize:18, fontWeight:700, color:'#fff' },
  kmLabel: { fontSize:11, color:'rgba(255,255,255,0.35)' },
  progressBg: { background:'rgba(255,255,255,0.07)', borderRadius:6, height:3, margin:'10px 0 4px' },
  progressFill: (pct) => ({ width:`${pct}%`, height:'100%', background:'#1d9e75', borderRadius:6 }),
  progressLabel: { fontSize:9, color:'rgba(255,255,255,0.25)' },
  divider: { height:'0.5px', background:'rgba(255,255,255,0.07)', margin:'8px 20px 0' },
  weekNav: { display:'flex', gap:4, padding:'10px 20px', overflowX:'auto' },
  weekBtn: (active) => ({
    padding:'6px 11px', borderRadius:8, border: active ? '1px solid rgba(29,158,117,0.5)' : '0.5px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.04)',
    color: active ? '#4ade80' : 'rgba(255,255,255,0.4)', fontSize:11, fontWeight: active ? 600 : 400,
    cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
  }),
  list: { padding:'8px 20px 16px' },
  dayRow: (active, done, colors) => ({
    display:'flex', alignItems:'center', gap:8, padding:'9px 10px', marginBottom:4,
    background: active ? 'rgba(29,158,117,0.15)' : done ? 'rgba(255,255,255,0.02)' : colors.bg,
    border: active ? '1px solid rgba(29,158,117,0.4)' : `0.5px solid ${done ? 'rgba(255,255,255,0.04)' : colors.border}`,
    borderRadius:10, opacity: done ? 0.6 : 1,
  }),
  dayLabel: (active) => ({ width:28, fontSize:10, color: active ? '#4ade80' : 'rgba(255,255,255,0.3)', fontWeight: active ? 600 : 500 }),
  workoutName: (done) => ({ fontSize:11, fontWeight:600, color: done ? 'rgba(255,255,255,0.3)' : '#fff', textDecoration: done ? 'line-through' : 'none' }),
  workoutDesc: (done) => ({ fontSize:9, color: done ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.35)', marginTop:1 }),
  dot: (color) => ({ width:7, height:7, borderRadius:'50%', background:color, marginLeft:'auto', flexShrink:0 }),
  nav: { display:'flex', borderTop:'0.5px solid rgba(255,255,255,0.07)' },
  navBtn: (active) => ({
    flex:1, padding:'14px 0', textAlign:'center', fontSize:11, fontWeight: active ? 600 : 400,
    color: active ? '#4ade80' : 'rgba(255,255,255,0.35)', cursor:'pointer', background:'none', border:'none',
  }),
};

export default function WeekScreen({ lang, plan, profile, raceData, onToday, onRecovery }) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  if (!plan || !plan.weeks.length) return null;

  const isBasePlan = Boolean(raceData?.isBasePlan);
  const flatRunner = profile?.terrain === 'flat' && Number(raceData?.desnivel) > 1500;
  const week = plan.weeks[selectedWeek];
  const flatRunnerKeyBanner = flatRunner && week.keyWorkout && (
    week.keyWorkout.type === 'treadmillIntervals'
    || (week.phase === 'taper' && week.keyWorkout.type === 'strides' && week.keyWorkout.day === 'Sat')
  );
  const todayIndex = new Date().getDay();
  const todayDayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const dayKeys = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const totalKm = plan.weeks.reduce((a, w) => a + w.kmTotal, 0);
  const doneKm  = plan.weeks.slice(0, selectedWeek).reduce((a, w) => a + w.kmTotal, 0);
  const pct     = Math.round((doneKm / totalKm) * 100);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.weekLabel}>
          {t(lang,'week')} {week.week} {t(lang,'of')} {plan.totalWeeks} · {t(lang, phaseKey[week.phase]).toUpperCase()}
        </div>
        <div style={s.row}>
          <div style={s.title}>
            {isBasePlan ? t(lang, 'basePlan.weekPlanTitle') : t(lang,'thisWeek')}
          </div>
          <div style={s.kmLabel}>
            {isBasePlan
              ? `${week.kmTotal} km`
              : `${week.kmTotal} km · ${week.desnivel?.toLocaleString()}m D+`}
          </div>
        </div>
        <div style={s.progressBg}>
          <div style={s.progressFill(pct)} />
        </div>
        <div style={s.progressLabel}>{pct}% {t(lang,'toRaceDay')}</div>
      </div>

      <div style={s.divider} />

      <div style={s.weekNav}>
        {plan.weeks.map((w, i) => (
          <button key={i} style={s.weekBtn(selectedWeek === i)} onClick={() => setSelectedWeek(i)}>
            W{w.week}
          </button>
        ))}
      </div>

      {week.keyWorkout && (
        <div style={{
          margin: '8px 20px',
          background: 'rgba(251,191,36,0.1)',
          border: '0.5px solid rgba(251,191,36,0.25)',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ fontSize: 16 }}>⭐</div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(251,191,36,0.8)', fontWeight: 600, letterSpacing: 0.5 }}>
              {flatRunnerKeyBanner ? t(lang, 'keyWorkoutFlatRunner') : (lang === 'es' ? 'ENTRENO CLAVE DE LA SEMANA' : 'KEY WORKOUT THIS WEEK')}
            </div>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginTop: 2 }}>
              {week.keyWorkout.type === 'treadmillIntervals'
                ? (t(lang, 'workoutNames.treadmillIntervals') || t(lang, 'workouts.treadmillIntervals'))
                : t(lang, `workouts.${week.keyWorkout.type}`)}
              {week.keyWorkout.km ? ` · ${week.keyWorkout.km} km` : week.keyWorkout.duration ? ` · ${week.keyWorkout.duration} min` : ''}
              {' · '}
              {t(lang, `days.${week.keyWorkout.day}`)}
            </div>
          </div>
        </div>
      )}

      <div style={s.list}>
        {week.workouts.map((workout, i) => {
          const isToday   = selectedWeek === 0 && i === todayDayIndex;
          const isDone    = selectedWeek === 0 && i < todayDayIndex;
          const colors    = workoutColors[workout.type] || workoutColors.rest;
          const isRecovery = ['stretching','iceBath','nutrition'].includes(workout.type);

          return (
            <div key={i} style={s.dayRow(isToday, isDone, colors)}
              onClick={() => isRecovery ? onRecovery(workout.type) : null}>
              <div style={s.dayLabel(isToday)}>{t(lang, `days.${dayKeys[i]}`)}</div>
              <div style={{flex:1}}>
                <div style={s.workoutName(isDone)}>
                  {workout.type === 'treadmillIntervals' && <span style={{ marginRight: 6 }}>🏃</span>}
                  {workout.type === 'treadmillIntervals'
                    ? (t(lang, 'workoutNames.treadmillIntervals') || t(lang, 'workouts.treadmillIntervals'))
                    : (t(lang, `workouts.${workout.type}`) || workout.type)}
                  {workout.flatAlternative && workout.type !== 'treadmillIntervals' && (
                    <span style={{ fontSize: 10, color: '#fbbf24', marginLeft: 6 }}>🏔️ +sim</span>
                  )}
                  {workout.type === 'recovery' ? ' ↗' : ''}
                </div>
                <div style={s.workoutDesc(isDone)}>
                  {workout.type === 'treadmillIntervals'
                    ? `${workout.duration != null ? `${workout.duration} min · ` : ''}${workout.treadmillNote?.[lang] || workout.treadmillNote?.en || ''}`
                    : workout.treadmillNote
                      ? workout.treadmillNote[lang] || workout.treadmillNote.en
                      : `${workout.km ? `${workout.km} km · ` : ''}${workout.desc?.[lang] || workout.desc?.en || ''}`}
                </div>
              </div>
              {week.keyWorkout?.day === dayKeys[i] && (
                <div style={{ fontSize: 10, color: '#fbbf24', marginRight: 4 }}>⭐</div>
              )}
              <div style={s.dot(isDone ? 'rgba(74,222,128,0.4)' : isToday ? '#4ade80' : colors.dot)} />
            </div>
          );
        })}
      </div>

      <div style={s.nav}>
        <button style={s.navBtn(false)} onClick={onToday}>
          {lang==='es' ? '⚡ Hoy' : '⚡ Today'}
        </button>
        <button style={s.navBtn(true)}>
          {lang==='es' ? '📅 Semana' : '📅 Week'}
        </button>
      </div>
    </div>
  );
}