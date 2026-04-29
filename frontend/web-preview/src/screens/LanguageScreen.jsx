const s = {
    wrap: { minHeight:'100vh', background:'#0d0d1a', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter', system-ui, sans-serif" },
    card: { width:'100%', maxWidth:340, },
    logo: { textAlign:'center', marginBottom:36 },
    logoBox: { width:64, height:64, margin:'0 auto 16px', background:'#0f6e56', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 },
    title: { fontSize:26, fontWeight:700, color:'#fff', letterSpacing:-0.5 },
    subtitle: { fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:6 },
    label: { fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:12 },
    option: (active) => ({
      display:'flex', alignItems:'center', gap:14, padding:'16px 18px',
      background: active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
      border: active ? '1px solid rgba(74,222,128,0.3)' : '0.5px solid rgba(255,255,255,0.08)',
      borderRadius:14, marginBottom:10, cursor:'pointer', transition:'all 0.15s',
    }),
    flag: { fontSize:26 },
    optionText: { flex:1 },
    optionTitle: (active) => ({ fontSize:15, fontWeight:600, color: active ? '#fff' : 'rgba(255,255,255,0.6)' }),
    optionSub: { fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 },
    check: { width:20, height:20, borderRadius:'50%', background:'#4ade80', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#0d0d1a', fontWeight:700 },
    btn: { marginTop:8, background:'#1d9e75', borderRadius:13, padding:14, textAlign:'center', fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer', border:'none', width:'100%' },
  };
  
  export default function LanguageScreen({ onSelect }) {
    const options = [
      { code:'en', flag:'🇺🇸', label:'English',  sub:'United States / Canada' },
      { code:'es', flag:'🇲🇽', label:'Español',  sub:'México / España / LATAM' },
    ];
  
    return (
      <div className="screen-enter" style={s.wrap}>
        <div style={s.card}>
          <div style={s.logo}>
            <div style={s.logoBox}>🏔️</div>
            <div style={s.title}>TrailReady</div>
            <div style={s.subtitle}>Select your language / Elige tu idioma</div>
          </div>
  
          <div style={s.label}>SELECT / ELIGE</div>
  
          {options.map(opt => (
            <div key={opt.code} style={s.option(false)} onClick={() => onSelect(opt.code)}>
              <div style={s.flag}>{opt.flag}</div>
              <div style={s.optionText}>
                <div style={s.optionTitle(false)}>{opt.label}</div>
                <div style={s.optionSub}>{opt.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }