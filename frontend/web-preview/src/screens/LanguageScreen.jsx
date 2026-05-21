const s = {
    wrap: { minHeight:'100vh', background:'#F0F4F8', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter', system-ui, sans-serif" },
    card: { width:'100%', maxWidth:340, },
    logo: { textAlign:'center', marginBottom:36 },
    logoBox: { width:64, height:64, margin:'0 auto 16px', background:'#EA2A30', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 },
    title: { fontSize:26, fontWeight:700, color:'#121D29', letterSpacing:-0.5 },
    subtitle: { fontSize:13, color:'rgba(18,29,41,0.45)', marginTop:6 },
    label: { fontSize:11, color:'rgba(18,29,41,0.4)', letterSpacing:0.5, marginBottom:12 },
    option: (active) => ({
      display:'flex', alignItems:'center', gap:14, padding:'16px 18px',
      background: active ? 'rgba(234,42,48,0.08)' : '#FFFFFF',
      border: active ? '1px solid rgba(234,42,48,0.25)' : '0.5px solid rgba(18,29,41,0.1)',
      borderRadius:14, marginBottom:10, cursor:'pointer', transition:'all 0.15s',
      boxShadow: active ? 'none' : '0 1px 3px rgba(18,29,41,0.05)',
    }),
    flag: { fontSize:26 },
    optionText: { flex:1 },
    optionTitle: (active) => ({ fontSize:15, fontWeight:600, color: active ? '#121D29' : 'rgba(18,29,41,0.7)' }),
    optionSub: { fontSize:11, color:'rgba(18,29,41,0.4)', marginTop:2 },
    check: { width:20, height:20, borderRadius:'50%', background:'#EA2A30', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#FFFFFF', fontWeight:700 },
    btn: { marginTop:8, background:'#EA2A30', borderRadius:13, padding:14, textAlign:'center', fontSize:14, fontWeight:600, color:'#fff', cursor:'pointer', border:'none', width:'100%' },
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