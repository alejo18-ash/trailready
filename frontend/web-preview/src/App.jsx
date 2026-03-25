import { useState } from 'react';
import { translations } from './i18n';
import SplashScreen from './screens/SplashScreen';
import LanguageScreen from './screens/LanguageScreen';
import SourceScreen from './screens/SourceScreen';
import ProfileScreen from './screens/ProfileScreen';
import TodayScreen from './screens/TodayScreen';
import WeekScreen from './screens/WeekScreen';
import RecoveryScreen from './screens/RecoveryScreen';
import RaceProfileScreen from './screens/RaceProfileScreen';

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
  };

  const dayKeys = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weeks = [];
  let weekNum = 1;

  for (const phase of phases) {
    for (let i = 0; i < phase.weeks; i++) {
      if (weekNum < startWeek) { weekNum++; continue; }
      const progress = phase.weeks === 1 ? 1 : i / (phase.weeks - 1);
      const kmTotal = Math.round((phase.kmStart + (phase.kmEnd - phase.kmStart) * progress) * multiplier);
      const template = [...templates[phase.name]];

      const activeDays = Number(profile.diasDisponibles);
      if (activeDays <= 4) template[4] = 'rest';
      else if (activeDays >= 6) template[4] = 'cross';

      const workouts = dayKeys.map((day, di) => {
        const type = template[di];
        const detail = workoutDetails[type] || workoutDetails.rest;
        return {
          day,
          type,
          km: detail.pct ? Math.round(kmTotal * detail.pct) : null,
          desc: detail.desc,
        };
      });

      if (profile.terrain === 'flat' && Number(raceData.desnivel) > 1500) {
        // Flat runner mode: simulate elevation on long trails (and add hill strength tips).
        const longTrailDay = workouts.find(w => w.type === 'longTrail');
        if (longTrailDay) {
          longTrailDay.flatAlternative = true;
          longTrailDay.flatTips = {
            en: 'Flat zone — add elevation simulation after your run: 45min treadmill at 10-12% incline, OR 8-10 staircase repeats (min 10 floors), OR 6 parking garage ramp repeats',
            es: 'Zona plana — agrega simulación de desnivel después de correr: 45min treadmill al 10-12% inclinación, O 8-10 repeticiones de escaleras (mínimo 10 pisos), O 6 subidas de rampa de parking',
          };
        }

        const strengthDay = workouts.find(w => w.type === 'strength');
        if (strengthDay) {
          strengthDay.flatTips = {
            en: 'Add: Step-ups with heavy load 4×15 each leg — simulates uphill muscle recruitment',
            es: 'Agrega: Step-ups con carga pesada 4×15 cada pierna — simula reclutamiento muscular de subida',
          };
        }
      }

      const keyWorkoutTypes = {
        base: 'longTrail',
        build: 'intervals',
        peak: 'longTrail',
        taper: 'shortTrail',
      };
      const keyType = keyWorkoutTypes[phase.name];
      const keyDay = workouts.find(w => w.type === keyType);

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

export default function App() {
  const [screen, setScreen]       = useState('splash');
  const [lang, setLang]           = useState('en');
  const [raceData, setRaceData]   = useState(null);
  const [profile, setProfile]     = useState(null);
  const [plan, setPlan]           = useState(null);
  const [recovery, setRecovery]   = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);

  const handleLanguage = (l) => { setLang(l); setScreen('source'); };

  const handleRaceData = (data) => { setRaceData(data); setScreen('profile'); };

  const handleProfile = (p) => {
    setProfile(p);
    setPlan(generatePlan(raceData, p));
    setScreen('today');
  };

  const handleRecovery = (type) => { setRecovery(type); setScreen('recovery'); };

  const props = { lang, raceData, profile, plan, currentWeek, setCurrentWeek };

  if (screen === 'splash')     return <SplashScreen onDone={() => setScreen('language')} />;
  if (screen === 'language')  return <LanguageScreen onSelect={handleLanguage} />;
  if (screen === 'source')    return <SourceScreen {...props} onNext={handleRaceData} />;
  if (screen === 'profile')   return <ProfileScreen {...props} onNext={handleProfile} onBack={() => setScreen('source')} />;
  if (screen === 'today')     return <TodayScreen {...props} onWeek={() => setScreen('week')} onRecovery={handleRecovery} onRaceProfile={() => setScreen('raceProfile')} />;
  if (screen === 'week')      return <WeekScreen {...props} onToday={() => setScreen('today')} onRecovery={handleRecovery} />;
  if (screen === 'recovery')  return <RecoveryScreen {...props} type={recovery} onBack={() => setScreen('today')} />;
  if (screen === 'raceProfile') return <RaceProfileScreen {...props} onBack={() => setScreen('today')} onToday={() => setScreen('today')} onWeek={() => setScreen('week')} />;
}