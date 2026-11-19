import { useEffect, useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { t } from '../i18n';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STORE = 'trailready_coach_chat';
const C = { text:'#121D29', muted:'rgba(18,29,41,0.55)', faint:'rgba(18,29,41,0.08)', red:'#EA2A30', navy:'#121D29' };

function loadChat() {
  try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; }
}
function saveChat(msgs) {
  try { localStorage.setItem(STORE, JSON.stringify(msgs.slice(-30))); } catch { /* ignore */ }
}

const SUGGESTIONS = {
  es: ['Me duele algo', 'Perdí entrenamientos esta semana', 'Esta semana solo puedo 3 días', 'Analiza mi última carrera', '¿Me conviene esta carrera?'],
  en: ['Something hurts', 'I missed workouts this week', 'I only have 3 days this week', 'Review my last race', 'Is this race a good idea?'],
};

export default function CoachScreen({ lang, user, plan, raceData, profile, currentWeek, completions, onApply, onLogin, onToday, onWeek, onPlans, onProfile }) {
  const es = lang === 'es';
  const [msgs, setMsgs] = useState(loadChat);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { saveChat(msgs); endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (textArg) => {
    const text = (textArg ?? input).trim();
    if (!text || busy) return;
    setInput(''); setError('');
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next); setBusy(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lang, plan, raceData, profile, currentWeek, completions, messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || (es ? 'El coach no respondió.' : 'The coach did not respond.'));
      setMsgs([...next, { role: 'assistant', content: data.text, proposal: data.proposal || null, status: data.proposal ? 'pending' : null }]);
    } catch (e) {
      setError(e.message || (es ? 'Sin conexión. Intenta de nuevo.' : 'No connection. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  const decide = (i, accept) => {
    const m = msgs[i];
    let status = 'rejected';
    if (accept) status = onApply(m.proposal) > 0 ? 'applied' : 'none';
    const note = { applied: es ? '[Cambio aplicado al plan]' : '[Change applied to the plan]', rejected: es ? '[Cambio descartado]' : '[Change dismissed]', none: es ? '[No había días futuros que cambiar]' : '[No upcoming days to change]' }[status];
    setMsgs(msgs.map((x, j) => j === i ? { ...x, status, content: `${x.content}\n${note}` } : x));
  };

  const wrap = { minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", maxWidth:600, margin:'0 auto', width:'100%', boxSizing:'border-box', padding:'20px 16px 150px' };
  const nav = <BottomNav active="coach" lang={lang} onToday={onToday} onPlan={onWeek} onPlans={onPlans} onProfile={onProfile} />;

  if (!user) {
    return (
      <div style={wrap}>
        <h1 style={{ fontSize:26, fontWeight:800, color:C.text, margin:'4px 0 12px' }}>Coach</h1>
        <div style={{ background:'#fff', borderRadius:16, padding:20, border:`1px solid ${C.faint}` }}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:6 }}>{es ? 'Tu coach ajusta el plan contigo' : 'Your coach adjusts the plan with you'}</div>
          <div style={{ fontSize:14, color:C.muted, lineHeight:1.5, marginBottom:16 }}>
            {es ? 'Cuéntale si te duele algo, si perdiste días o si cambió tu carrera, y te propone cambios que tú apruebas. Necesitas una cuenta para usarlo.' : 'Tell it if something hurts, you missed days or your race changed, and it proposes changes you approve. You need an account to use it.'}
          </div>
          <button type="button" onClick={onLogin} style={{ width:'100%', padding:14, borderRadius:14, border:'none', background:C.red, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {es ? 'Continuar con Google' : 'Continue with Google'}
          </button>
        </div>
        {nav}
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:C.text, margin:'4px 0 4px' }}>Coach</h1>
        {msgs.length > 0 && (
          <button type="button" onClick={() => setMsgs([])} style={{ background:'none', border:'none', color:C.muted, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            {es ? 'Nueva conversación' : 'New chat'}
          </button>
        )}
      </div>
      <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
        {es ? 'Orientación de entrenamiento, no consejo médico. Si el dolor es fuerte, consulta a un profesional.' : 'Training guidance, not medical advice. If pain is severe, see a professional.'}
      </div>

      {msgs.length === 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
          {SUGGESTIONS[es ? 'es' : 'en'].map(sug => (
            <button key={sug} type="button" onClick={() => send(sug)}
              style={{ background:'#fff', border:`1px solid ${C.faint}`, borderRadius:999, padding:'9px 14px', fontSize:13, color:C.text, cursor:'pointer', fontFamily:'inherit' }}>
              {sug}
            </button>
          ))}
        </div>
      )}

      {msgs.map((m, i) => (
        <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom:10 }}>
          <div style={{ maxWidth:'85%', background: m.role === 'user' ? C.navy : '#fff', color: m.role === 'user' ? '#fff' : C.text, borderRadius:16, padding:'11px 14px', fontSize:14, lineHeight:1.5, whiteSpace:'pre-wrap', border: m.role === 'user' ? 'none' : `1px solid ${C.faint}` }}>
            {m.content}
            {m.proposal && (
              <div style={{ marginTop:10, background:'#F0F4F8', borderRadius:12, padding:12 }}>
                <div style={{ fontSize:11, letterSpacing:'0.06em', color:C.red, fontWeight:700, marginBottom:6 }}>{es ? 'CAMBIO PROPUESTO' : 'PROPOSED CHANGE'}</div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>{m.proposal.summary}</div>
                {m.proposal.changes.map((c, k) => (
                  <div key={k} style={{ fontSize:12, color:C.muted, marginBottom:4 }}>
                    {es ? 'Sem' : 'Wk'} {c.week} · {t(lang, `days.${c.day}`)}: <b style={{ color:C.text }}>{t(lang, `workouts.${c.type}`)}{c.km ? ` ${c.km} km` : ''}</b> — {es ? c.desc_es : c.desc_en}
                  </div>
                ))}
                {m.status === 'pending' ? (
                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <button type="button" onClick={() => decide(i, true)} style={{ flex:1, padding:10, borderRadius:999, border:'none', background:C.red, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>{es ? 'Aplicar al plan' : 'Apply to plan'}</button>
                    <button type="button" onClick={() => decide(i, false)} style={{ flex:1, padding:10, borderRadius:999, border:`1px solid ${C.faint}`, background:'#fff', color:C.text, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>{es ? 'Descartar' : 'Dismiss'}</button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ))}
      {busy && <div style={{ fontSize:13, color:C.muted, margin:'4px 4px 10px' }}>{es ? 'El coach está pensando…' : 'Coach is thinking…'}</div>}
      {error && <div style={{ fontSize:13, color:C.red, margin:'4px 4px 10px' }}>{error}</div>}
      <div ref={endRef} />

      <form onSubmit={(e) => { e.preventDefault(); send(); }}
        style={{ position:'fixed', left:0, right:0, bottom:'calc(64px + env(safe-area-inset-bottom))', background:'#F0F4F8', padding:'10px 16px', borderTop:`1px solid ${C.faint}`, zIndex:999 }}>
        <div style={{ maxWidth:568, margin:'0 auto', display:'flex', gap:8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} maxLength={1500}
            placeholder={es ? 'Escríbele a tu coach…' : 'Message your coach…'}
            style={{ flex:1, padding:'12px 14px', borderRadius:999, border:`1px solid ${C.faint}`, fontSize:16, fontFamily:'inherit', background:'#fff', color:C.text, minWidth:0 }} />
          <button type="submit" disabled={busy || !input.trim()}
            style={{ padding:'0 18px', borderRadius:999, border:'none', background:C.red, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', opacity: busy || !input.trim() ? 0.5 : 1 }}>
            {es ? 'Enviar' : 'Send'}
          </button>
        </div>
      </form>
      {nav}
    </div>
  );
}
