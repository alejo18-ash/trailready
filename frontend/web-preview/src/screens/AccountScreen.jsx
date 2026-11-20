import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { SUPPORT_EMAIL, APP_VERSION } from '../utils/legal';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

const C = { text:'#121D29', muted:'rgba(18,29,41,0.64)', faint:'rgba(18,29,41,0.08)', red:'#EA2A30' };

const s = {
  wrap: { minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", maxWidth:600, margin:'0 auto', width:'100%', boxSizing:'border-box', padding:'20px 16px 96px' },
  h1: { fontSize:36, fontWeight:700, fontFamily:'var(--font-display)', lineHeight:1, color:C.text, margin:'4px 0 16px', letterSpacing:'-0.02em' },
  card: { background:'#FFFFFF', borderRadius:16, border:`1px solid ${C.faint}`, boxShadow:'0 1px 4px rgba(18,29,41,0.05)', marginBottom:16, overflow:'hidden' },
  label: { fontSize:12, letterSpacing:'0.08em', color:C.muted, textTransform:'uppercase', margin:'0 4px 8px' },
  row: (last) => ({ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, width:'100%', padding:'15px 16px', background:'none', border:'none', borderBottom: last ? 'none' : `1px solid ${C.faint}`, fontSize:15, color:C.text, fontFamily:'inherit', textAlign:'left', cursor:'pointer', boxSizing:'border-box' }),
  chev: { color:'rgba(18,29,41,0.64)', fontSize:18 },
  avatar: { width:52, height:52, borderRadius:'50%', background:C.red, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, flexShrink:0, objectFit:'cover' },
  seg: { display:'flex', gap:4, background:'#F0F4F8', borderRadius:999, padding:3 },
  segBtn: (on) => ({ border:'none', borderRadius:999, padding:'6px 14px', fontSize:13, fontWeight: on ? 700 : 500, background: on ? '#FFFFFF' : 'transparent', color: on ? C.red : C.muted, cursor:'pointer', fontFamily:'inherit', boxShadow: on ? '0 1px 3px rgba(18,29,41,0.1)' : 'none' }),
};

function Row({ children, right, onClick, last, danger }) {
  return (
    <button type="button" onClick={onClick} style={{ ...s.row(last), color: danger ? C.red : C.text }}>
      <span>{children}</span>
      {right ?? <span style={s.chev}>›</span>}
    </button>
  );
}

export default function AccountScreen({ lang, user, plan, raceData, currentWeek, onLogin, onLogout, onDeleteAccount, onNewPlan, onRaceProfile, onLegal, onSetLang, onToday, onWeek, onPlans }) {
  const es = lang === 'es';
  const [confirm, setConfirm] = useState(null); // 'delete' | 'newPlan'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const name = user?.displayName || user?.email?.split('@')[0] || '';
  const total = plan?.weeks?.length || 0;
  const hasEmail = SUPPORT_EMAIL && !SUPPORT_EMAIL.includes('TU_EMAIL');

  const runDelete = async () => {
    setBusy(true); setError('');
    const res = await onDeleteAccount();
    setBusy(false);
    if (res?.error) setError(res.error);
    else setConfirm(null);
  };

  return (
    <div style={s.wrap}>
      <h1 style={s.h1}>{es ? 'Perfil' : 'Profile'}</h1>

      {/* Account */}
      <div style={{ ...s.card, padding:16, display:'flex', alignItems:'center', gap:14 }}>
        {user?.photoURL
          ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={s.avatar} />
          : <div style={s.avatar}>{user ? (name[0] || '?').toUpperCase() : <Logo size={52} rounded />}</div>}
        <div style={{ flex:1, minWidth:0 }}>
          {user ? (
            <>
              <div style={{ fontSize:17, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
              <div style={{ fontSize:13, color:C.muted, overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
              <div style={{ fontSize:12, color:'#16a34a', marginTop:4 }}>✓ {es ? 'Plan guardado en tu cuenta' : 'Plan saved to your account'}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{es ? 'Sin cuenta' : 'No account'}</div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.4 }}>{es ? 'Tu plan solo está en este dispositivo.' : 'Your plan is only on this device.'}</div>
            </>
          )}
        </div>
      </div>
      {!user && (
        <button type="button" onClick={onLogin} style={{ width:'100%', marginBottom:16, padding:14, borderRadius:14, border:'none', background:C.red, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          {es ? 'Guardar mi plan con Google' : 'Save my plan with Google'}
        </button>
      )}

      {/* Plan */}
      {plan && (
        <>
          <div style={s.label}>{es ? 'Mi plan' : 'My plan'}</div>
          <div style={s.card}>
            {raceData?.name && (
              <Row onClick={onRaceProfile}>
                <span style={{ display:'flex', alignItems:'center', gap:8, fontWeight:600 }}><Icon name="flag" size={16} color="#EA2A30" />{raceData.name}</span>
                <span style={{ display:'block', fontSize:12, color:C.muted, marginTop:2 }}>
                  {[raceData.distancia && `${raceData.distancia} km`, raceData.fecha, total && `${es ? 'Semana' : 'Week'} ${(currentWeek ?? 0) + 1}/${total}`].filter(Boolean).join(' · ')}
                </span>
              </Row>
            )}
            <Row last onClick={() => setConfirm('newPlan')}>{es ? 'Empezar un plan nuevo' : 'Start a new plan'}</Row>
          </div>
        </>
      )}

      {/* Preferences */}
      <div style={s.label}>{es ? 'Preferencias' : 'Preferences'}</div>
      <div style={s.card}>
        <div style={{ ...s.row(true), cursor:'default' }}>
          <span>{es ? 'Idioma' : 'Language'}</span>
          <div style={s.seg}>
            <button type="button" style={s.segBtn(lang === 'es')} onClick={() => onSetLang('es')}>ES</button>
            <button type="button" style={s.segBtn(lang === 'en')} onClick={() => onSetLang('en')}>EN</button>
          </div>
        </div>
      </div>

      {/* Support & legal */}
      <div style={s.label}>{es ? 'Ayuda y legal' : 'Help & legal'}</div>
      <div style={s.card}>
        {hasEmail && (
          <Row onClick={() => { window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('TrailReady feedback')}`; }}>
            {es ? 'Enviar comentarios o reportar un problema' : 'Send feedback or report a problem'}
          </Row>
        )}
        <Row onClick={() => onLegal('terms')}>{es ? 'Términos de uso y aviso de salud' : 'Terms of use & health notice'}</Row>
        <Row last onClick={() => onLegal('privacy')}>{es ? 'Política de privacidad' : 'Privacy policy'}</Row>
      </div>

      {/* Account actions */}
      {user && (
        <>
          <div style={s.label}>{es ? 'Cuenta' : 'Account'}</div>
          <div style={s.card}>
            <Row onClick={onLogout} right={<span />}>{es ? 'Cerrar sesión' : 'Sign out'}</Row>
            <Row last danger onClick={() => setConfirm('delete')} right={<span />}>{es ? 'Eliminar cuenta y datos' : 'Delete account and data'}</Row>
          </div>
        </>
      )}

      <div style={{ textAlign:'center', fontSize:12, color:'rgba(18,29,41,0.64)', marginTop:8 }}>TrailReady v{APP_VERSION}</div>

      {confirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(18,29,41,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:'0 24px' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'24px 20px', maxWidth:340, width:'100%' }}>
            <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>
              {confirm === 'delete' ? (es ? '¿Eliminar tu cuenta?' : 'Delete your account?') : (es ? '¿Empezar un plan nuevo?' : 'Start a new plan?')}
            </div>
            <div style={{ fontSize:14, color:C.muted, lineHeight:1.5, marginBottom:20 }}>
              {confirm === 'delete'
                ? (es ? 'Se borran tu cuenta, tu plan y tu progreso, en todos tus dispositivos. No se puede deshacer.' : 'Your account, plan and progress are deleted on all your devices. This cannot be undone.')
                : (es ? 'Perderás tu plan y progreso actual. No se puede deshacer.' : 'You will lose your current plan and progress. This cannot be undone.')}
            </div>
            {error && <div style={{ fontSize:13, color:C.red, marginBottom:12, lineHeight:1.4 }}>{error}</div>}
            <button type="button" disabled={busy}
              onClick={confirm === 'delete' ? runDelete : () => { setConfirm(null); onNewPlan(); }}
              style={{ width:'100%', padding:13, borderRadius:100, border:'none', background:C.red, color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:10, opacity: busy ? 0.6 : 1 }}>
              {busy ? '…' : confirm === 'delete' ? (es ? 'Sí, eliminar todo' : 'Yes, delete everything') : (es ? 'Sí, empezar de cero' : 'Yes, start over')}
            </button>
            <button type="button" onClick={() => { setConfirm(null); setError(''); }}
              style={{ width:'100%', padding:13, borderRadius:100, border:`1px solid ${C.faint}`, background:'#fff', color:C.text, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
              {es ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      <BottomNav active="profile" lang={lang} onToday={onToday} onPlan={onWeek} onPlans={onPlans} />
    </div>
  );
}
