import { useState, useEffect } from 'react';
import { translations } from './i18n';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import LanguageScreen from './screens/LanguageScreen';
import SourceScreen from './screens/SourceScreen';
import ProfileScreen from './screens/ProfileScreen';
import TodayScreen from './screens/TodayScreen';
import WeekScreen from './screens/WeekScreen';
import RecoveryScreen from './screens/RecoveryScreen';
import RaceProfileScreen from './screens/RaceProfileScreen';
import LandingPage from './screens/LandingPage';

/** Monday (index 0) is always an easy run — never rest/recovery/strength on day 1. */
function ensureMondayIsEasy(template) {
  const t = [...template];
  if (t[0] === 'easy') return t;
  const easyIdx = t.indexOf('easy');
  if (easyIdx > 0) {
    [t[0], t[easyIdx]] = [t[easyIdx], t[0]];
    return t;
  }
  const prev = t[0];
  t[0] = 'easy';
  const restIdx = t.findIndex((x, i) => i > 0 && (x === 'rest' || x === 'recovery'));
  if (restIdx > 0) {
    t[restIdx] = prev;
    return t;
  }
  const swapIdx = t.findIndex((x, i) => i > 0);
  if (swapIdx > 0) t[swapIdx] = prev;
  return t;
}

export function generatePlan(raceData, profile) {
  const kmBase = Number(profile.kmSemanales);
  const multiplier = { principiante: 0.8, intermedio: 1.0, avanzado: 1.2 }[profile.nivel] || 1.0;

  const idealWeeks = raceData.distancia <= 55 ? 16
    : raceData.distancia <= 80 ? 20
    : raceData.distancia <= 110 ? 24 : 32;

  const availableWeeks = raceData.weeksAvailable || idealWeeks;
  const totalWeeks = Math.min(idealWeeks, availableWeeks);
  const startWeek = Number(profile.startWeek) || 1;
  const insufficient = availableWeeks < idealWeeks * 0.6;

  const phases = totalWeeks <= 16
    ? [
        { name:'base',  weeks:5, kmStart:kmBase,       kmEnd:kmBase*1.3,  desnivel:Math.round((raceData.desnivel||2000)*0.3) },
        { name:'build', weeks:5, kmStart:kmBase*1.3,   kmEnd:kmBase*1.7,  desnivel:Math.round((raceData.desnivel||2000)*0.5) },
        { name:'peak',  weeks:4, kmStart:kmBase*1.7,   kmEnd:kmBase*1.9,  desnivel:Math.round((raceData.desnivel||2000)*0.8) },
        { name:'taper', weeks:2, kmStart:kmBase*1.1,   kmEnd:kmBase*0.4,  desnivel:Math.round((raceData.desnivel||2000)*0.2) },
      ]
    : totalWeeks <= 24
    ? [
        { name:'base',  weeks:7, kmStart:kmBase,       kmEnd:kmBase*1.3,  desnivel:Math.round((raceData.desnivel||2000)*0.25) },
        { name:'build', weeks:8, kmStart:kmBase*1.3,   kmEnd:kmBase*1.8,  desnivel:Math.round((raceData.desnivel||2000)*0.5)  },
        { name:'peak',  weeks:6, kmStart:kmBase*1.8,   kmEnd:kmBase*2.0,  desnivel:Math.round((raceData.desnivel||2000)*0.85) },
        { name:'taper', weeks:3, kmStart:kmBase*1.2,   kmEnd:kmBase*0.4,  desnivel:Math.round((raceData.desnivel||2000)*0.2)  },
      ]
    : [
        { name:'base',  weeks:10, kmStart:kmBase,      kmEnd:kmBase*1.4,  desnivel:Math.round((raceData.desnivel||2000)*0.2)  },
        { name:'build', weeks:11, kmStart:kmBase*1.4,  kmEnd:kmBase*1.9,  desnivel:Math.round((raceData.desnivel||2000)*0.5)  },
        { name:'peak',  weeks:8,  kmStart:kmBase*1.9,  kmEnd:kmBase*2.1,  desnivel:Math.round((raceData.desnivel||2000)*0.9)  },
        { name:'taper', weeks:3,  kmStart:kmBase*1.2,  kmEnd:kmBase*0.4,  desnivel:Math.round((raceData.desnivel||2000)*0.2)  },
      ];

  const templates = {
    base:  ['rest','easy','strength','tempo','rest','longTrail','recovery'],
    build: ['rest','intervals','strength','tempo','easy','longTrail','recovery'],
    peak:  ['rest','intervals','strength','backToBack','rest','longTrail','backToBack'],
    taper: ['rest','easy','strength','strides','rest','shortTrail','recovery'],
  };

  const workoutDetails = {
    rest:       { km:null,  desc:{ en:'Easy walk or full rest',            es:'Caminata suave o descanso total' }},
    easy:       { pct:0.15, desc:{ en:'Zone 2, conversational pace',       es:'Zona 2, ritmo conversacional' }},
    tempo:      { pct:0.20, desc:{ en:'Zone 3, moderate effort',           es:'Zona 3, esfuerzo moderado' }},
    strength:   { km:null,  desc:{ en:'Bulgarian squat · Single-leg · Core', es:'Sentadilla búlgara · Single-leg · Core' }},
    intervals:  { pct:0.18, desc:{ en:'6×1km at 85% HR, 90s rest',        es:'6×1km al 85% FCM, rec 90s' }},
    longTrail:  { pct:0.35, desc:{ en:'Technical terrain, use poles',      es:'Terreno técnico, bastones' }},
    recovery:   { pct:0.12, desc:{ en:'Zone 1, very easy',                 es:'Zona 1, muy suave' }},
    backToBack: { pct:0.18, desc:{ en:'Run on tired legs from prior day',  es:'Correr con piernas cargadas' }},
    strides:    { pct:0.10, desc:{ en:'6×100m progressive strides',        es:'6×100m progresivos' }},
    shortTrail: { pct:0.20, desc:{ en:'Similar terrain to race, easy',     es:'Terreno similar a la carrera' }},
    cross:      { km:null,  desc:{ en:'45min zone 2 bike or swim',         es:'45min zona 2 bike o nado' }},
    treadmillIntervals: {
      km: null,
      desc: {
        en: 'Simulate race elevation on treadmill — incline repeats to build climbing power without mountain access',
        es: 'Simula el desnivel de carrera en cinta — repeticiones de inclinación para desarrollar potencia sin acceso a montaña',
      },
    },
  };

  const flatRunner = profile.terrain === 'flat' && Number(raceData.desnivel) > 1500;

  const treadmillByPhase = {
    base: {
      duration: 60,
      treadmillNote: {
        en: '60 min @ 10% incline, zone 2 — incline walk/run, build aerobic base',
        es: '60 min al 10% de inclinación, zona 2 — camina/corre en pendiente, base aeróbica',
      },
    },
    build: {
      duration: 75,
      treadmillNote: {
        en: '8×5 min @ 12% incline, 2 min rest — simulate climb, HR zone 3-4',
        es: '8×5 min al 12% de inclinación, 2 min descanso — simula subida, FCM zonas 3-4',
      },
    },
    peak: {
      duration: 90,
      treadmillNote: {
        en: '10×5 min @ 12-15% incline alternating, 90s rest — race-specific effort',
        es: '10×5 min alternando 12-15% de inclinación, 90s descanso — esfuerzo específico de carrera',
      },
    },
    taper: {
      duration: 30,
      treadmillNote: {
        en: '30 min easy @ 8% incline — maintain feel, conserve legs',
        es: '30 min suave al 8% de inclinación — mantén sensación, conserva piernas',
      },
    },
  };

  const dayKeys = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weeks = [];
  let weekNum = 1;

  for (const phase of phases) {
    for (let i = 0; i < phase.weeks; i++) {
      if (weekNum < startWeek) { weekNum++; continue; }
      const progress = phase.weeks === 1 ? 1 : i / (phase.weeks - 1);
      const kmTotal = Math.round((phase.kmStart + (phase.kmEnd - phase.kmStart) * progress) * multiplier);
      let template = [...templates[phase.name]];

      const activeDays = Number(profile.diasDisponibles);
      if (activeDays <= 4) template[4] = 'rest';
      else if (activeDays >= 6) template[4] = 'cross';
      template = ensureMondayIsEasy(template);

      const workouts = dayKeys.map((day, di) => {
        let type = template[di];
        if (flatRunner) {
          if (type === 'longTrail') type = 'treadmillIntervals';
          else if (type === 'backToBack') type = 'cross';
          else if (type === 'shortTrail') type = 'strides';
        }

        const detail = workoutDetails[type] || workoutDetails.rest;
        const w = {
          day,
          type,
          km: detail.pct ? Math.round(kmTotal * detail.pct) : null,
          desc: detail.desc,
        };

        if (type === 'treadmillIntervals') {
          const tp = treadmillByPhase[phase.name] || treadmillByPhase.base;
          w.duration = tp.duration;
          w.treadmillNote = { ...tp.treadmillNote };
          w.flatAlternative = true;
        }

        if (flatRunner && phase.name === 'taper' && type === 'strides' && di === 5) {
          w.treadmillNote = {
            en: 'Treadmill: after warm-up, 6×100m strides; optional 5–10 min @ 6–8% incline cool-down',
            es: 'Cinta: tras calentar, 6×100m progresivos; opcional 5–10 min al 6–8% en enfriamiento',
          };
        }

        return w;
      });

      const keyWorkoutTypes = flatRunner
        ? { base: 'treadmillIntervals', build: 'intervals', peak: 'treadmillIntervals', taper: 'strides' }
        : { base: 'longTrail', build: 'intervals', peak: 'longTrail', taper: 'shortTrail' };
      const keyType = keyWorkoutTypes[phase.name];
      const keyDay = phase.name === 'taper'
        ? workouts.find(w => w.day === 'Sat')
        : workouts.find(w => w.type === keyType);

      weeks.push({
        week: weekNum,
        phase: phase.name,
        kmTotal,
        desnivel: phase.desnivel,
        workouts,
        keyWorkout: keyDay || null,
      });
      weekNum++;
    }
  }

  return { weeks, totalWeeks, idealWeeks, insufficient, startWeek };
}

