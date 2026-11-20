# TrailReady

Plan de entrenamiento de trail y asfalto (21K–100K) que termina el día de tu carrera, con fuerza integrada, clima, rutas reales y un coach con IA que ajusta el plan.

- App: https://trailready.vercel.app
- API: https://trailready-5hbp.onrender.com
- Soporte / privacidad: alecastig88@gmail.com

## Arquitectura

| Capa | Tecnología | Dónde |
|---|---|---|
| App (PWA) | React + Vite | Vercel, se publica solo desde `main` |
| API | Node + Express | Render (plan gratis: se duerme sin uso, el primer request tarda ~30 s) |
| Cuentas | Firebase Auth (Google) | Proyecto `olympus-app-9de55` |
| Datos | Firestore `users/{uid}/plans/current` + `localStorage` (`trailready_plan`) | |
| IA | Claude API (coach + explicación de rutas) | Llamado solo desde la API |
| Rutas | OpenRouteService (HeiGIT) `api.heigit.org/openrouteservice` | |
| Clima | OpenWeatherMap; calidad del aire OpenAQ (hoy devuelve vacío) | |

El login usa el dominio propio (`trailready.vercel.app/__/auth/*` se reenvía a Firebase en `vercel.json`) para que funcione en Safari de iPhone.

## Estructura

```
backend/
  server.js     clima, GPX, endpoints base
  coach.js      POST /api/coach — verifica el token de Firebase, límite diario, Claude con herramienta propose_plan_change
  routes.js     GET /api/routes/enabled, POST /api/routes — 3 circuitos reales, elige según sesión y clima
frontend/web-preview/src/
  App.jsx                 flujo de pantallas, generación del plan, guardado
  screens/                Today, Week, Coach, Plans, Account, RaceProfile, Strength, Recovery, Source, Profile, Login, Legal…
  components/             BottomNav, Icon (set único de íconos), Logo, RouteCard
  utils/planWeeks.js      largo del plan y semana actual por fecha (fuente única)
  utils/applyProposal.js  aplica cambios del coach (nunca días pasados)
  services/planService.js guardar/cargar plan (local + Firestore)
  styles/design-system.css tokens, tipografía (Barlow Condensed + Inter), animaciones
```

## Variables de entorno (Render)

| Variable | Para qué | Obligatoria |
|---|---|---|
| `OPENWEATHER_KEY` | Clima | Sí |
| `OPENAQ_KEY` | Calidad del aire | No |
| `ANTHROPIC_API_KEY` | Coach y explicación de rutas | Para el coach |
| `ORS_API_KEY` | Rutas reales | Para rutas |
| `COACH_MODEL` | Modelo de Claude (por defecto `claude-sonnet-5-5`) | No |
| `COACH_DAILY_LIMIT` / `ROUTES_DAILY_LIMIT` | Límite diario por usuario (20 / 15) | No |
| `FIREBASE_PROJECT_ID` | Por defecto `olympus-app-9de55` | No |

Sin `ANTHROPIC_API_KEY` el coach responde "no configurado"; sin `ORS_API_KEY` la tarjeta de rutas no aparece.

Vencimientos a vigilar: llave de Anthropic `trailready-coach` vence el 11/11/2027.

## Desarrollo local

```bash
cd backend && npm install && node server.js          # API en :3001 (lee .env)
cd frontend/web-preview && npm install && npm run dev  # app en :5173
```

## Cómo se publica (Protocolo Double Check)

1. Analizar antes de tocar código.
2. Ver el diff y que solo toque los archivos esperados.
3. `node --check` en backend y `npm run build` en frontend antes de subir.
4. Subir con un commit por cambio y confirmar con `git log origin/main --oneline -1`.
5. Vercel y Render se actualizan solos desde `main`.
