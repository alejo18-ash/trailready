const TABS = [
  { key: 'today',   icon: '⚡', es: 'Hoy',    en: 'Today'   },
  { key: 'week',    icon: '📅', es: 'Plan',   en: 'Plan'    },
  { key: 'olympus', icon: '🏛️', es: 'Olimpo', en: 'Olympus' },
  { key: 'profile', icon: '👤', es: 'Perfil', en: 'Profile' },
];

export default function BottomNav({ lang, active, onToday, onWeek, onOlympus, onProfile }) {
  const actions = { today: onToday, week: onWeek, olympus: onOlympus, profile: onProfile };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      borderTop: '0.5px solid rgba(255,255,255,0.07)',
      background: '#0d0d1a',
      zIndex: 50,
    }}>
      {TABS.map(({ key, icon, es, en }) => {
        const isActive = active === key;
        const action = actions[key];
        return (
          <button
            key={key}
            type="button"
            onClick={action}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: action ? 'pointer' : 'default',
              padding: '10px 0 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: isActive ? '#4ade80' : 'rgba(255,255,255,0.35)',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 700 : 400, letterSpacing: '0.02em' }}>
              {lang === 'es' ? es : en}
            </span>
          </button>
        );
      })}
    </div>
  );
}
