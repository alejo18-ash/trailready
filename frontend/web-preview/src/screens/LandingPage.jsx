import { useState, useEffect } from 'react';
import { t } from '../i18n';
import { useNavigate } from 'react-router-dom';

const GREEN = '#00ff87';
const BG = '#080808';

const MARQUEE_SEG =
  '\u00a0\u00a0\u00a0Runners training for UTMB\u00a0\u00a0·\u00a0\u00a0Western States\u00a0\u00a0·\u00a0\u00a0Leadville\u00a0\u00a0·\u00a0\u00a0Transgrancanaria\u00a0\u00a0·\u00a0\u00a0IAU World Championships\u00a0\u00a0·\u00a0\u00a0Tarawera\u00a0\u00a0·\u00a0\u00a0Hardrock 100\u00a0\u00a0·\u00a0\u00a0and local ultras in 40+ countries';

const COMMUNITY_RACES = [
  { emoji: '🏔️', name: 'UTMB 2026',        count: '247' },
  { emoji: '🌵', name: 'Javelina Jundred',  count: '89'  },
  { emoji: '🏃', name: 'Western States',    count: '134' },
  { emoji: '🌋', name: 'Transgrancanaria',  count: '67'  },
];

const FEATURES = [
  { icon: '🗺️', tk: 'f1Title', bk: 'f1Body' },
  { icon: '💪', tk: 'f2Title', bk: 'f2Body' },
  { icon: '🌦️', tk: 'f3Title', bk: 'f3Body' },
  { icon: '🏃', tk: 'f4Title', bk: 'f4Body' },
  { icon: '🌍', tk: 'f5Title', bk: 'f5Body' },
  { icon: '🇪🇸', tk: 'f6Title', bk: 'f6Body' },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }

@keyframes tr-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.tr-marquee-track {
  display: inline-flex;
  animation: tr-marquee 55s linear infinite;
  white-space: nowrap;
  will-change: transform;
}

.tr-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${GREEN};
  color: #000;
  font-weight: 700;
  font-size: 1rem;
  padding: 18px 40px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 40px rgba(0,255,135,0.4), 0 0 80px rgba(0,255,135,0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  letter-spacing: -0.01em;
  line-height: 1;
}

.tr-cta-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 0 60px rgba(0,255,135,0.65), 0 0 120px rgba(0,255,135,0.3);
}

.tr-feature-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 28px 24px;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.tr-feature-card:hover {
  border-color: rgba(0,255,135,0.3);
  background: rgba(0,255,135,0.025);
}

.tr-community-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 28px 24px;
  transition: border-color 0.25s ease;
}

.tr-community-card:hover {
  border-color: rgba(0,255,135,0.3);
}

.tr-outline-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(0,255,135,0.4);
  color: ${GREEN};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 100px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-family: inherit;
  margin-top: 18px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tr-outline-btn:hover {
  background: rgba(0,255,135,0.12);
}

@media (max-width: 900px) {
  .tr-how-grid     { grid-template-columns: 1fr !important; }
  .tr-feat-grid    { grid-template-columns: repeat(2, 1fr) !important; }
  .tr-comm-grid    { grid-template-columns: repeat(2, 1fr) !important; }
}

