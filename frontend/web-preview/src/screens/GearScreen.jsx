import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import Icon, { IconBadge } from '../components/Icon';
import { GEAR_TYPES, DEFAULT_SHOE_LIMIT, shoeKm, buyUrl, newId } from '../utils/gear';
import { publishProfile, unpublishProfile, isPublished } from '../services/gearService';

const C = { text:'#121D29', muted:'rgba(18,29,41,0.66)', faint:'rgba(18,29,41,0.08)', red:'#EA2A30' };
const input = { width:'100%', boxSizing:'border-box', padding:'12px 14px', borderRadius:12, border:`1px solid rgba(18,29,41,0.14)`, fontSize:16, fontFamily:'inherit', color:C.text, background:'#fff' };
const label = { fontSize:12, fontWeight:600, color:C.muted, margin:'12px 0 6px', display:'block' };
const card = { background:'#fff', borderRadius:20, border:`1px solid ${C.faint}`, padding:16, marginBottom:12 };

function ShoeBar({ km, limit }) {
  const pct = Math.min(100, Math.round(km / limit * 100));
  const warn = pct >= 85;
  return (
    <div style={{ marginTop:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.muted, marginBottom:6 }}>
        <span><b style={{ fontFamily:'var(--font-display)', fontSize:22, color: warn ? C.red : C.text }}>{km}</b> / {limit} km</span>
        <span style={{ color: warn ? C.red : C.muted, fontWeight: warn ? 700 : 500 }}>{pct}%</span>
      </div>
      <div style={{ height:8, background:'rgba(18,29,41,0.08)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: warn ? C.red : '#121D29', borderRadius:4 }} />
      </div>
    </div>
  );
}

function GearForm({ lang, initial, onSave, onCancel }) {
  const es = lang === 'es';
  const [f, setF] = useState(initial || { type:'shoes', brand:'', model:'', url:'', startKm:0, limitKm:DEFAULT_SHOE_LIMIT, note:'' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!f.brand.trim() && !f.model.trim()) return setErr(es ? 'Pon al menos la marca o el modelo.' : 'Add at least a brand or model.');
    if (f.url && !/^https:\/\//i.test(f.url.trim())) return setErr(es ? 'El link debe empezar con https://' : 'Link must start with https://');
    onSave({ ...f, brand:f.brand.trim(), model:f.model.trim(), url:f.url.trim(), startKm:Number(f.startKm) || 0, limitKm:Number(f.limitKm) || DEFAULT_SHOE_LIMIT });
  };
  return (
    <form onSubmit={submit} style={card}>
      <label style={label} htmlFor="g-type">{es ? 'Tipo' : 'Type'}</label>
      <select id="g-type" value={f.type} onChange={set('type')} style={input}>
        {Object.entries(GEAR_TYPES).map(([k, v]) => <option key={k} value={k}>{v[es ? 'es' : 'en']}</option>)}
      </select>
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>
          <label style={label} htmlFor="g-brand">{es ? 'Marca' : 'Brand'}</label>
          <input id="g-brand" value={f.brand} onChange={set('brand')} placeholder="Hoka" style={input} />
        </div>
        <div style={{ flex:1 }}>
          <label style={label} htmlFor="g-model">{es ? 'Modelo' : 'Model'}</label>
          <input id="g-model" value={f.model} onChange={set('model')} placeholder="Speedgoat 6" style={input} />
        </div>
      </div>
      {f.type === 'shoes' && (
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1 }}>
            <label style={label} htmlFor="g-start">{es ? 'Km que ya tienen' : 'Km already on them'}</label>
            <input id="g-start" type="number" inputMode="numeric" min="0" value={f.startKm} onChange={set('startKm')} style={input} />
          </div>
          <div style={{ flex:1 }}>
            <label style={label} htmlFor="g-limit">{es ? 'Cambiar a los (km)' : 'Replace at (km)'}</label>
            <input id="g-limit" type="number" inputMode="numeric" min="100" value={f.limitKm} onChange={set('limitKm')} style={input} />
          </div>
        </div>
      )}
      <label style={label} htmlFor="g-url">{es ? 'Link para comprarlo (opcional)' : 'Link to buy it (optional)'}</label>
      <input id="g-url" type="url" inputMode="url" value={f.url} onChange={set('url')} placeholder="https://" style={input} />
      <label style={label} htmlFor="g-note">{es ? 'Nota (opcional)' : 'Note (optional)'}</label>
      <input id="g-note" value={f.note} onChange={set('note')} maxLength={120} placeholder={es ? 'Ej. para trail técnico y lluvia' : 'E.g. for technical trail and rain'} style={input} />
      {err && <div role="alert" style={{ color:C.red, fontSize:13, marginTop:10 }}>{err}</div>}
      <div style={{ display:'flex', gap:8, marginTop:16 }}>
        <button type="submit" style={{ flex:1, minHeight:48, borderRadius:14, border:'none', background:C.red, color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>{es ? 'Guardar' : 'Save'}</button>
        <button type="button" onClick={onCancel} style={{ flex:1, minHeight:48, borderRadius:14, border:`1px solid rgba(18,29,41,0.12)`, background:'#fff', color:C.text, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>{es ? 'Cancelar' : 'Cancel'}</button>
      </div>
    </form>
  );
}

export default function GearScreen({ lang, user, gear, onChange, plan, raceData, completions, onLogin, onBack, onToday, onWeek, onPlans, onProfile }) {
  const es = lang === 'es';
  const [editing, setEditing] = useState(null); // 'new' | item id | null
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pubError, setPubError] = useState('');

  useEffect(() => { if (user) isPublished(user.uid).then(setPublished); }, [user]);

  const active = gear.filter(g => !g.retiredAt);
  const retired = gear.filter(g => g.retiredAt);
  const shareUrl = user ? `${window.location.origin}/u/${user.uid}` : '';

  const save = (data) => {
    let next;
    if (editing === 'new') {
      const item = { ...data, id: newId(), addedAt: Date.now() };
      // First pair of shoes becomes the one runs count towards.
      if (item.type === 'shoes' && !gear.some(g => g.type === 'shoes' && g.default && !g.retiredAt)) item.default = true;
      next = [...gear, item];
    } else {
      next = gear.map(g => g.id === editing ? { ...g, ...data } : g);
    }
    onChange(next); setEditing(null);
    if (published) syncPublic(next);
  };
  const setDefault = (id) => { const next = gear.map(g => g.type === 'shoes' ? { ...g, default: g.id === id } : g); onChange(next); };
  const retire = (id) => { const next = gear.map(g => g.id === id ? { ...g, retiredAt: Date.now(), default: false } : g); onChange(next); if (published) syncPublic(next); };
  const remove = (id) => { const next = gear.filter(g => g.id !== id); onChange(next); if (published) syncPublic(next); };

  const publicData = (items) => ({
    name: user?.displayName || '',
    photoURL: user?.photoURL || '',
    race: raceData?.name ? { name: raceData.name, km: raceData.distancia || null, date: raceData.fecha || null } : null,
    gear: items.filter(g => !g.retiredAt).map(({ id, type, brand, model, url, note }) => ({ id, type, brand, model, url, note })),
  });
  const syncPublic = async (items) => { try { await publishProfile(user.uid, publicData(items)); } catch (e) { console.error(e); } };

  const togglePublic = async () => {
    setBusy(true); setPubError('');
    try {
      if (published) { await unpublishProfile(user.uid); setPublished(false); }
      else { await publishProfile(user.uid, publicData(gear)); setPublished(true); }
    } catch (e) {
      console.error(e);
      setPubError(es ? 'No se pudo actualizar tu página pública. Intenta de nuevo.' : "Couldn't update your public page. Try again.");
    }
    setBusy(false);
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: es ? 'Mi equipo de running' : 'My running gear', url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* user cancelled */ }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", maxWidth:600, margin:'0 auto', padding:'20px 16px 96px', boxSizing:'border-box' }}>
      <button type="button" onClick={onBack} style={{ background:'none', border:'none', color:C.muted, fontSize:14, cursor:'pointer', padding:'4px 0', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:4, minHeight:44 }}>
        <Icon name="chevronLeft" size={16} />{es ? 'Perfil' : 'Profile'}
      </button>
      <h1 style={{ fontSize:36, fontWeight:700, fontFamily:'var(--font-display)', lineHeight:1, color:C.text, margin:'4px 0 6px' }}>{es ? 'Mi equipo' : 'My gear'}</h1>
      <p style={{ fontSize:14, color:C.muted, margin:'0 0 16px', lineHeight:1.5 }}>
        {es ? 'Tus zapatillas suman los km de cada entrenamiento que marcas como hecho.' : 'Your shoes add the km of every workout you mark as done.'}
      </p>

      {editing ? (
        <GearForm lang={lang} initial={editing === 'new' ? null : gear.find(g => g.id === editing)} onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <button type="button" onClick={() => setEditing('new')} style={{ width:'100%', minHeight:52, borderRadius:16, border:`1.5px dashed rgba(18,29,41,0.2)`, background:'transparent', color:C.text, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:16 }}>
          + {es ? 'Agregar equipo' : 'Add gear'}
        </button>
      )}

      {active.length === 0 && !editing && (
        <div style={{ ...card, textAlign:'center', color:C.muted, fontSize:14, lineHeight:1.5 }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}><IconBadge name="footprints" size={44} /></div>
          {es ? 'Empieza con tus zapatillas: te avisamos cuando toque cambiarlas.' : "Start with your shoes: we'll tell you when it's time to replace them."}
        </div>
      )}

      {active.map(g => {
        const km = g.type === 'shoes' ? shoeKm(g, plan, completions) : null;
        return (
          <div key={g.id} style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:8, alignItems:'flex-start' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.red, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  {GEAR_TYPES[g.type]?.[es ? 'es' : 'en']}{g.default ? (es ? ' · en uso' : ' · in use') : ''}
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:C.text, marginTop:2 }}>{[g.brand, g.model].filter(Boolean).join(' ')}</div>
                {g.note && <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{g.note}</div>}
              </div>
              <button type="button" onClick={() => setEditing(g.id)} aria-label={es ? 'Editar' : 'Edit'} style={{ background:'none', border:'none', padding:8, cursor:'pointer', color:C.muted, minWidth:44, minHeight:44 }}><Icon name="pencil" size={16} /></button>
            </div>
            {g.type === 'shoes' && <ShoeBar km={km} limit={g.limitKm || DEFAULT_SHOE_LIMIT} />}
            <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
              {g.type === 'shoes' && !g.default && (
                <button type="button" onClick={() => setDefault(g.id)} style={{ minHeight:40, padding:'0 12px', borderRadius:10, border:`1px solid rgba(18,29,41,0.12)`, background:'#fff', fontSize:13, fontWeight:600, color:C.text, cursor:'pointer', fontFamily:'inherit' }}>{es ? 'Usar estas' : 'Use these'}</button>
              )}
              <a href={buyUrl(g)} target="_blank" rel="noopener noreferrer sponsored" style={{ minHeight:40, padding:'0 12px', borderRadius:10, background:'rgba(234,42,48,0.08)', color:C.red, fontSize:13, fontWeight:600, display:'inline-flex', alignItems:'center', gap:4, textDecoration:'none' }}>
                {g.type === 'shoes' ? (es ? 'Reponer' : 'Restock') : (es ? 'Ver' : 'View')}<Icon name="arrowUpRight" size={14} />
              </a>
              <button type="button" onClick={() => retire(g.id)} style={{ minHeight:40, padding:'0 12px', borderRadius:10, border:'none', background:'none', fontSize:13, color:C.muted, cursor:'pointer', fontFamily:'inherit' }}>{es ? 'Retirar' : 'Retire'}</button>
            </div>
          </div>
        );
      })}

      {retired.length > 0 && (
        <details style={{ margin:'8px 0 16px' }}>
          <summary style={{ fontSize:13, color:C.muted, cursor:'pointer', padding:'8px 0' }}>{es ? `Retirados (${retired.length})` : `Retired (${retired.length})`}</summary>
          {retired.map(g => (
            <div key={g.id} style={{ ...card, opacity:0.8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, color:C.text }}>{[g.brand, g.model].filter(Boolean).join(' ')}{g.type === 'shoes' ? ` · ${shoeKm(g, plan, completions)} km` : ''}</span>
              <button type="button" onClick={() => remove(g.id)} style={{ background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit', minHeight:44 }}>{es ? 'Borrar' : 'Delete'}</button>
            </div>
          ))}
        </details>
      )}

      {/* Public page */}
      <div style={{ ...card, marginTop:8 }}>
        <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{es ? 'Página pública "Mi equipo"' : 'Public "My gear" page'}</div>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.5, margin:'4px 0 12px' }}>
          {es ? 'Un link para tu bio con tu equipo y tu próxima carrera. Muestra tu nombre y foto. Puedes apagarla cuando quieras.' : 'A link for your bio with your gear and next race. Shows your name and photo. Turn it off anytime.'}
        </div>
        {!user ? (
          <button type="button" onClick={onLogin} style={{ width:'100%', minHeight:48, borderRadius:14, border:'none', background:'rgba(234,42,48,0.08)', color:C.red, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{es ? 'Inicia sesión para activarla' : 'Sign in to turn it on'}</button>
        ) : (
          <>
            <button type="button" onClick={togglePublic} disabled={busy} aria-pressed={published}
              style={{ width:'100%', minHeight:48, borderRadius:14, border: published ? `1px solid rgba(18,29,41,0.12)` : 'none', background: published ? '#fff' : '#121D29', color: published ? C.text : '#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity: busy ? 0.6 : 1 }}>
              {busy ? '…' : published ? (es ? 'Apagar página pública' : 'Turn off public page') : (es ? 'Activar página pública' : 'Turn on public page')}
            </button>
            {published && (
              <button type="button" onClick={share} style={{ width:'100%', minHeight:48, marginTop:8, borderRadius:14, border:'none', background:C.red, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                {copied ? (es ? '¡Link copiado!' : 'Link copied!') : (es ? 'Compartir mi link' : 'Share my link')}
              </button>
            )}
            {pubError && <div role="alert" style={{ color:C.red, fontSize:13, marginTop:8 }}>{pubError}</div>}
          </>
        )}
      </div>

      <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginTop:8 }}>
        {es ? 'Algunos links pueden ser de afiliado: si compras, TrailReady puede recibir una comisión sin costo extra para ti.' : 'Some links may be affiliate links: if you buy, TrailReady may earn a commission at no extra cost to you.'}
      </div>

      <BottomNav active="profile" lang={lang} onToday={onToday} onPlan={onWeek} onPlans={onPlans} onProfile={onProfile} />
    </div>
  );
}
