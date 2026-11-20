import { SUPPORT_EMAIL, LEGAL_UPDATED } from '../utils/legal';

const DOCS = {
  privacy: {
    es: {
      title: 'Política de privacidad',
      sections: [
        ['Qué datos guardamos', 'Si usas TrailReady sin cuenta, tu plan se guarda solo en este dispositivo. Si inicias sesión con Google, guardamos tu nombre, correo, foto de perfil y un identificador de usuario, junto con tu plan: datos de tu carrera (nombre, distancia, desnivel, fecha), tu perfil de corredor (nivel, kilómetros semanales, días disponibles) y los entrenamientos que marcas como completados.'],
        ['Ubicación', 'Solo si la permites, usamos tu ubicación aproximada en el momento para mostrarte clima, calidad del aire y rutas cercanas. No guardamos tu historial de ubicaciones. Puedes revocar el permiso en los ajustes de tu navegador o teléfono.'],
        ['Para qué los usamos', 'Únicamente para generar tu plan, sincronizarlo entre tus dispositivos y mostrarte información del día. No vendemos tus datos ni los usamos para publicidad.'],
        ['Con quién se comparten', 'Usamos proveedores que procesan datos por nosotros: Google Firebase (inicio de sesión y base de datos), Vercel y Render (alojamiento), Anthropic (el coach con IA: cuando le escribes, se envían tus mensajes y tu plan para generar la respuesta; no incluye tu nombre ni tu correo), y servicios de datos públicos de clima, calidad del aire y mapas (OpenWeatherMap, OpenAQ, OpenStreetMap, Open-Meteo), a los que solo se envían coordenadas, nunca tu nombre ni correo.'],
        ['Cuánto tiempo', 'Tu plan se conserva hasta 14 días después de la fecha de tu carrera, o hasta que lo borres. Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde Perfil → Eliminar cuenta.'],
        ['Tus derechos', 'Puedes pedir acceso, corrección o eliminación de tus datos escribiendo a ' + SUPPORT_EMAIL + '. Si vives en California o la Unión Europea, también tienes los derechos que te dan la CCPA y el RGPD.'],
        ['Menores', 'TrailReady no está dirigida a menores de 13 años y no recopilamos sus datos a sabiendas.'],
      ],
    },
    en: {
      title: 'Privacy policy',
      sections: [
        ['What we store', 'If you use TrailReady without an account, your plan is stored only on this device. If you sign in with Google, we store your name, email, profile photo and a user ID, along with your plan: race details (name, distance, elevation, date), your runner profile (level, weekly km, available days) and the workouts you mark as completed.'],
        ['Location', 'Only if you allow it, we use your approximate current location to show weather, air quality and nearby routes. We do not store your location history. You can revoke the permission in your browser or phone settings.'],
        ['How we use it', 'Only to generate your plan, sync it across your devices and show you daily information. We do not sell your data or use it for advertising.'],
        ['Who we share it with', 'We use providers that process data on our behalf: Google Firebase (sign-in and database), Vercel and Render (hosting), Anthropic (the AI coach: when you message it, your messages and plan are sent to generate the reply; this does not include your name or email), and public weather, air quality and map services (OpenWeatherMap, OpenAQ, OpenStreetMap, Open-Meteo), which only receive coordinates, never your name or email.'],
        ['How long', 'Your plan is kept until 14 days after your race date, or until you delete it. You can delete your account and all your data at any time from Profile → Delete account.'],
        ['Your rights', 'You can request access, correction or deletion of your data by writing to ' + SUPPORT_EMAIL + '. If you live in California or the European Union, you also have your rights under the CCPA and GDPR.'],
        ['Children', 'TrailReady is not directed at children under 13 and we do not knowingly collect their data.'],
      ],
    },
  },
  terms: {
    es: {
      title: 'Términos de uso',
      sections: [
        ['El servicio', 'TrailReady genera planes de entrenamiento de carrera de forma automática a partir de los datos que ingresas. Es gratuito y puede cambiar o dejar de estar disponible.'],
        ['Aviso de salud', 'TrailReady no es un servicio médico ni reemplaza a un médico, fisioterapeuta o entrenador certificado. Consulta a un profesional de la salud antes de empezar un plan, sobre todo si tienes una lesión, una condición médica o llevas tiempo sin entrenar. Detén el ejercicio si sientes dolor, mareo o falta de aire.'],
        ['Tu responsabilidad', 'Entrenas bajo tu propio riesgo. Las rutas, el clima y la calidad del aire son referencias de fuentes públicas y pueden ser inexactas: verifica siempre las condiciones, el terreno y los permisos de acceso antes de salir.'],
        ['Coach con IA', 'Las respuestas y los cambios de plan del coach los genera una inteligencia artificial y pueden contener errores. Ningún cambio se aplica sin tu aprobación. Usa tu criterio y, ante dolor o lesión, consulta a un profesional.'],
        ['Tu cuenta', 'Eres responsable de tu cuenta de Google y de la información que ingresas. Puedes eliminar tu cuenta cuando quieras.'],
        ['Limitación de responsabilidad', 'En la medida que lo permita la ley, TrailReady se ofrece "tal cual" y no nos hacemos responsables por lesiones, daños o pérdidas derivadas de su uso.'],
        ['Contacto', 'Preguntas sobre estos términos: ' + SUPPORT_EMAIL + '.'],
      ],
    },
    en: {
      title: 'Terms of use',
      sections: [
        ['The service', 'TrailReady automatically generates running training plans from the data you enter. It is free and may change or become unavailable.'],
        ['Health notice', 'TrailReady is not a medical service and does not replace a doctor, physical therapist or certified coach. Consult a health professional before starting a plan, especially if you have an injury, a medical condition or have not trained in a while. Stop exercising if you feel pain, dizziness or shortness of breath.'],
        ['Your responsibility', 'You train at your own risk. Routes, weather and air quality are references from public sources and may be inaccurate: always check conditions, terrain and access permissions before heading out.'],
        ['AI coach', 'The coach\'s replies and plan changes are generated by artificial intelligence and may contain mistakes. No change is applied without your approval. Use your judgment and, for pain or injury, see a professional.'],
        ['Your account', 'You are responsible for your Google account and the information you enter. You can delete your account at any time.'],
        ['Limitation of liability', 'To the extent permitted by law, TrailReady is provided "as is" and we are not liable for injuries, damages or losses arising from its use.'],
        ['Contact', 'Questions about these terms: ' + SUPPORT_EMAIL + '.'],
      ],
    },
  },
};