@media (max-width: 540px) {
  .tr-feat-grid    { grid-template-columns: 1fr !important; }
  .tr-comm-grid    { grid-template-columns: 1fr !important; }
}
`;

const s = {
  page: {
    minHeight: '100vh',
    background: BG,
    color: '#fff',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    overflowX: 'hidden',
  },

  navWrap: (scrolled) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderTop: '1px solid rgba(0,255,135,0.3)',
    background: scrolled ? 'rgba(10,10,10,0.99)' : 'rgba(10,10,10,0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.3s ease',
  }),
  navInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 800,
    fontSize: 16,
    letterSpacing: -0.4,
    color: '#fff',
  },
  brandEmoji: {
    fontSize: 20,
    filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.8))',
  },
  langToggle: {
    display: 'flex',
    gap: 4,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 999,
    padding: 4,
  },
  langBtn: (active) => ({
    padding: '5px 12px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    background: active ? 'rgba(0,255,135,0.18)' : 'transparent',
    color: active ? GREEN : 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  }),

  hero: {
    paddingTop: 64,
    background: `
      radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0,255,135,0.08) 0%, transparent 65%),
      ${BG}
    `,
    position: 'relative',
    overflow: 'hidden',
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 80px',
  },
  topoOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      repeating-linear-gradient(-54deg, rgba(0,255,135,0.04) 0px, rgba(0,255,135,0.04) 1px, transparent 1px, transparent 80px),
      repeating-linear-gradient(36deg, rgba(0,255,135,0.025) 0px, rgba(0,255,135,0.025) 1px, transparent 1px, transparent 60px)
    `,
    pointerEvents: 'none',
    zIndex: 0,
  },
  heroInner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 800,
    textAlign: 'center',
    width: '100%',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: GREEN,
    marginBottom: 20,
  },
  h1: {
    fontSize: 'clamp(2.4rem, 6vw, 5rem)',
    fontWeight: 900,
    lineHeight: 1.04,
    letterSpacing: '-0.03em',
    color: '#fff',
    margin: '0 0 28px',
    whiteSpace: 'pre-line',
  },
  heroSub: {
    fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
    lineHeight: 1.75,
    color: 'rgba(255,255,255,0.58)',
    maxWidth: 580,
    margin: '0 auto 40px',
  },
  heroCtaWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
  },
  heroTrust: {
    fontSize: '0.76rem',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: '0.02em',
  },

  marqueeBar: {
    borderTop: '1px solid rgba(255,255,255,0.07)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(0,0,0,0.5)',
    padding: '14px 0',
    overflow: 'hidden',
  },
  marqueeText: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.32)',
    paddingRight: 0,
  },

  sectionWrap: {
    padding: 'clamp(60px, 8vw, 100px) 24px',
  },
  sectionContent: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
    marginBottom: 52,
    display: 'block',
  },

  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },
  howCard: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: '32px 28px',
    position: 'relative',
    overflow: 'hidden',
  },
  howNum: {
    position: 'absolute',
    top: -8,
    right: 14,
    fontSize: '8rem',
    fontWeight: 900,
    color: 'rgba(255,255,255,0.035)',
    lineHeight: 1,
    pointerEvents: 'none',
    userSelect: 'none',
    fontFamily: 'inherit',
  },
  howIcon: {
    fontSize: '2rem',
    marginBottom: 18,
    display: 'block',
    position: 'relative',
    zIndex: 1,
  },
  howTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: 10,
    position: 'relative',
    zIndex: 1,
  },
  howBody: {
    fontSize: '0.875rem',
    lineHeight: 1.75,
    color: 'rgba(255,255,255,0.55)',
    position: 'relative',
    zIndex: 1,
  },

  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
  },
  featIconBadge: {
    width: 44,
    height: 44,
    background: 'rgba(0,255,135,0.1)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    marginBottom: 18,
  },
  featTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: 6,
  },
  featBody: {
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.6,
  },

  commTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    textAlign: 'center',
    marginBottom: 10,
    color: '#fff',
  },
  commDesc: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    maxWidth: 520,
    margin: '0 auto',
    lineHeight: 1.7,
  },
  communityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginTop: 48,
  },
  commEmoji: {
    fontSize: '1.8rem',
    marginBottom: 12,
    display: 'block',
  },
  commRaceName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
  },
  commRaceCount: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.45)',
  },

  finalWrap: {
    background: `
      radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,255,135,0.06) 0%, transparent 70%),
      ${BG}
    `,
    padding: 'clamp(80px, 10vw, 120px) 24px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  finalH2: {
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    marginBottom: 40,
    lineHeight: 1.1,
    color: '#fff',
  },
  finalNote: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.32)',
    marginTop: 18,
  },

  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '28px 24px',
    background: BG,
  },
  footerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.45)',
  },
  footerBrandEmoji: {
    filter: 'drop-shadow(0 0 5px rgba(0,255,135,0.6))',
  },
  footerLangRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  footerLangBtn: (active) => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.82rem',
    color: active ? GREEN : 'rgba(255,255,255,0.35)',
    fontWeight: active ? 700 : 400,
    fontFamily: 'inherit',
    padding: '2px 4px',
  }),
  footerDivider: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: '0.8rem',
  },
  footerTagline: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.28)',
    fontStyle: 'italic',
  },
};

