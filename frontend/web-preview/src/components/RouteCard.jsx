import { useState } from 'react';
import Icon from './Icon';

// Draws the loop's shape (no map tiles needed) so the runner sees what they'll run.
function RouteShape({ points, height = 150 }) {
  if (!points?.length) return null;
  const lat0 = points[0][0] * Math.PI / 180;
  const xy = points.map(([lat, lon]) => [lon * Math.cos(lat0), -lat]);
  const xs = xy.map(p => p[0]), ys = xy.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 320, H = height, pad = 14;
  const k = Math.min((W - pad * 2) / Math.max(maxX - minX, 1e-9), (H - pad * 2) / Math.max(maxY - minY, 1e-9));
  const ox = (W - (maxX - minX) * k) / 2, oy = (H - (maxY - minY) * k) / 2;
  const pts = xy.map(([x, y]) => [ox + (x - minX) * k, oy + (y - minY) * k]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Route shape" style={{ display:'block', background:'#F0F4F8', borderRadius:16 }}>
      <path d={d} fill="none" stroke="rgba(234,42,48,0.18)" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#EA2A30" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="7" fill="#121D29" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

function downloadGpx(route, name) {
  const trkpts = route.points.map(([lat, lon, ele]) => `<trkpt lat="${lat}" lon="${lon}">${ele != null ? `<ele>${ele}</ele>` : ''}</trkpt>`).join('');
  const gpx = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="TrailReady" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${name}</name><trkseg>${trkpts}</trkseg></trk></gpx>`;
  const url = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.gpx`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const card = { background:'#FFFFFF', borderRadius:24, padding:20, border:'1px solid rgba(18,29,41,0.06)', marginBottom:16 };
const eyebrow = { fontSize:12, fontWeight:700, color:'#EA2A30', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:6 };

export default function RouteCard({ lang, state, data, error, onRetry, onLogin }) {
  const es = lang === 'es';
  const [sel, setSel] = useState(0);
  if (state === 'off') return null;

  if (state === 'login') {
    return (
      <div style={card}>
        <div style={eyebrow}><Icon name="map" size={14} />{es ? 'Ruta de hoy' : "Today's route"}</div>
        <div style={{ fontSize:15, color:'rgba(18,29,41,0.78)', lineHeight:1.5, marginBottom:12 }}>
          {es ? 'Inicia sesión y te armamos un circuito real de la distancia de hoy, saliendo desde donde estás.' : "Sign in and we'll build a real loop of today's distance, starting where you are."}
        </div>
        <button type="button" onClick={onLogin} style={{ width:'100%', minHeight:48, borderRadius:14, border:'none', background:'rgba(234,42,48,0.08)', color:'#EA2A30', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          {es ? 'Iniciar sesión' : 'Sign in'}
        </button>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div style={card} aria-busy="true">
        <div style={eyebrow}><Icon name="map" size={14} />{es ? 'Buscando tu ruta…' : 'Finding your route…'}</div>
        <div className="tr-skeleton" style={{ height:16, width:'80%', marginBottom:12 }} />
        <div className="tr-skeleton" style={{ height:150, borderRadius:16 }} />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={{ ...card, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div style={{ fontSize:14, color:'rgba(18,29,41,0.78)', lineHeight:1.4 }}>{error || (es ? 'No pudimos cargar rutas.' : "Couldn't load routes.")}</div>
        <button type="button" onClick={onRetry} style={{ flexShrink:0, minHeight:44, padding:'0 16px', borderRadius:12, border:'1px solid rgba(18,29,41,0.12)', background:'#fff', fontSize:14, fontWeight:600, color:'#121D29', cursor:'pointer', fontFamily:'inherit' }}>
          {es ? 'Reintentar' : 'Retry'}
        </button>
      </div>
    );
  }

  if (state !== 'ready' || !data?.routes?.length) return null;
  const r = data.routes[Math.min(sel, data.routes.length - 1)];
  const stats = [
    { v: r.km, u: 'km', l: es ? 'distancia' : 'distance' },
    { v: r.ascentM, u: 'm', l: es ? 'desnivel' : 'climb' },
    r.unpavedPct != null ? { v: r.unpavedPct, u: '%', l: es ? 'tierra / sendero' : 'dirt / trail' } : null,
  ].filter(Boolean);

  return (
    <div style={card}>
      <div style={eyebrow}><Icon name="map" size={14} />{es ? 'Ruta de hoy' : "Today's route"}</div>
      {sel === 0 && data.reason && (
        <p style={{ fontSize:15, color:'rgba(18,29,41,0.78)', lineHeight:1.5, margin:'0 0 12px' }}>{es ? data.reason.es : data.reason.en}</p>
      )}
      {data.routes.length > 1 && (
        <div role="tablist" style={{ display:'flex', gap:8, marginBottom:12 }}>
          {data.routes.map((_, i) => (
            <button key={i} type="button" role="tab" aria-selected={sel === i} onClick={() => setSel(i)}
              style={{ flex:1, minHeight:40, borderRadius:12, border: sel === i ? 'none' : '1px solid rgba(18,29,41,0.1)', background: sel === i ? '#121D29' : '#fff', color: sel === i ? '#fff' : '#121D29', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              {i === 0 ? (es ? 'Recomendada' : 'Recommended') : `${es ? 'Opción' : 'Option'} ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <RouteShape points={r.points} />
      <div style={{ display:'flex', gap:24, margin:'16px 0' }}>
        {stats.map(st => (
          <div key={st.l}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'#121D29', lineHeight:1 }}>
              {st.v}<span style={{ fontSize:14, marginLeft:2, color:'rgba(18,29,41,0.66)' }}>{st.u}</span>
            </div>
            <div style={{ fontSize:12, color:'rgba(18,29,41,0.66)', marginTop:4 }}>{st.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer"
          style={{ flex:1, minHeight:48, borderRadius:14, background:'#121D29', color:'#fff', fontSize:14, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6, textDecoration:'none' }}>
          {es ? 'Abrir en Maps' : 'Open in Maps'}<Icon name="arrowUpRight" size={16} />
        </a>
        <button type="button" onClick={() => downloadGpx(r, `TrailReady ${r.km}km`)}
          style={{ flex:1, minHeight:48, borderRadius:14, border:'1px solid rgba(18,29,41,0.12)', background:'#fff', color:'#121D29', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          {es ? 'Descargar GPX' : 'Download GPX'}
        </button>
      </div>
      <div style={{ fontSize:12, color:'rgba(18,29,41,0.66)', marginTop:12, lineHeight:1.4 }}>
        {es ? 'Revisa el terreno y el acceso antes de salir.' : 'Check terrain and access before you go.'} {data.source}
      </div>
    </div>
  );
}
