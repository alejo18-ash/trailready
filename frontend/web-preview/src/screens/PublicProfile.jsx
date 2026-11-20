import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { loadPublicProfile } from '../services/gearService';
import { GEAR_TYPES, buyUrl } from '../utils/gear';

const C = { text:'#121D29', muted:'rgba(18,29,41,0.66)', faint:'rgba(18,29,41,0.08)', red:'#EA2A30' };

export default function PublicProfile({ lang }) {
  const { uid } = useParams();
  const navigate = useNavigate();
  // Visitors arrive from a shared link: follow their browser language.
  const es = typeof navigator !== 'undefined' && navigator.language ? navigator.language.toLowerCase().startsWith('es') : lang === 'es';
  const [state, setState] = useState('loading');
  const [p, setP] = useState(null);

  useEffect(() => {
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000));
    Promise.race([loadPublicProfile(uid), timeout])
      .then(d => { setP(d); setState(d ? 'ready' : 'missing'); })
      .catch(() => setState('missing'));
  }, [uid]);

  useEffect(() => {
    if (p?.name) document.title = `${p.name} · ${es ? 'Mi equipo' : 'My gear'} · TrailReady`;
  }, [p, es]);

  const wrap = { minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", maxWidth:560, margin:'0 auto', padding:'24px 16px 48px', boxSizing:'border-box' };

  if (state === 'loading') return <div style={wrap}><div className="tr-skeleton" style={{ height:120, borderRadius:20 }} /></div>;
  if (state === 'missing') return (
    <div style={{ ...wrap, textAlign:'center', paddingTop:80 }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}><Logo size={56} /></div>
      <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{es ? 'Esta página no existe o es privada.' : 'This page does not exist or is private.'}</div>
      <button type="button" onClick={() => navigate('/')} style={{ marginTop:20, minHeight:48, padding:'0 20px', borderRadius:14, border:'none', background:C.red, color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
        {es ? 'Conocer TrailReady' : 'Discover TrailReady'}
      </button>
    </div>
  );

  const groups = Object.keys(GEAR_TYPES).map(t => [t, (p.gear || []).filter(g => g.type === t)]).filter(([, items]) => items.length);

  return (
    <div style={wrap}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        {p.photoURL
          ? <img src={p.photoURL} alt="" referrerPolicy="no-referrer" style={{ width:88, height:88, borderRadius:'50%', objectFit:'cover', border:'3px solid #fff', boxShadow:'0 4px 16px rgba(18,29,41,0.12)' }} />
          : <div style={{ display:'flex', justifyContent:'center' }}><Logo size={88} /></div>}
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, color:C.text, margin:'12px 0 4px', lineHeight:1, textTransform:'uppercase' }}>{p.name || 'Runner'}</h1>
        <div style={{ fontSize:14, color:C.muted }}>{es ? 'Mi equipo de running' : 'My running gear'}</div>
        {p.race?.name && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:12, background:'#fff', border:`1px solid ${C.faint}`, borderRadius:999, padding:'8px 14px', fontSize:13, fontWeight:600, color:C.text }}>
            <Icon name="flag" size={14} color={C.red} />
            {es ? 'Entrenando para ' : 'Training for '}{p.race.name}{p.race.km ? ` · ${p.race.km} km` : ''}
          </div>
        )}
      </div>

      {groups.length === 0 && <div style={{ textAlign:'center', color:C.muted, fontSize:14 }}>{es ? 'Todavía no hay equipo publicado.' : 'No gear published yet.'}</div>}

      {groups.map(([type, items]) => (
        <section key={type} style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:12, fontWeight:700, color:C.muted, letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 4px 8px' }}>{GEAR_TYPES[type][es ? 'es' : 'en']}</h2>
          {items.map(g => (
            <a key={g.id} href={buyUrl(g)} target="_blank" rel="noopener noreferrer sponsored"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, background:'#fff', borderRadius:16, border:`1px solid ${C.faint}`, padding:'16px', marginBottom:8, textDecoration:'none', minHeight:56 }}>
              <span style={{ minWidth:0 }}>
                <span style={{ display:'block', fontSize:16, fontWeight:700, color:C.text }}>{[g.brand, g.model].filter(Boolean).join(' ')}</span>
                {g.note && <span style={{ display:'block', fontSize:13, color:C.muted, marginTop:2 }}>{g.note}</span>}
              </span>
              <Icon name="arrowUpRight" size={18} color={C.red} />
            </a>
          ))}
        </section>
      ))}

      <p style={{ fontSize:12, color:C.muted, lineHeight:1.5, textAlign:'center', margin:'8px 0 24px' }}>
        {es ? 'Algunos links pueden ser de afiliado: si compras, el creador o TrailReady pueden recibir una comisión sin costo extra para ti.' : 'Some links may be affiliate links: if you buy, the creator or TrailReady may earn a commission at no extra cost to you.'}
      </p>
      <button type="button" onClick={() => navigate('/')} style={{ width:'100%', minHeight:52, borderRadius:16, border:'none', background:'#121D29', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        <Logo size={24} />{es ? 'Crea tu plan gratis en TrailReady' : 'Create your free plan on TrailReady'}
      </button>
    </div>
  );
}
