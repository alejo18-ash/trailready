import { t } from '../i18n';

const LIBRARY = {
  base: {
    duration: 35,
    exercises: [
      {
        name:  { en: 'Bulgarian Split Squat', es: 'Sentadilla Búlgara' },
        sets:  '3×8',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Glutes · Quads', es: 'Glúteos · Cuádriceps' },
        note:  { en: 'Control the descent — 3 seconds down', es: 'Controla el descenso — 3 segundos bajando' },
        video: 'https://www.youtube.com/results?search_query=bulgarian+split+squat+trail+running',
      },
      {
        name:  { en: 'Single-Leg Romanian Deadlift', es: 'Peso Muerto Rumano 1 pierna' },
        sets:  '3×10',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Hamstrings · Glute Med', es: 'Isquiotibiales · Glúteo medio' },
        note:  { en: 'Keep hips level — this is your anti-roll insurance on trails', es: 'Mantén las caderas niveladas — tu seguro contra torceduras en trail' },
        video: 'https://www.youtube.com/results?search_query=single+leg+deadlift+runners',
      },
      {
        name:  { en: 'Single-Leg Calf Raise', es: 'Elevación de Talón 1 pierna' },
        sets:  '3×15',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Calves · Soleus', es: 'Gemelos · Sóleo' },
        note:  { en: 'Go slow on the way down — eccentric is where the magic happens', es: 'Lento en el descenso — el excéntrico es donde ocurre la magia' },
        video: 'https://www.youtube.com/results?search_query=eccentric+calf+raise+runners',
      },
      {
        name:  { en: 'Dead Bug', es: 'Dead Bug' },
        sets:  '3×10',
        unit:  { en: 'each side', es: 'cada lado' },
        focus: { en: 'Core · Lumbar stability', es: 'Core · Estabilidad lumbar' },
        note:  { en: 'Lower back stays glued to the floor the entire time', es: 'La espalda baja pegada al suelo en todo momento' },
        video: 'https://www.youtube.com/results?search_query=dead+bug+exercise+core',
      },
      {
        name:  { en: 'Single-Leg Glute Bridge', es: 'Puente de Glúteo 1 pierna' },
        sets:  '3×12',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Glute · Posterior chain', es: 'Glúteo · Cadena posterior' },
        note:  { en: 'Drive through the heel, not the toes', es: 'Empuja con el talón, no con los dedos' },
        video: 'https://www.youtube.com/results?search_query=single+leg+glute+bridge',
      },
      {
        name:  { en: 'Side-Lying Hip Abduction', es: 'Abducción de Cadera Lateral' },
        sets:  '3×15',
        unit:  { en: 'each side', es: 'cada lado' },
        focus: { en: 'Glute Med · IT Band', es: 'Glúteo medio · IT Band' },
        note:  { en: 'The most underrated exercise for trail runners — prevents IT band issues', es: 'El ejercicio más subestimado para trail — previene el síndrome de la IT' },
        video: 'https://www.youtube.com/results?search_query=hip+abduction+runners',
      },
    ],
  },

  build: {
    duration: 40,
    exercises: [
      {
        name:  { en: 'Step-Up with Knee Drive', es: 'Step-Up con Rodilla' },
        sets:  '4×10',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Quads · Glutes', es: 'Cuádriceps · Glúteos' },
        note:  { en: 'Drive the knee up explosively — mimic the uphill running motion', es: 'Sube la rodilla explosivamente — imita el movimiento de subida en trail' },
        video: 'https://www.youtube.com/results?search_query=step+up+knee+drive+running',
      },
      {
        name:  { en: 'Nordic Hamstring Curl', es: 'Nordic Hamstring Curl' },
        sets:  '3×6',
        unit:  null,
        focus: { en: 'Hamstrings', es: 'Isquiotibiales' },
        note:  { en: 'One of the best injury prevention exercises for runners — go slow', es: 'Uno de los mejores ejercicios preventivos para corredores — ve lento' },
        video: 'https://www.youtube.com/results?search_query=nordic+hamstring+curl+runners',
      },
      {
        name:  { en: 'Bulgarian Split Squat (heavy)', es: 'Sentadilla Búlgara (pesada)' },
        sets:  '4×6',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Max strength', es: 'Fuerza máxima' },
        note:  { en: 'Same movement as base phase — heavier load, fewer reps', es: 'Mismo movimiento que base — más carga, menos repeticiones' },
        video: 'https://www.youtube.com/results?search_query=bulgarian+split+squat+trail+running',
      },
      {
        name:  { en: 'Pallof Press', es: 'Pallof Press' },
        sets:  '3×12',
        unit:  { en: 'each side', es: 'cada lado' },
        focus: { en: 'Anti-rotation core', es: 'Core anti-rotacional' },
        note:  { en: 'Resist rotation — this is your core stability for technical descents', es: 'Resiste la rotación — estabilidad de core para bajadas técnicas' },
        video: 'https://www.youtube.com/results?search_query=pallof+press+core+stability',
      },
      {
        name:  { en: 'Box Jump', es: 'Salto al Cajón' },
        sets:  '4×5',
        unit:  null,
        focus: { en: 'Power · Reactive lower body', es: 'Potencia · Tren inferior reactivo' },
        note:  { en: "Land softly — absorb the impact, don't crash into it", es: 'Aterriza suave — absorbe el impacto, no lo ignores' },
        video: 'https://www.youtube.com/results?search_query=box+jump+trail+runner+power',
      },
      {
        name:  { en: 'Copenhagen Plank', es: 'Plancha Copenhagen' },
        sets:  '3×20 sec',
        unit:  { en: 'each side', es: 'cada lado' },
        focus: { en: 'Adductors · Hip stability', es: 'Aductores · Estabilidad de cadera' },
        note:  { en: 'Underused by runners — protects the inner knee on technical terrain', es: 'Poco usado por corredores — protege la rodilla interna en terreno técnico' },
        video: 'https://www.youtube.com/results?search_query=copenhagen+plank+runners',
      },
    ],
  },

  peak: {
    duration: 35,
    exercises: [
      {
        name:  { en: 'Single-Leg Box Jump', es: 'Salto al Cajón 1 pierna' },
        sets:  '4×4',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Unilateral power', es: 'Potencia unilateral' },
        note:  { en: 'Race-specific power — one leg at a time, just like on the trail', es: 'Potencia específica de carrera — una pierna a la vez, como en el trail' },
        video: 'https://www.youtube.com/results?search_query=single+leg+box+jump+athletes',
      },
      {
        name:  { en: 'Bulgarian Split Squat (max load)', es: 'Sentadilla Búlgara (carga máxima)' },
        sets:  '4×5',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Max strength', es: 'Fuerza máxima' },
        note:  { en: 'Peak strength — heaviest load of the entire plan', es: 'Fuerza peak — la carga más pesada de todo el plan' },
        video: 'https://www.youtube.com/results?search_query=bulgarian+split+squat+trail+running',
      },
      {
        name:  { en: 'Nordic Hamstring Curl', es: 'Nordic Hamstring Curl' },
        sets:  '3×5',
        unit:  null,
        focus: { en: 'Injury prevention', es: 'Prevención de lesiones' },
        note:  { en: 'Maintain the hamstring protection going into race week', es: 'Mantén la protección de isquios antes de la semana de carrera' },
        video: 'https://www.youtube.com/results?search_query=nordic+hamstring+curl+runners',
      },
      {
        name:  { en: 'Single-Leg Calf Raise (loaded)', es: 'Elevación de Talón 1 pierna (con carga)' },
        sets:  '4×12',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Achilles tendon', es: 'Tendón de Aquiles' },
        note:  { en: 'Your Achilles takes 8x body weight on every trail step — protect it', es: 'Tu Aquiles recibe 8x tu peso en cada paso de trail — protégelo' },
        video: 'https://www.youtube.com/results?search_query=eccentric+calf+raise+runners',
      },
      {
        name:  { en: 'RKC Plank', es: 'Plancha RKC' },
        sets:  '3×30 sec',
        unit:  null,
        focus: { en: 'Total core endurance', es: 'Core total' },
        note:  { en: 'Core endurance for the final miles when form breaks down', es: 'Resistencia de core para los últimos kilómetros cuando la técnica falla' },
        video: 'https://www.youtube.com/results?search_query=RKC+plank+core+endurance',
      },
    ],
  },

  taper: {
    duration: 25,
    exercises: [
      {
        name:  { en: 'Single-Leg Squat (bodyweight)', es: 'Sentadilla 1 pierna (sin carga)' },
        sets:  '3×6',
        unit:  { en: 'each leg', es: 'cada pierna' },
        focus: { en: 'Activation', es: 'Activación' },
        note:  { en: 'Keep the legs awake — no heavy loads this close to race day', es: 'Mantén las piernas activas — sin carga pesada tan cerca de la carrera' },
        video: 'https://www.youtube.com/results?search_query=single+leg+squat+bodyweight',
      },
      {
        name:  { en: 'Glute Activation Circuit', es: 'Circuito de Activación de Glúteos' },
        sets:  '2×12',
        unit:  { en: 'each', es: 'cada uno' },
        focus: { en: 'Pre-race activation', es: 'Activación pre-carrera' },
        note:  { en: 'Race week activation — wake up the glutes before they need to fire', es: 'Activación pre-carrera — despierta los glúteos antes de la carrera' },
        video: 'https://www.youtube.com/results?search_query=glute+activation+circuit+runners',
      },
      {
        name:  { en: 'Calf Raises (light, both legs)', es: 'Elevación de Talones (ligero, ambas)' },
        sets:  '2×15',
        unit:  null,
        focus: { en: 'Maintenance', es: 'Mantenimiento' },
        note:  { en: 'Light maintenance only — protect the Achilles for race day', es: 'Solo mantenimiento — protege el Aquiles para el día de carrera' },
        video: 'https://www.youtube.com/results?search_query=calf+raise+taper+week+runners',
      },
      {
        name:  { en: 'Dead Bug', es: 'Dead Bug' },
        sets:  '2×8',
        unit:  { en: 'each side', es: 'cada lado' },
        focus: { en: 'Light core', es: 'Core suave' },
        note:  { en: 'Keep the core online — light and controlled', es: 'Core activo — ligero y controlado' },
        video: 'https://www.youtube.com/results?search_query=dead+bug+exercise+core',
      },
    ],
  },
};

