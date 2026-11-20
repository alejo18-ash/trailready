import { useState } from 'react';
import { planLengthWeeks } from '../utils/planWeeks';
import { t } from '../i18n';
import Icon from '../components/Icon';

const s = {
  wrap: { minHeight:'100vh', background:'#F0F4F8', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter', system-ui, sans-serif" },
  card: { width:'100%', maxWidth:340 },
  back: { fontSize:12, color:'rgba(18,29,41,0.62)', cursor:'pointer', marginBottom:16, display:'block' },
  racePill: { display:'inline-flex', alignItems:'center', gap:6, background:'rgba(234,42,48,0.08)', border:'0.5px solid rgba(234,42,48,0.2)', borderRadius:20, padding:'5px 12px', marginBottom:16 },
  racePillText: { fontSize:12, color:'#EA2A30', fontWeight:500 },
  raceTags: { display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 },
  tag: () => ({ padding:'4px 12px', borderRadius:20, fontSize:13, fontWeight:600, background:'#FFFFFF', border:'1px solid rgba(18,29,41,0.1)', color:'#121D29' }),
  sectionLabel: { fontSize:12, color:'rgba(18,29,41,0.62)', letterSpacing:0.5, marginBottom:8, marginTop:16 },
  heading: { fontSize:32, fontWeight:700, color:'#121D29', marginBottom:4, fontFamily:'var(--font-display)', lineHeight:1.05 },
  optRow: { display:'flex', gap:7, flexWrap:'wrap', marginBottom:4 },
  opt: (active) => ({
    padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
    background: active ? 'rgba(234,42,48,0.1)' : 'rgba(18,29,41,0.04)',
    border: active ? '1px solid rgba(234,42,48,0.25)' : '0.5px solid rgba(18,29,41,0.09)',
    color: active ? '#EA2A30' : 'rgba(18,29,41,0.64)',
  }),
  weekInput: { background:'#FFFFFF', border:'0.5px solid rgba(18,29,41,0.12)', borderRadius:10, padding:'11px 14px', color:'#121D29', fontSize:13, outline:'none', width:'100%', boxSizing:'border-box', marginTop:6 },
  warning: { background:'rgba(251,191,36,0.1)', border:'0.5px solid rgba(251,191,36,0.2)', borderRadius:10, padding:'10px 12px', marginTop:12, fontSize:12, color:'#b45309' },
  btn: { marginTop:20, background:'#EA2A30', borderRadius:13, padding:14, textAlign:'center', fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer', border:'none', width:'100%' },
};

export default function ProfileScreen({ lang, raceData, onNext, onBack }) {
  const [nivel, setNivel]           = useState('intermediate');
  const [kmSemanales, setKm]        = useState('40');
  const [dias, setDias]             = useState('5');
  const [alreadyTraining, setAT]    = useState(false);
  const [startWeek, setStartWeek]   = useState('1');
  const [terrain, setTerrain]       = useState('mountain');

  const { total: planWeeks, ideal: idealWeeks, available, insufficient } = planLengthWeeks(raceData);

  const handleNext = () => {
    onNext({ nivel, kmSemanales, diasDisponibles: dias, startWeek: alreadyTraining ? startWeek : '1', terrain });
  };

  return (
    <div className="screen-enter" style={s.wrap}>
      <div style={s.card}>
        <span style={s.back} onClick={onBack}>← {lang==='es' ? 'Volver' : 'Back'}</span>

        <div style={s.racePill}>
          <Icon name="flag" size={14} />
          <span style={s.racePillText}>{raceData.name}</span>
        </div>

        <div style={s.raceTags}>
          <span style={s.tag()}>{raceData.distancia} km</span>
          <span style={s.tag()}>{raceData.desnivel?.toLocaleString()}m D+</span>
          {raceData.fecha && <span style={s.tag()}>{raceData.fecha}</span>}
          <span style={s.tag()}>
            {planWeeks} {t(lang,'weeksAvailable')}
          </span>
        </div>

        {insufficient && (
          <div style={s.warning}>
            <Icon name="alert" size={14} style={{ marginRight:6 }} />{lang==='es'
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
              max={planWeeks - 1}
              value={startWeek}
              onChange={e => setStartWeek(e.target.value)}
              placeholder={lang==='es' ? 'Ej: 6' : 'e.g. 6'}
            />
          </>
        )}

        <div style={s.sectionLabel}>{lang === 'es' ? '¿Dónde entrenas?' : 'Where do you train?'}</div>
        <div style={s.optRow}>
          <div style={s.opt(terrain === 'mountain')} onClick={() => setTerrain('mountain')}>
            <Icon name="mountain" size={16} style={{ marginRight:6 }} />{lang === 'es' ? 'Tengo montañas cerca' : 'Mountains / hills nearby'}
          </div>
          <div style={s.opt(terrain === 'flat')} onClick={() => setTerrain('flat')}>
            <Icon name="sunrise" size={16} style={{ marginRight:6 }} />{lang === 'es' ? 'Zona principalmente plana' : 'Mostly flat terrain'}
          </div>
        </div>

        <button style={s.btn} onClick={handleNext}>{t(lang,'generatePlan')}</button>
      </div>
    </div>
  );
}