import { t } from '../i18n';
import BottomNav from '../components/BottomNav';

const GODS = [
  { icon: '🏹', nk: 'god1Name', sk: 'god1Sub', bk: 'god1Body', active: true },
  { icon: '⚔️', nk: 'god2Name', sk: 'god2Sub', bk: 'god2Body', active: true },
  { icon: '⏳', nk: 'god3Name', sk: 'god3Sub', bk: 'god3Body', active: true },
  { icon: '🪽', nk: 'god4Name', sk: 'god4Sub', bk: 'god4Body', active: false },
  { icon: '🐍', nk: 'god5Name', sk: 'god5Sub', bk: 'god5Body', active: false },
];

export default function OlympusScreen({ lang, plan, raceData, onToday, onWeek }) {
  const hasPlan = !!(plan?.weeks?.length);

  return (
    <div className="screen-enter" style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font)',
      paddingBottom: 80,
      maxWidth: 600,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        maxWidth: 600,
        margin: '0 auto',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 8 }}>
          {lang === 'es' ? 'LOS PLANES' : 'THE PLANS'}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
          {lang === 'es' ? 'El Olimpo' : 'Olympus'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-60)', marginTop: 8 }}>
          {lang === 'es' ? 'Todos los planes disponibles para ti.' : 'All plans available to you.'}
        </p>
      </div>

      {/* God cards */}
      <div style={{ padding: '0 20px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {GODS.map(({ icon, nk, sk, bk, active }) => (
          <div key={nk} style={{
            background: active ? '#FFFFFF' : 'rgba(18,29,41,0.02)',
            border: `1px solid ${active ? 'rgba(18,29,41,0.08)' : 'rgba(18,29,41,0.04)'}`,
            borderRadius: 20,
            padding: '24px 20px',
            opacity: active ? 1 : 0.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: active ? '0 1px 4px rgba(18,29,41,0.06)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '2rem' }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>
                    {t(lang, `landing.${nk}`)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-30)', marginTop: 2 }}>
                    {t(lang, `landing.${sk}`)}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 100,
                background: active ? 'rgba(var(--green-ch), 0.1)' : 'rgba(18,29,41,0.06)',
                color: active ? 'var(--green)' : 'var(--text-30)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                alignSelf: 'flex-start',
                marginTop: 2,
              }}>
                {active ? (lang === 'es' ? 'ACTIVO' : 'ACTIVE') : (lang === 'es' ? 'PRÓXIMAMENTE' : 'COMING SOON')}
              </span>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-60)', lineHeight: 1.6, margin: 0, paddingLeft: 44 }}>
              {t(lang, `landing.${bk}`)}
            </p>

            {active && (
              <div style={{ paddingLeft: 44, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onToday}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(var(--green-ch), 0.35)',
                    color: 'var(--green)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '7px 18px',
                    borderRadius: 100,
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {hasPlan ? (lang === 'es' ? 'Ver mi plan →' : 'See my plan →') : (lang === 'es' ? 'Empezar →' : 'Get started →')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav active="olympus" lang={lang} onToday={onToday} onPlan={onWeek} onProfile={onToday} />
    </div>
  );
}