const PHASE_LABEL = {
  base:  { en: 'BASE — Tissue Resilience',      es: 'BASE — Resiliencia Tisular'    },
  build: { en: 'BUILD — Power & Endurance',     es: 'BUILD — Potencia y Resistencia'},
  peak:  { en: 'PEAK — Race-Specific Power',    es: 'PEAK — Potencia Específica'    },
  taper: { en: 'TAPER — Maintain & Activate',   es: 'TAPER — Mantener y Activar'   },
};

function normalizePhase(phase) {
  if (phase === 'basePlan1' || phase === 'basePlan2') return 'base';
  return LIBRARY[phase] ? phase : 'base';
}

const s = {
  wrap:      { minHeight: '100vh', background: '#0d0d1a', fontFamily: 'system-ui, sans-serif', paddingBottom: 40 },
  header:    { padding: '14px 20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' },
  backBtn:   { background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '0 0 10px', fontFamily: 'inherit', display: 'block' },
  title:     { fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 },
  subtitle:  { fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.3 },
  list:      { padding: '12px 16px' },
  card: {
    background: 'rgba(167,139,250,0.07)',
    border: '0.5px solid rgba(167,139,250,0.2)',
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 10,
  },
  cardNum:   { fontSize: 10, color: 'rgba(167,139,250,0.65)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 },
  cardName:  { fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 },
  cardMeta:  { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  cardFocus: { fontSize: 10, color: 'rgba(167,139,250,0.8)', marginBottom: 8 },
  cardNote: {
    fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55,
    borderLeft: '2px solid rgba(167,139,250,0.35)', paddingLeft: 8, marginBottom: 10,
  },
  videoBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 11, color: '#a78bfa', fontWeight: 600, fontFamily: 'inherit', padding: 0,
  },
  whyBox: {
    margin: '8px 16px 0',
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.65,
  },
};

export default function StrengthScreen({ lang, phase, onBack }) {
  const p    = normalizePhase(phase);
  const data = LIBRARY[p];
  const sub  = t(lang, 'strength.subtitle')
    .replace('{n}', String(data.duration))
    .replace('{x}', String(data.exercises.length));

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button type="button" style={s.backBtn} onClick={onBack}>
          ← {lang === 'es' ? 'Volver' : 'Back'}
        </button>
        <div style={s.title}>💪 {t(lang, 'strength.title')}</div>
        <div style={s.subtitle}>
          {PHASE_LABEL[p]?.[lang]} · {sub}
        </div>
      </div>

      <div style={s.list}>
        {data.exercises.map((ex, i) => (
          <div key={i} style={s.card}>
            <div style={s.cardNum}>
              {lang === 'es' ? `EJERCICIO ${i + 1}` : `EXERCISE ${i + 1}`}
            </div>
            <div style={s.cardName}>{ex.name[lang] || ex.name.en}</div>
            <div style={s.cardMeta}>
              {ex.sets}{ex.unit ? ` · ${ex.unit[lang] || ex.unit.en}` : ''}
            </div>
            <div style={s.cardFocus}>📍 {ex.focus[lang] || ex.focus.en}</div>
            <div style={s.cardNote}>"{ex.note[lang] || ex.note.en}"</div>
            <button
              type="button"
              style={s.videoBtn}
              onClick={() => window.open(ex.video, '_blank')}
            >
              {t(lang, 'strength.watchVideo')} ↗
            </button>
          </div>
        ))}
      </div>

      <div style={s.whyBox}>{t(lang, 'strength.whyStrength')}</div>
    </div>
  );
}
