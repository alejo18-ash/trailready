import { useState } from 'react';
import { t } from '../i18n';

const s = {
  wrap: { minHeight:'100vh', background:'#0d0d1a', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter', system-ui, sans-serif" },
  card: { width:'100%', maxWidth:340 },
  back: { fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer', marginBottom:16, display:'block' },
  racePill: { display:'inline-flex', alignItems:'center', gap:6, background:'rgba(29,158,117,0.15)', border:'0.5px solid rgba(29,158,117,0.3)', borderRadius:20, padding:'5px 12px', marginBottom:16 },
  racePillText: { fontSize:12, color:'#4ade80', fontWeight:500 },
  raceTags: { display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 },
  tag: (color) => ({ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:`rgba(${color},0.12)`, color:`rgb(${color})` }),
  sectionLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:8, marginTop:16 },
  heading: { fontSize:20, fontWeight:700, color:'#fff', marginBottom:4 },
  optRow: { display:'flex', gap:7, flexWrap:'wrap', marginBottom:4 },
  opt: (active) => ({
    padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
    background: active ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid rgba(74,222,128,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
    color: active ? '#4ade80' : 'rgba(255,255,255,0.5)',
  }),
  weekInput: { background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:13, outline:'none', width:'100%', boxSizing:'border-box', marginTop:6 },
  warning: { background:'rgba(251,191,36,0.1)', border:'0.5px solid rgba(251,191,36,0.2)', borderRadius:10, padding:'10px 12px', marginTop:12, fontSize:12, color:'#fbbf24' },
  btn: { marginTop:20, background:'#1d9e75', borderRadius:13, padding:14, textAlign:'center', fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer', border:'none', width:'100%' },
};

export default function ProfileScreen({ lang, raceData, onNext, onBack }) {
  const [nivel, setNivel]           = useState('intermediate');
  const [kmSemanales, setKm]        = useState('40');
  const [dias, setDias]             = useState('5');
  const [alreadyTraining, setAT]    = useState(false);
  const [startWeek, setStartWeek]   = useState('1');
  const [terrain, setTerrain]       = useState('mountain');

  const idealWeeks = raceData.distancia <= 25 ? 10
  : raceData.distancia <= 35 ? 12
  : raceData.distancia <= 55 ? 16
  : raceData.distancia <= 80 ? 20
  : raceData.distancia <= 110 ? 24
  : 28;

  const available = raceData.weeksAvailable || idealWeeks;
  const insufficient = available < idealWeeks * 0.6;

  const handleNext = () => {
    onNext({ nivel, kmSemanales, diasDisponibles: dias, startWeek: alreadyTraining ? startWeek : '1', terrain });
  };

  return (
    <div className="screen-enter" style={s.wrap}>
      <div style={s.card}>
        <span style={s.back} onClick={onBack}>← {lang==='es' ? 'Volver' : 'Back'}</span>

        <div style={s.racePill}>
          <span style={{fontSize:14}}>🏁</span>
          <span style={s.racePillText}>{raceData.name}</span>
        </div>

        <div style={s.raceTags}>
          <span style={s.tag('74,222,128')}>{raceData.distancia} km</span>
          <span style={s.tag('251,191,36')}>{raceData.desnivel?.toLocaleString()}m D+</span>
          {raceData.fecha && <span style={s.tag('96,165,250')}>{raceData.fecha}</span>}
          <span style={s.tag('167,139,250')}>
            {Math.min(idealWeeks, available)} {t(lang,'weeksAvailable')}
          </span>
        </div>

        {insufficient && (
          <div style={s.warning}>
            ⚠️ {lang==='es'
              ? `Tiempo ajustado. Plan ideal: ${idealWeeks} sem, tienes: ${available} sem. Haremos lo mejor posible.`
              : `Tight timeline. Ideal: ${idealWeeks} weeks, you have: ${available}. We'll make it work.`}
          </div>
        )}

        <div style={s.sectionLabel}>{t(lang,'yourProfile')}</div>
        <div style={s.heading}>{lang==='es' ? 'Tu perfil de corredor' : 'Your runner profile'}</div>

        <div style={s.sectionLabel}>{t(lang,'currentLevel')}</div>
        <div style={s.optRow}>
          {[['beginner','principiante'],['intermediate','intermedio'],['advanced','avanzado']].map(([en,es]) => (
            <div key={en} style={s.opt(nivel===en)} onClick={() => setNivel(en)}>
              {t(lang, en)}
            </div>
          ))}
        </div>

        <div style={s.sectionLabel}>{t(lang,'weeklyKm')}</div>
        <div style={s.optRow}>
          {['20','40','60','80'].map(v => (
            <div key={v} style={s.opt(kmSemanales===v)} onClick={() => setKm(v)}>~{v}km</div>
          ))}
        </div>

        <div style={s.sectionLabel}>{lang==='es' ? 'Días disponibles por semana' : 'Available days per week'}</div>
        <div style={s.optRow}>
          {['3','4','5','6'].map(v => (
            <div key={v} style={s.opt(dias===v)} onClick={() => setDias(v)}>
              {v} {lang==='es' ? 'días' : 'days'}
            </div>
          ))}
        </div>

        <div style={s.sectionLabel}>{t(lang,'alreadyTraining')}</div>
        <div style={s.optRow}>
          <div style={s.opt(!alreadyTraining)} onClick={() => setAT(false)}>{t(lang,'startFromZero')}</div>
          <div style={s.opt(alreadyTraining)} onClick={() => setAT(true)}>
            {lang==='es' ? 'Ya entreno' : "I'm already training"}
          </div>
        </div>

        {alreadyTraining && (
          <>
            <div style={s.sectionLabel}>
              {lang==='es' ? '¿En qué semana vas?' : 'Which week are you on?'}
            </div>
            <input
              style={s.weekInput}
              type="number"
              min="1"
              max={Math.min(idealWeeks, available) - 1}
              value={startWeek}
              onChange={e => setStartWeek(e.target.value)}
              placeholder={lang==='es' ? 'Ej: 6' : 'e.g. 6'}
            />
          </>
        )}

        <div style={s.sectionLabel}>{lang === 'es' ? '¿Dónde entrenas?' : 'Where do you train?'}</div>
        <div style={s.optRow}>
          <div style={s.opt(terrain === 'mountain')} onClick={() => setTerrain('mountain')}>
            {lang === 'es' ? '🏔️ Tengo montañas cerca' : '🏔️ Mountains / hills nearby'}
          </div>
          <div style={s.opt(terrain === 'flat')} onClick={() => setTerrain('flat')}>
            {lang === 'es' ? '🌅 Zona principalmente plana' : '🌅 Mostly flat terrain'}
          </div>
        </div>

        <button style={s.btn} onClick={handleNext}>{t(lang,'generatePlan')}</button>
      </div>
    </div>
  );
}