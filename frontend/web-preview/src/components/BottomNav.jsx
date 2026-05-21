const icons = {
  today: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#00FF87' : 'rgba(255,255,255,0.4)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  plan: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#00FF87' : 'rgba(255,255,255,0.4)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  olympus: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#00FF87' : 'rgba(255,255,255,0.4)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="3" y1="22" x2="21" y2="22"/>
      <line x1="5" y1="22" x2="5" y2="10"/>
      <line x1="19" y1="22" x2="19" y2="10"/>
      <line x1="9" y1="22" x2="9" y2="6"/>
      <line x1="15" y1="22" x2="15" y2="6"/>
      <line x1="7" y1="10" x2="17" y2="10"/>
      <line x1="9" y1="6" x2="15" y2="6"/>
    </svg>
  ),
  profile: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#00FF87' : 'rgba(255,255,255,0.4)'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const labels = {
  today:   { es: 'Hoy',    en: 'Today'   },
  plan:    { es: 'Plan',   en: 'Plan'    },
  olympus: { es: 'Olimpo', en: 'Olympus' },
  profile: { es: 'Perfil', en: 'Profile' },
};

export default function BottomNav({ active, lang, onToday, onPlan, onWeek, onOlympus, onProfile }) {
  const tabs = [
    { key: 'today',   fn: onToday              },
    { key: 'plan',    fn: onPlan || onWeek      },
    { key: 'olympus', fn: onOlympus             },
    { key: 'profile', fn: onProfile             },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: '#111111',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'stretch',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(({ key, fn }) => (
        <button
          key={key}
          type="button"
          onClick={fn}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: fn ? 'pointer' : 'default',
            padding: '8px 0',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {icons[key](active === key)}
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: active === key ? '#00FF87' : 'rgba(255,255,255,0.6)',
            letterSpacing: '0.04em',
          }}>
            {labels[key][lang || 'es']}
          </span>
        </button>
      ))}
    </div>
  );
}
