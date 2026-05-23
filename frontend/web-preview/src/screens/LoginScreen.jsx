export default function LoginScreen({ lang, onLogin, onSkip }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F4F8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 32px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: 56,
        height: 56,
        background: '#EA2A30',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        marginBottom: 24,
      }}>
        🏔️
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#121D29', margin: 0, letterSpacing: '-0.02em', textAlign: 'center' }}>
        {lang === 'es' ? 'Guarda tu plan' : 'Save your plan'}
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(18,29,41,0.5)', marginTop: 8, marginBottom: 32, textAlign: 'center', lineHeight: 1.5 }}>
        {lang === 'es'
          ? 'Inicia sesión para sincronizar tu plan entre dispositivos.'
          : 'Sign in to sync your plan across devices.'}
      </p>

      <button
        onClick={onLogin}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '14px 20px',
          background: '#FFFFFF',
          border: '1px solid rgba(18,29,41,0.12)',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 600,
          color: '#121D29',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily: "'Inter', system-ui, sans-serif",
          boxShadow: '0 1px 4px rgba(18,29,41,0.06)',
          marginBottom: 12,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {lang === 'es' ? 'Continuar con Google' : 'Continue with Google'}
      </button>

      <button
        onClick={onSkip}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 13,
          color: 'rgba(18,29,41,0.4)',
          cursor: 'pointer',
          padding: '8px 0',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {lang === 'es' ? 'Continuar sin cuenta →' : 'Continue without account →'}
      </button>
    </div>
  );
}
