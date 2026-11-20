import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import Icon, { IconBadge } from '../components/Icon';
import { currentWeekIndex } from '../utils/planWeeks';

const C = { text:'#121D29', muted:'rgba(18,29,41,0.66)', faint:'rgba(18,29,41,0.08)', red:'#EA2A30' };

function planTitle(state, es) {
  const rd = state.raceData;
  if (rd?.isPreBase) return es ? 'Plan principiante' : 'Beginner plan';
  if (rd?.isBasePlan) return es ? 'Plan base' : 'Base plan';
  return rd?.name || (es ? 'Plan de carrera' : 'Race plan');
}
function doneCount(completions) {
  return Object.values(completions || {}).filter(v => v?.status === 'completed').length;
}
function fmtDate(iso, es) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return isNaN(d) ? null : d.toLocaleDateString(es ? 'es-ES' : 'en-US', { day:'numeric', month:'short', year:'numeric' });
}

export default function PlansScreen({ lang, plan, raceData, currentWeek, completions, savedPlans = [], onActivate, onDelete, onNewPlan, onToday, onWeek, onProfile }) {
  const es = lang === 'es';
  const [confirm, setConfirm] = useState(null); // { type:'delete'|'new', id? }
  const [busy, setBusy] = useState(false);
  const active = plan ? { plan, raceData, completions } : null;

  const run = async (fn) => { setBusy(true); try { await fn(); } finally { setBusy(false); setConfirm(null); } };

  const card = { background:'#fff', borderRadius:20, border:`1px solid ${C.faint}`, padding:16, marginBottom:12 };
  const meta = (state, weekIdx) => [
    state.raceData?.distancia ? `${state.raceData.distancia} km` : null,
    fmtDate(state.raceData?.fecha, es),
    state.plan?.weeks?.length ? `${es ? 'Semana' : 'Week'} ${(weekIdx ?? 0) + 1}/${state.plan.weeks.length}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="screen-enter" style={{ minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", maxWidth:600, margin:'0 auto', padding:'20px 16px 96px', boxSizing:'border-box' }}>
      <h1 style={{ fontSize:36, fontWeight:700, margin:'4px 0 16px', fontFamily:'var(--font-display)', lineHeight:1, color:C.text }}>{es ? 'Mis planes' : 'My plans'}</h1>

      {active && (
        <div style={{ ...card, border:`1.5px solid rgba(234,42,48,0.35)` }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.red, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>{es ? 'Activo' : 'Active'}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <IconBadge name="flag" size={44} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{planTitle(active, es)}</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{meta(active, currentWeek)}</div>
            </div>
          </div>
          <div style={{ fontSize:13, color:C.muted, marginTop:10 }}>
            <Icon name="check" size={14} color={C.red} /> {doneCount(completions)} {es ? 'entrenamientos hechos' : 'workouts done'}
          </div>
          <button type="button" onClick={onToday} style={{ width:'100%', minHeight:48, marginTop:12, borderRadius:14, border:'none', background:'#121D29', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            {es ? 'Ir a hoy' : 'Go to today'}
          </button>
        </div>
      )}

      <button type="button" onClick={() => plan ? setConfirm({ type:'new' }) : onNewPlan()}
        style={{ width:'100%', minHeight:52, borderRadius:16, border:`1.5px dashed rgba(18,29,41,0.2)`, background:'transparent', color:C.text, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:20 }}>
        + {es ? 'Crear otro plan' : 'Create another plan'}
      </button>

      {savedPlans.length > 0 && (
        <>
          <div style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 4px 8px' }}>{es ? 'Guardados' : 'Saved'}</div>
          {savedPlans.map(sp => (
            <div key={sp.id} style={card}>
              <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{planTitle(sp, es)}</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{meta(sp, currentWeekIndex(sp.plan, sp.savedAt))}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>
                {doneCount(sp.completions)} {es ? 'hechos' : 'done'} · {es ? 'guardado el' : 'saved'} {fmtDate(new Date(sp.archivedAt).toISOString(), es)}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button type="button" disabled={busy} onClick={() => run(() => onActivate(sp.id))} style={{ flex:1, minHeight:44, borderRadius:12, border:'none', background:'rgba(234,42,48,0.08)', color:C.red, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  {es ? 'Activar' : 'Make active'}
                </button>
                <button type="button" disabled={busy} onClick={() => setConfirm({ type:'delete', id: sp.id, name: planTitle(sp, es) })} style={{ minHeight:44, padding:'0 16px', borderRadius:12, border:`1px solid ${C.faint}`, background:'#fff', color:C.muted, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
                  {es ? 'Borrar' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {!active && savedPlans.length === 0 && (
        <div style={{ ...card, textAlign:'center', color:C.muted, fontSize:14 }}>{es ? 'Todavía no tienes planes.' : "You don't have any plans yet."}</div>
      )}

      {confirm && (
        <div role="dialog" aria-modal="true" style={{ position:'fixed', inset:0, background:'rgba(18,29,41,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:'0 24px' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'24px 20px', maxWidth:340, width:'100%' }}>
            <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>
              {confirm.type === 'delete' ? (es ? `¿Borrar "${confirm.name}"?` : `Delete "${confirm.name}"?`) : (es ? '¿Crear otro plan?' : 'Create another plan?')}
            </div>
            <div style={{ fontSize:14, color:C.muted, lineHeight:1.5, marginBottom:20 }}>
              {confirm.type === 'delete'
                ? (es ? 'Se borra el plan y su progreso. No se puede deshacer.' : 'The plan and its progress are deleted. This cannot be undone.')
                : (es ? 'Tu plan actual queda guardado aquí y puedes volver a activarlo cuando quieras.' : 'Your current plan stays saved here and you can make it active again anytime.')}
            </div>
            <button type="button" disabled={busy} onClick={() => run(() => confirm.type === 'delete' ? onDelete(confirm.id) : onNewPlan())}
              style={{ width:'100%', padding:13, borderRadius:100, border:'none', background:C.red, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:10, opacity: busy ? 0.6 : 1 }}>
              {busy ? '…' : confirm.type === 'delete' ? (es ? 'Sí, borrar' : 'Yes, delete') : (es ? 'Sí, crear otro' : 'Yes, create another')}
            </button>
            <button type="button" onClick={() => setConfirm(null)} style={{ width:'100%', padding:13, borderRadius:100, border:`1px solid ${C.faint}`, background:'#fff', color:C.text, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
              {es ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      <BottomNav active="plans" lang={lang} onToday={onToday} onPlan={onWeek} onProfile={onProfile} />
    </div>
  );
}
