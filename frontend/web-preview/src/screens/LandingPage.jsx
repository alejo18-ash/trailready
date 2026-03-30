import { t } from '../i18n';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#1d9e75';

const s = {
  page: {
    minHeight: '100vh',
    background: '#0d1117',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    scrollBehavior: 'smooth',
  },
  hero: {
    padding: '18px 18px 28px',
    background: `
      radial-gradient(900px 500px at 50% 0%, rgba(29,158,117,0.28), rgba(13,17,23,0) 55%),
      radial-gradient(900px 600px at 50% 30%, rgba(74,222,128,0.08), rgba(13,17,23,0) 60%),
      linear-gradient(180deg, rgba(13,17,23,1), rgba(13,17,23,1))
    `,
    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    maxWidth: 980,
    margin: '0 auto',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, letterSpacing: -0.2 },
  brandText: { fontSize: 14, color: '#fff' },
  langToggle: {
    display: 'flex',
    gap: 6,
    border: '0.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 999,
    padding: 4,
  },
  langBtn: (active) => ({
    padding: '6px 10px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    background: active ? 'rgba(29,158,117,0.25)' : 'transparent',
    color: active ? '#4ade80' : 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
  }),
  heroInner: {
    maxWidth: 980,
    margin: '18px auto 0',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 18,
  },
  h1: { fontSize: 34, lineHeight: 1.05, letterSpacing: -1.0, fontWeight: 900, margin: '10px 0 0' },
  sub: { fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', marginTop: 12, maxWidth: 640 },
  cta: {
    marginTop: 16,
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    background: ACCENT,
    color: '#fff',
    fontSize: 15,
    fontWeight: 800,
    padding: '14px 14px',
    borderRadius: 14,
    boxShadow: '0 0 26px rgba(29,158,117,0.28), 0 10px 30px rgba(0,0,0,0.35)',
  },
  ctaNote: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 10 },
  section: { padding: '22px 18px', maxWidth: 980, margin: '0 auto' },
  sectionTitle: { fontSize: 12, letterSpacing: 1.0, color: 'rgba(255,255,255,0.45)', fontWeight: 800, marginBottom: 10 },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 10,
  },
  gridFeatures: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4 },
  cardBody: { fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)' },
  proof: {
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 1.6,
    fontSize: 13,
  },
  footer: {
    padding: '18px 18px 28px',
    borderTop: '0.5px solid rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.45)',
  },
  footerInner: { maxWidth: 980, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  footerLinks: { display: 'flex', gap: 10 },
  link: { cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 12, textDecoration: 'none' },
};

export default function LandingPage({ lang, setLang }) {
  const navigate = useNavigate();
  const goApp = () => navigate('/app');

  return (
    <div style={s.page}>
      <div style={s.hero} id="top">
        <div style={s.nav}>
          <div style={s.brand}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(29,158,117,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏔️</div>
            <div style={s.brandText}>TrailReady</div>
          </div>

          <div style={s.langToggle} aria-label="language">
            <button type="button" style={s.langBtn(lang === 'en')} onClick={() => setLang('en')}>EN</button>
            <button type="button" style={s.langBtn(lang === 'es')} onClick={() => setLang('es')}>ES</button>
          </div>
        </div>

        <div style={s.heroInner}>
          <div>
            <div style={s.h1}>{t(lang, 'landing.heroHeadline')}</div>
            <div style={s.sub}>{t(lang, 'landing.heroSubheadline')}</div>

            <button type="button" style={s.cta} onClick={goApp}>
              {t(lang, 'landing.heroCta')}
            </button>
            <div style={s.ctaNote}>{t(lang, 'landing.heroCtaNote')}</div>
          </div>
        </div>
      </div>

      <div style={s.section} id="how">
        <div style={s.sectionTitle}>{t(lang, 'landing.howTitle')}</div>
        <div style={s.grid3}>
          <div style={s.card}>
            <div style={s.cardTitle}>🎯 {t(lang, 'landing.how1Title')}</div>
            <div style={s.cardBody}>{t(lang, 'landing.how1Body')}</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>📅 {t(lang, 'landing.how2Title')}</div>
            <div style={s.cardBody}>{t(lang, 'landing.how2Body')}</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>🗺️ {t(lang, 'landing.how3Title')}</div>
            <div style={s.cardBody}>{t(lang, 'landing.how3Body')}</div>
          </div>
        </div>
      </div>

      <div style={s.section} id="features">
        <div style={s.sectionTitle}>{t(lang, 'landing.featuresTitle')}</div>
        <div style={s.gridFeatures}>
          <div style={s.card}>
            <div style={s.cardTitle}>🌍 {t(lang, 'landing.f1Title')}</div>
            <div style={s.cardBody}>{t(lang, 'landing.f1Body')}</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>🌦️ {t(lang, 'landing.f2Title')}</div>
            <div style={s.cardBody}>{t(lang, 'landing.f2Body')}</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>🏔️ {t(lang, 'landing.f3Title')}</div>
            <div style={s.cardBody}>{t(lang, 'landing.f3Body')}</div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>🇪🇸 {t(lang, 'landing.f4Title')}</div>
            <div style={s.cardBody}>{t(lang, 'landing.f4Body')}</div>
          </div>
        </div>
      </div>

      <div style={s.section} id="proof">
        <div style={s.sectionTitle}>{t(lang, 'landing.proofTitle')}</div>
        <div style={s.proof}>{t(lang, 'landing.proofBody')}</div>
      </div>

      <div style={s.section} id="cta">
        <div style={s.sectionTitle}>{t(lang, 'landing.finalTitle')}</div>
        <button type="button" style={s.cta} onClick={goApp}>
          {t(lang, 'landing.finalCta')}
        </button>
      </div>

      <div style={s.footer}>
        <div style={s.footerInner}>
          <div>🏔️ TrailReady · 2026</div>
          <div style={s.footerLinks}>
            <a href="#top" style={s.link}>{t(lang, 'landing.footerTop')}</a>
            <span style={s.link} onClick={() => setLang('en')}>EN</span>
            <span style={s.link} onClick={() => setLang('es')}>ES</span>
          </div>
        </div>
      </div>
    </div>
  );
}