export default function LandingPage({ lang, setLang }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('trailready_plan');
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      if (Date.now() - state.savedAt < ninetyDays) setHasSavedPlan(true);
    } catch {
      localStorage.removeItem('trailready_plan');
    }
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div style={s.page} id="top">

        {/* ── SAVED PLAN BANNER ── */}
        {hasSavedPlan && !bannerDismissed && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 200, width: 'calc(100% - 48px)', maxWidth: 560,
            background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: `3px solid ${GREEN}`,
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, flex: 1 }}>
              {t(lang, 'landing.bannerText')}
            </div>
            <button
              type="button"
              onClick={() => navigate('/app')}
              style={{
                background: GREEN, color: '#000', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.8rem', padding: '8px 16px',
                borderRadius: 100, fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {t(lang, 'landing.bannerCta')}
            </button>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', fontSize: '1rem', lineHeight: 1,
                padding: '4px', flexShrink: 0, fontFamily: 'inherit',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── NAV ── */}
        <nav style={s.navWrap(scrolled)}>
          <div style={s.navInner}>
            <div style={s.brand}>
              <span style={s.brandEmoji}>🏔️</span>
              TrailReady
            </div>
            <div style={s.langToggle}>
              <button type="button" style={s.langBtn(lang === 'en')} onClick={() => setLang('en')}>EN</button>
              <button type="button" style={s.langBtn(lang === 'es')} onClick={() => setLang('es')}>ES</button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={s.hero}>
          <div style={s.topoOverlay} />
          <div style={s.heroInner}>
            <div style={s.eyebrow}>{t(lang, 'landing.heroEyebrow')}</div>
            <h1 style={s.h1}>{t(lang, 'landing.heroHeadline')}</h1>
            <p style={s.heroSub}>{t(lang, 'landing.heroSubheadline')}</p>
            <div style={s.heroCtaWrap}>
              <button type="button" className="tr-cta-btn" onClick={() => navigate('/app')}>
                {t(lang, 'landing.heroCta')}
              </button>
              <div style={s.heroTrust}>{t(lang, 'landing.heroTrust')}</div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF MARQUEE ── */}
        <div style={s.marqueeBar} aria-hidden="true">
          <div className="tr-marquee-track">
            <span style={s.marqueeText}>{MARQUEE_SEG}</span>
            <span style={s.marqueeText}>{MARQUEE_SEG}</span>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section style={s.sectionWrap}>
          <div style={s.sectionContent}>
            <span style={s.sectionLabel}>{t(lang, 'landing.howTitle')}</span>
            <div style={s.howGrid} className="tr-how-grid">
              {[
                { num: '1', icon: '🎯', tk: 'how1Title', bk: 'how1Body' },
                { num: '2', icon: '📅', tk: 'how2Title', bk: 'how2Body' },
                { num: '3', icon: '🗺️', tk: 'how3Title', bk: 'how3Body' },
              ].map(({ num, icon, tk, bk }) => (
                <div key={num} style={s.howCard}>
                  <div style={s.howNum}>{num}</div>
                  <span style={s.howIcon}>{icon}</span>
                  <div style={s.howTitle}>{t(lang, `landing.${tk}`)}</div>
                  <div style={s.howBody}>{t(lang, `landing.${bk}`)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KEY FEATURES ── */}
        <section style={{ ...s.sectionWrap, paddingTop: 0 }}>
          <div style={s.sectionContent}>
            <span style={s.sectionLabel}>{t(lang, 'landing.featuresTitle')}</span>
            <div style={s.featGrid} className="tr-feat-grid">
              {FEATURES.map(({ icon, tk, bk }) => (
                <div key={tk} className="tr-feature-card">
                  <div style={s.featIconBadge}>{icon}</div>
                  <div style={s.featTitle}>{t(lang, `landing.${tk}`)}</div>
                  <div style={s.featBody}>{t(lang, `landing.${bk}`)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY ── */}
        <section style={{ ...s.sectionWrap, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={s.sectionContent}>
            <div style={s.commTitle}>{t(lang, 'landing.communityTitle')}</div>
            <p style={s.commDesc}>{t(lang, 'landing.communityDesc')}</p>
            <div style={s.communityGrid} className="tr-comm-grid">
              {COMMUNITY_RACES.map(({ emoji, name, count }) => (
                <div key={name} className="tr-community-card">
                  <span style={s.commEmoji}>{emoji}</span>
                  <div style={s.commRaceName}>{name}</div>
                  <div style={s.commRaceCount}>
                    {count} {lang === 'es' ? 'corredores entrenando' : 'runners training'}
                  </div>
                  <button type="button" className="tr-outline-btn">
                    {t(lang, 'landing.communityJoin')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={s.finalWrap}>
          <h2 style={s.finalH2}>{t(lang, 'landing.finalHeadline')}</h2>
          <button type="button" className="tr-cta-btn" onClick={() => navigate('/app')}>
            {t(lang, 'landing.finalCta')}
          </button>
          <div style={s.finalNote}>{t(lang, 'landing.finalNote')}</div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={s.footer}>
          <div style={s.footerInner}>
            <div style={s.footerBrand}>
              <span style={s.footerBrandEmoji}>🏔️</span>
              TrailReady · 2026
            </div>
            <div style={s.footerLangRow}>
              <button type="button" style={s.footerLangBtn(lang === 'en')} onClick={() => setLang('en')}>EN</button>
              <span style={s.footerDivider}>|</span>
              <button type="button" style={s.footerLangBtn(lang === 'es')} onClick={() => setLang('es')}>ES</button>
            </div>
            <div style={s.footerTagline}>{t(lang, 'landing.footerTagline')}</div>
          </div>
        </footer>

      </div>
    </>
  );
}
