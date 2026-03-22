export const translations = {
    en: {
      appTagline: "Your race. Your routes. Your plan.",
      selectLanguage: "Select your language",
      continue: "Continue",
  
      // Source screen
      sourceTitle: "How do we add your race?",
      sourceWeb: "Official link",
      sourceWebSub: "UltraSignup, UTMB, iRunFar",
      sourcePdf: "Upload PDF",
      sourcePdfSub: "Race rules or tech sheet",
      sourceManual: "Enter manually",
      sourceManualSub: "Distance, elevation, date",
      analyzeRace: "Analyze race",
      analyzingPage: "Analyzing page...",
      readingPdf: "Reading PDF...",
  
      // Profile screen
      raceDetected: "RACE DETECTED",
      yourProfile: "YOUR PROFILE",
      currentLevel: "Current level",
      beginner: "🌱 Beginner",
      intermediate: "🔥 Intermediate",
      advanced: "⚡ Advanced",
      weeklyKm: "Current weekly km",
      alreadyTraining: "Already training?",
      startFromZero: "Starting from scratch",
      alreadyOnWeek: "Already on week",
      generatePlan: "Generate my plan →",
      weeksAvailable: "weeks available",
  
      // Today screen
      today: "TODAY",
      week: "WEEK",
      of: "OF",
      buildPhase: "Build phase",
      basePhase: "Base phase",
      peakPhase: "Peak phase",
      taperPhase: "Taper phase",
      todaysRoute: "TODAY'S ROUTE",
      openWikiloc: "Open in Wikiloc ↗",
      distance: "distance",
      elevation: "elevation",
      estimated: "estimated",
      afterRun: "AFTER YOUR RUN — TAP TO OPEN VIDEO",
      stretching: "Stretching",
      iceBath: "Ice bath",
      nutrition: "Nutrition",
      min: "min",
      guide: "guide",
  
      // Week screen
      thisWeek: "This week",
      toRaceDay: "to race day",
      raceDay: "RACE DAY",
      days: { Mon:"Mon", Tue:"Tue", Wed:"Wed", Thu:"Thu", Fri:"Fri", Sat:"Sat", Sun:"Sun" },
      workouts: {
        rest: "Rest", easy: "Easy run", intervals: "Intervals", strength: "Strength trail",
        tempo: "Tempo run", cross: "Bike / Swim", longTrail: "Long trail",
        recovery: "Recovery", strides: "Strides", backToBack: "Back-to-back",
        shortTrail: "Short trail",
      },
  
      // Recovery screen
      afterYourRun: "AFTER YOUR RUN",
      postStretching: "Post-trail stretching",
      iceBathProtocol: "Ice bath protocol",
      postNutrition: "Post-run nutrition",
      carbsGuide: "Carbs + protein guide",
      covers: "TARGETS",
      openYoutube: "↗ YouTube",
      openArticle: "↗ Article",
      trailRunners: "trail runners",
    },
  
    es: {
      appTagline: "Tu carrera. Tus rutas. Tu plan.",
      selectLanguage: "Elige tu idioma",
      continue: "Continuar",
  
      // Source screen
      sourceTitle: "¿Cómo agregamos tu carrera?",
      sourceWeb: "Link oficial",
      sourceWebSub: "UltraSignup, UTMB, iRunFar",
      sourcePdf: "Subir PDF",
      sourcePdfSub: "Reglamento o ficha técnica",
      sourceManual: "Ingresar manual",
      sourceManualSub: "Distancia, desnivel, fecha",
      analyzeRace: "Analizar carrera",
      analyzingPage: "Analizando página...",
      readingPdf: "Leyendo PDF...",
  
      // Profile screen
      raceDetected: "CARRERA DETECTADA",
      yourProfile: "TU PERFIL",
      currentLevel: "Nivel actual",
      beginner: "🌱 Principiante",
      intermediate: "🔥 Intermedio",
      advanced: "⚡ Avanzado",
      weeklyKm: "Km semanales actuales",
      alreadyTraining: "¿Ya estás entrenando?",
      startFromZero: "Arranco desde cero",
      alreadyOnWeek: "Ya voy en semana",
      generatePlan: "Generar mi plan →",
      weeksAvailable: "semanas disponibles",
  
      // Today screen
      today: "HOY",
      week: "SEMANA",
      of: "DE",
      buildPhase: "Fase construcción",
      basePhase: "Fase base",
      peakPhase: "Fase pico",
      taperPhase: "Fase taper",
      todaysRoute: "RUTA DE HOY",
      openWikiloc: "Abrir en Wikiloc ↗",
      distance: "distancia",
      elevation: "desnivel",
      estimated: "estimado",
      afterRun: "DESPUÉS DE CORRER — TOCA PARA VER VIDEO",
      stretching: "Estiramiento",
      iceBath: "Ice bath",
      nutrition: "Nutrición",
      min: "min",
      guide: "guía",
  
      // Week screen
      thisWeek: "Esta semana",
      toRaceDay: "para la carrera",
      raceDay: "DÍA DE CARRERA",
      days: { Mon:"Lun", Tue:"Mar", Wed:"Mié", Thu:"Jue", Fri:"Vie", Sat:"Sáb", Sun:"Dom" },
      workouts: {
        rest: "Descanso", easy: "Rodaje suave", intervals: "Intervalos", strength: "Fuerza trail",
        tempo: "Tempo", cross: "Bike / Nado", longTrail: "Trail largo",
        recovery: "Recuperación", strides: "Strides", backToBack: "Back-to-back",
        shortTrail: "Trail corto",
      },
  
      // Recovery screen
      afterYourRun: "DESPUÉS DE CORRER",
      postStretching: "Estiramiento post-trail",
      iceBathProtocol: "Protocolo ice bath",
      postNutrition: "Nutrición post-entreno",
      carbsGuide: "Guía carbos + proteína",
      covers: "TRABAJA",
      openYoutube: "↗ YouTube",
      openArticle: "↗ Artículo",
      trailRunners: "trail runners",
    }
  };
  
  export function t(lang, key) {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) val = val?.[k];
    return val || key;
  }