/** 8-week base-building plan (no race). Time-based volume; parallel to {@link generatePlan}. */
export function generateBasePlan(profile) {
  const dias = Math.min(6, Math.max(3, Number(profile.diasDisponibles) || 5));
  const startWeek = Number(profile.startWeek) || 1;

  const workoutDetails = {
    rest: { desc: { en: 'Easy walk or full rest', es: 'Caminata suave o descanso total' } },
    easy: { desc: { en: 'Zone 2, conversational pace', es: 'Zona 2, ritmo conversacional' } },
    tempo: { desc: { en: 'Zone 3, moderate effort', es: 'Zona 3, esfuerzo moderado' } },
    recovery: { desc: { en: 'Zone 1, very easy', es: 'Zona 1, muy suave' } },
    longTrail: { desc: { en: 'Easy aerobic, trails if available', es: 'Aeróbico suave, trail si puedes' } },
    strides: { desc: { en: '6×100m progressive strides', es: '6×100m progresivos' } },
  };

  const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const templateForWeek = (weekNum) => {
    const phase2 = weekNum >= 5;
    if (!phase2) {
      if (dias <= 3) return ['rest', 'easy', 'recovery', 'longTrail', 'recovery', 'recovery', 'recovery'];
      if (dias === 4) return ['rest', 'easy', 'recovery', 'longTrail', 'easy', 'recovery', 'recovery'];
      if (dias === 5) return ['easy', 'easy', 'recovery', 'longTrail', 'recovery', 'rest', 'recovery'];
      return ['easy', 'easy', 'recovery', 'longTrail', 'recovery', 'recovery', 'rest'];
    }
    if (dias <= 3) return ['easy', 'tempo', 'recovery', 'longTrail', 'recovery', 'rest', 'recovery'];
    if (dias === 4) return ['rest', 'easy', 'tempo', 'longTrail', 'rest', 'recovery', 'recovery'];
    if (dias === 5) return ['easy', 'easy', 'tempo', 'longTrail', 'recovery', 'rest', 'recovery'];
    return ['easy', 'easy', 'tempo', 'strides', 'longTrail', 'recovery', 'rest'];
  };

  const duracionFor = (type, weekIndex1to8, dayIndex) => {
    switch (type) {
      case 'rest':
        return null;
      case 'easy':
        return 30 + (dayIndex % 4) * 3;
      case 'recovery':
        return 25 + (weekIndex1to8 % 2) * 3;
      case 'longTrail': {
        const min = 50;
        const max = 70;
        return Math.round(min + ((max - min) * (weekIndex1to8 - 1)) / 7);
      }
      case 'tempo':
        return 35 + (weekIndex1to8 % 3) * 3;
      case 'strides':
        return 20 + (weekIndex1to8 % 2) * 3;
      default:
        return null;
    }
  };

  const weeks = [];
  for (let w = 1; w <= 8; w++) {
    if (w < startWeek) continue;
    const rawTemplate = templateForWeek(w);
    const template = ensureMondayIsEasy(rawTemplate);
    const phaseName = w <= 4 ? 'basePlan1' : 'basePlan2';

    const workouts = dayKeys.map((day, di) => {
      const type = template[di];
      const detail = workoutDetails[type] || workoutDetails.rest;
      const duracion = duracionFor(type, w, di);
      return {
        day,
        type,
        km: null,
        duracion,
        desc: detail.desc,
      };
    });

    const volumeMin = workouts.reduce((sum, x) => sum + (x.duracion || 0), 0);

    let keyWorkout = null;
    if (w <= 6) {
      keyWorkout = workouts.find((x) => x.type === 'longTrail') || null;
    } else {
      keyWorkout = workouts.find((x) => x.type === 'tempo')
        || workouts.find((x) => x.type === 'longTrail')
        || null;
    }

    weeks.push({
      week: w,
      weekNumber: w,
      phase: phaseName,
      kmTotal: 0,
      volumeMin,
      desnivel: 0,
      workouts,
      keyWorkout,
    });
  }

  // First active day of the plan must be easy (never recovery/rest as first run).
  const easyDesc = workoutDetails.easy.desc;
  for (const week of weeks) {
    const firstActive = week.workouts.find((wo) => wo.type !== 'rest');
    if (!firstActive) continue;
    firstActive.type = 'easy';
    firstActive.duracion = 30;
    firstActive.desc = { ...easyDesc };
    week.volumeMin = week.workouts.reduce((sum, x) => sum + (x.duracion || 0), 0);
    break;
  }

  return {
    weeks,
    totalWeeks: 8,
    idealWeeks: 8,
    insufficient: false,
    startWeek,
    isBasePlan: true,
  };
}