export default function LegalScreen({ lang, doc, onBack }) {
  const d = (DOCS[doc] || DOCS.privacy)[lang === 'es' ? 'es' : 'en'];
  return (
    <div style={{ minHeight:'100vh', background:'#F0F4F8', fontFamily:"'Inter', system-ui, sans-serif", maxWidth:600, margin:'0 auto', padding:'20px 20px 48px', boxSizing:'border-box' }}>
      <button type="button" onClick={onBack} style={{ background:'none', border:'none', color:'rgba(18,29,41,0.62)', fontSize:13, cursor:'pointer', padding:0, fontFamily:'inherit' }}>
        ← {lang === 'es' ? 'Volver' : 'Back'}
      </button>
      <h1 style={{ fontSize:32, fontWeight:700, fontFamily:'var(--font-display)', lineHeight:1.05, color:'#121D29', margin:'16px 0 4px', letterSpacing:'-0.02em' }}>{d.title}</h1>
      <div style={{ fontSize:12, color:'rgba(18,29,41,0.62)', marginBottom:20 }}>
        {lang === 'es' ? 'Última actualización' : 'Last updated'}: {LEGAL_UPDATED}
      </div>
      {d.sections.map(([h, body]) => (
        <section key={h} style={{ marginBottom:18 }}>
          <h2 style={{ fontSize:15, fontWeight:700, color:'#121D29', margin:'0 0 6px' }}>{h}</h2>
          <p style={{ fontSize:14, color:'rgba(18,29,41,0.7)', lineHeight:1.6, margin:0 }}>{body}</p>
        </section>
      ))}
    </div>
  );
}
