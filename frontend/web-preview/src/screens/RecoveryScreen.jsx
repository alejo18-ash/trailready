import { t } from '../i18n';

const videos = {
  stretching: {
    url: 'https://www.youtube.com/results?search_query=post+trail+run+stretching',
    icon: '🧘',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.25)',
    tags: {
      en: ['Quads','Hamstrings','Calves','Hip flexors','IT band'],
      es: ['Cuádriceps','Isquios','Pantorrilla','Flexores cadera','Banda IT'],
    },
  },
  iceBath: {
    url: 'https://www.youtube.com/results?search_query=ice+bath+protocol+recovery+athletes',
    icon: '🧊',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.25)',
    tags: {
      en: ['Inflammation','Muscles','Recovery','10 min'],
      es: ['Inflamación','Músculos','Recuperación','10 min'],
    },
  },
  nutrition: {
    url: 'https://www.youtube.com/results?search_query=post+trail+run+nutrition+recovery',
    icon: '🍌',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
    tags: {
      en: ['Carbs','Protein','Hydration','Timing'],
      es: ['Carbos','Proteína','Hidratación','Timing'],
    },
  },
};

const titles = {
  stretching: { en:'Post-trail stretching',  es:'Estiramiento post-trail' },
  iceBath:    { en:'Ice bath protocol',       es:'Protocolo ice bath' },
  nutrition:  { en:'Post-run nutrition',      es:'Nutrición post-entreno' },
};

const subs = {
  stretching: { en:'15 min · trail runners', es:'15 min · trail runners' },
  iceBath:    { en:'10 min · recovery',       es:'10 min · recuperación' },
  nutrition:  { en:'Carbs + protein guide',   es:'Guía carbos + proteína' },
};

const s = {
  wrap: { minHeight:'100vh', background:'#0d0d1a', fontFamily:'system-ui, sans-serif', padding:'0 0 40px' },
  header: { padding:'14px 20px 12px', display:'flex', alignItems:'center', gap:12 },
  back: { fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer' },
  headerTitle: { fontSize:16, fontWeight:700, color:'#fff' },
  section: { padding:'0 20px' },
  sectionLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:10 },
  mainCard: (bg, border) => ({
    background:bg, border:`1px solid ${border}`, borderRadius:14, padding:16, marginBottom:12,
  }),
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  cardTitle: { fontSize:14, fontWeight:600, color:'#fff' },
  cardSub: { fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 },
  ytBadge: (color, bg) => ({
    background:bg, borderRadius:8, padding:'4px 10px', fontSize:10, color, fontWeight:500, cursor:'pointer', border:'none',
  }),
  thumbnail: {
    background:'#1a1a2e', borderRadius:10, height:90, display:'flex', alignItems:'center',
    justifyContent:'center', border:'0.5px solid rgba(255,255,255,0.08)', cursor:'pointer', marginBottom:10,
  },
  playBtn: { width:32, height:32, background:'rgba(248,113,113,0.8)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 },
  tagsLabel: { fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:0.5, marginBottom:6 },
  tags: { display:'flex', gap:5, flexWrap:'wrap' },
  tag: (color, bg) => ({ background:bg, color, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:500 }),
  otherCard: (bg, border) => ({
    background:bg, border:`0.5px solid ${border}`, borderRadius:14, padding:'12px 14px',
    marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer',
  }),
  otherTitle: { fontSize:13, fontWeight:600, color:'#fff' },
  otherSub: { fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 },
};

export default function RecoveryScreen({ lang, type, onBack }) {
  const current = videos[type] || videos.stretching;
  const others  = Object.entries(videos).filter(([k]) => k !== type);

  const openVideo = (url) => window.open(url, '_blank');

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.back} onClick={onBack}>←</span>
        <div style={s.headerTitle}>{t(lang,'afterYourRun')}</div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>{lang==='es' ? 'RECOMENDADO PARA HOY' : 'RECOMMENDED FOR TODAY'}</div>

        <div style={s.mainCard(current.bg, current.border)}>
          <div style={s.cardHeader}>
            <div>
              <div style={s.cardTitle}>{titles[type]?.[lang]}</div>
              <div style={s.cardSub}>{subs[type]?.[lang]}</div>
            </div>
            <button style={s.ytBadge(current.color, `${current.bg}`)}
              onClick={() => openVideo(current.url)}>
              ↗ YouTube
            </button>
          </div>

          <div style={s.thumbnail} onClick={() => openVideo(current.url)}>
            <div style={s.playBtn}>▶</div>
          </div>

          <div style={s.tagsLabel}>{t(lang,'covers')}</div>
          <div style={s.tags}>
            {current.tags[lang].map(tag => (
              <span key={tag} style={s.tag(current.color, current.bg)}>{tag}</span>
            ))}
          </div>
        </div>

        <div style={s.sectionLabel}>{lang==='es' ? 'TAMBIÉN RECOMENDADO' : 'ALSO RECOMMENDED'}</div>

        {others.map(([key, vid]) => (
          <div key={key} style={s.otherCard(vid.bg, vid.border)} onClick={() => openVideo(vid.url)}>
            <div>
              <div style={s.otherTitle}>{vid.icon} {titles[key]?.[lang]}</div>
              <div style={s.otherSub}>{subs[key]?.[lang]}</div>
            </div>
            <span style={{fontSize:11, color:vid.color}}>↗ YouTube</span>
          </div>
        ))}
      </div>
    </div>
  );
}