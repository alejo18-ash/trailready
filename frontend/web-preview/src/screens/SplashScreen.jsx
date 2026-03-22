import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 800);
    const t2 = setTimeout(() => setPhase('fade'), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      transition: 'opacity 0.6s ease',
      opacity: phase === 'fade' ? 0 : 1,
    }}>
      <div style={{
        width: 80,
        height: 80,
        background: '#0f6e56',
        borderRadius: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        marginBottom: 20,
        transform: phase === 'logo' ? 'scale(0.8)' : 'scale(1)',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        🏔️
      </div>

      <div style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: -0.5,
        opacity: phase === 'logo' ? 0 : 1,
        transform: phase === 'logo' ? 'translateY(8px)' : 'translateY(0)',
        transition: 'all 0.4s ease',
      }}>
        TrailReady
      </div>

      <div style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 8,
        opacity: phase === 'tagline' || phase === 'fade' ? 1 : 0,
        transition: 'opacity 0.5s ease 0.2s',
      }}>
        Your race. Your trails. Your plan.
      </div>

      <div style={{
        position: 'absolute',
        bottom: 48,
        display: 'flex',
        gap: 6,
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: i === 0 ? '#1d9e75' : 'rgba(255,255,255,0.2)',
          }} />
        ))}
      </div>
    </div>
  );
}