const STORAGE_KEY = 'trailready_plan';
const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

function AppFlow({ lang, setLang }) {
  const [screen, setScreen]       = useState('splash');
  const [raceData, setRaceData]   = useState(null);
  const [profile, setProfile]     = useState(null);
  const [plan, setPlan]           = useState(null);
  const [recovery, setRecovery]   = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (Date.now() - state.savedAt < NINETY_DAYS) {
        setPlan(state.plan);
        setRaceData(state.raceData);
        setProfile(state.profile);
        setCurrentWeek(state.currentWeek || 0);
        setLang(state.language || 'es');
        setScreen('today');
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleLanguage = (l) => { setLang(l); setScreen('source'); };

  const handleRaceData = (data) => { setRaceData(data); setScreen('profile'); };

  const handleProfile = (p) => {
    const newPlan = raceData?.isBasePlan ? generateBasePlan(p) : generatePlan(raceData, p);
    setProfile(p);
    setPlan(newPlan);
    setScreen('today');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      plan: newPlan,
      raceData,
      profile: p,
      currentWeek: 0,
      language: lang,
      savedAt: Date.now(),
    }));
  };

  const handleRecovery = (type) => { setRecovery(type); setScreen('recovery'); };

  const handleNewPlan = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlan(null);
    setRaceData(null);
    setProfile(null);
    setCurrentWeek(0);
    setScreen('source');
  };

  const props = { lang, raceData, profile, plan, currentWeek, setCurrentWeek };

  if (screen === 'splash')     return <SplashScreen onDone={() => setScreen('language')} />;
  if (screen === 'language')  return <LanguageScreen onSelect={handleLanguage} />;
  if (screen === 'source')    return <SourceScreen {...props} onNext={handleRaceData} />;
  if (screen === 'profile')   return <ProfileScreen {...props} onNext={handleProfile} onBack={() => setScreen('source')} />;
  if (screen === 'today')     return <TodayScreen {...props} onWeek={() => setScreen('week')} onRecovery={handleRecovery} onRaceProfile={() => setScreen('raceProfile')} onNewPlan={handleNewPlan} />;
  if (screen === 'week')      return <WeekScreen {...props} onToday={() => setScreen('today')} onRecovery={handleRecovery} />;
  if (screen === 'recovery')  return <RecoveryScreen {...props} type={recovery} onBack={() => setScreen('today')} />;
  if (screen === 'raceProfile') return <RaceProfileScreen {...props} onBack={() => setScreen('today')} onToday={() => setScreen('today')} onWeek={() => setScreen('week')} />;
}

export default function App() {
  const [lang, setLang] = useState('en');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} setLang={setLang} />} />
        <Route path="/app" element={<AppFlow lang={lang} setLang={setLang} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}