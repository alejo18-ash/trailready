import { useState, useRef } from 'react';

const slides = [
  {
    bg: '#4A7FA5',
    cloudColor: 'white',
    sunColor: '#F4A038',
    hillColor: '#2A5C3F',
    eyebrow: { es: 'Trails reales', en: 'Real trails' },
    title: { es: 'Rutas locales,\ncada semana', en: 'Local routes,\nevery week' },
    sub: {
      es: 'Trails reales cerca de ti, ajustados a tu workout del día.',
      en: 'Real trails near you, matched to your daily workout.'
    }
  },
  {
    bg: '#3D6B8C',
    cloudColor: 'white',
    sunColor: '#FAC04A',
    hillColor: '#1E4A2E',
    eyebrow: { es: 'Fuerza integrada', en: 'Strength built-in' },
    title: { es: 'Ares entrena\ntus músculos', en: 'Ares trains\nyour muscles' },
    sub: {
      es: 'Sesiones de gym por fase. No un complemento — el núcleo.',
      en: 'Phase-specific gym sessions. Not an add-on — the core.'
    }
  },
  {
    bg: '#5A3E8C',
    cloudColor: 'white',
    sunColor: '#FFD700',
    hillColor: '#2A1A4A',
    eyebrow: { es: 'Tu coach del Olimpo', en: 'Your Olympus coach' },
    title: { es: 'Entrena como\nun dios', en: 'Train like\na god' },
    sub: {
      es: 'Plan adaptado a tu carrera, tu nivel, y tus trails.',
      en: 'Plan adapted to your race, your level, and your trails.'
    }
  }
];

export default function OnboardingSplash({ lang, onComplete }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50 && current > 0) setCurrent(current - 1);
    touchStartX.current = null;
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100vh',
        background: slide.bg,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.4s ease',
        userSelect: 'none'
      }}
    >
      {/* SVG Illustration — mountain scene */}
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          viewBox="0 0 390 500"
          width="100%"
          style={{ position: 'absolute', bottom: 0, left: 0 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky clouds */}
          <ellipse cx="80" cy="60" rx="80" ry="45" fill="white" opacity="0.75"/>
          <ellipse cx="200" cy="40" rx="60" ry="35" fill="white" opacity="0.65"/>
          <ellipse cx="320" cy="70" rx="70" ry="40" fill="white" opacity="0.7"/>
          {/* Sun */}
          <circle cx="320" cy="100" r="50" fill={slide.sunColor} opacity="0.9"/>
          {/* Mountains */}
          <polygon points="0,500 100,280 200,340 350,200 390,500"
            fill={slide.hillColor}/>
          <polygon points="0,500 80,320 160,370 280,240 390,500"
            fill={slide.hillColor} opacity="0.7"/>
          {/* Runner figure */}
          <g transform="translate(150, 260)">
            {/* Head */}
            <circle cx="20" cy="0" r="16" fill="#2C5282"/>
            {/* Beanie */}
            <ellipse cx="20" cy="-12" rx="16" ry="8" fill="#2C5282"/>
            <ellipse cx="20" cy="-18" rx="10" ry="5" fill="#2C5282"/>
            {/* Body */}
            <rect x="10" y="15" width="20" height="32" rx="5" fill="#2C5282"/>
            {/* Backpack */}
            <rect x="6" y="10" width="22" height="30" rx="5" fill="#E8943A"/>
            <line x1="20" y1="10" x2="20" y2="40" stroke="#C4722A" strokeWidth="1.5"/>
            <line x1="6" y1="24" x2="28" y2="24" stroke="#C4722A" strokeWidth="1.5"/>
            <rect x="9" y="6" width="16" height="7" rx="3" fill="#E8943A"/>
            {/* Arms */}
            <line x1="10" y1="25" x2="-5" y2="45" stroke="#2C5282"
              strokeWidth="6" strokeLinecap="round"/>
            <line x1="30" y1="25" x2="45" y2="42" stroke="#2C5282"
              strokeWidth="6" strokeLinecap="round"/>
            {/* Legs */}
            <line x1="15" y1="47" x2="5" y2="75" stroke="#2C5282"
              strokeWidth="7" strokeLinecap="round"/>
            <line x1="25" y1="47" x2="35" y2="75" stroke="#2C5282"
              strokeWidth="7" strokeLinecap="round"/>
            {/* Shoes */}
            <rect x="-2" y="72" width="14" height="10" rx="3" fill="#E8943A"/>
            <rect x="28" y="72" width="14" height="10" rx="3" fill="#E8943A"/>
            {/* Trekking pole */}
            <line x1="-5" y1="45" x2="-15" y2="80" stroke="#8B6914"
              strokeWidth="3" strokeLinecap="round"/>
            <circle cx="-15" cy="81" r="3" fill="#8B6914"/>
          </g>
          {/* Foreground plants */}
          <ellipse cx="50" cy="490" rx="40" ry="15" fill={slide.hillColor} opacity="0.8"/>
          <ellipse cx="340" cy="485" rx="35" ry="12" fill={slide.hillColor} opacity="0.6"/>
        </svg>
      </div>

      {/* Bottom content */}
      <div style={{
        padding: '24px 28px 48px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 100%)',
        position: 'relative', zIndex: 2
      }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              height: 6,
              width: i === current ? 24 : 6,
              borderRadius: 100,
              background: i === current ? '#EA2A30' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease'
            }}/>
          ))}
        </div>

        {/* Eyebrow */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(234,42,48,0.2)',
          color: '#FF8A8A',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: 100,
          marginBottom: 12
        }}>
          {slide.eyebrow[lang || 'es']}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color: 'white',
          lineHeight: 1.2,
          marginBottom: 10,
          whiteSpace: 'pre-line'
        }}>
          {slide.title[lang || 'es']}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.6,
          marginBottom: 28
        }}>
          {slide.sub[lang || 'es']}
        </div>

        {/* Button */}
        <button onClick={next} style={{
          width: '100%',
          padding: '16px',
          background: isLast ? '#EA2A30' : 'rgba(255,255,255,0.15)',
          color: 'white',
          border: isLast ? 'none' : '1px solid rgba(255,255,255,0.3)',
          borderRadius: 100,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {isLast
            ? (lang === 'es' ? 'Comenzar mi odisea →' : 'Start my odyssey →')
            : (lang === 'es' ? 'Siguiente →' : 'Next →')
          }
        </button>

        {/* Skip */}
        {!isLast && (
          <button onClick={onComplete} style={{
            display: 'block',
            width: '100%',
            marginTop: 12,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
            cursor: 'pointer',
            padding: '8px 0',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {lang === 'es' ? 'Saltar' : 'Skip'}
          </button>
        )}
      </div>
    </div>
  );
}
