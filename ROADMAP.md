# TrailReady — Estado y roadmap

Actualizado: 20 nov 2026 (tarde)

## Qué es

App de entrenamiento para trail y asfalto. Plan gratis que termina el día de tu carrera; plan pago con coach con IA que ajusta el plan y rutas reales elegidas según la sesión y el clima. Precio objetivo: USD 5–10/mes (frente a Runna, ~USD 20).

## Lo que ya funciona (en producción)

| Área | Estado |
|---|---|
| Plan | Termina en la semana de la carrera, fases escaladas al tiempo real, la semana avanza sola por calendario |
| Cuenta | Login con Google (también en iPhone), plan y entrenamientos completados sincronizados entre dispositivos |
| Perfil | Cuenta, idioma, términos y aviso de salud, privacidad, cerrar sesión, eliminar cuenta y datos |
| Coach con IA | Ve plan, semana, carrera y check-ins; propone cambios que el usuario aprueba; reglas de seguridad; 20 mensajes/día |
| Rutas reales | 3 circuitos de OpenRouteService, elige según sesión y clima, Maps + GPX; 15 consultas/día |
| Diseño | Logo propio, íconos únicos, tipografía deportiva, contraste AA, pantalla Hoy con momento "¡Hecho!" |
| Mi equipo | Contador de km por zapatilla (suma cada entrenamiento hecho), aviso en Hoy al 85%, link de reemplazo, retirar/cambiar par |
| Página pública | `trailready.vercel.app/u/<id>` tipo Linktree para runners: nombre, foto, próxima carrera y equipo con links; opt-in, se apaga cuando quieras |
| Honestidad | Sin datos falsos (rutas, comunidades y números inventados eliminados) |

## Siguiente (en orden)

1. **Usarla de verdad 1–2 semanas** (tú + 5–10 corredores). Medir: ¿abren Hoy?, ¿marcan entrenamientos?, ¿usan el coach y las rutas?
2. **Millas y °F** — básico para corredores en EE. UU.
3. **Editar el plan sin empezar de cero** (fecha, días disponibles, nivel).
4. **Aviso de salud en el onboarding**, antes de generar el plan.
5. **Comunidades por carrera** — canal en la app que se abre cuando hay varios corredores en la misma carrera; reportar/bloquear y moderación obligatorios.
6. **Cobros con Stripe** — gratis: plan, clima, comunidades. Pago: coach + rutas.

## Ingresos por afiliados (nuevo)

1. **Amazon Associates** — aprobación fácil; poner el tag en `utils/legal.js` (`AMAZON_TAG`) y todos los "Reponer/Ver" pasan a pagar comisión (1–10%).
2. **Programas directos de marcas de trail** (chalecos, nutrición, bastones) y códigos exclusivos cuando haya usuarios.
3. **AvantLink** (red outdoor) — API con descuentos oficiales vigentes; requiere postular con tráfico. **No scraping**: el caso Honey (demanda colectiva sigue desde jun 2026) muestra el riesgo.
4. Reglas: aviso de afiliados visible (FTC) y el coach nunca recomienda por comisión.

## Después

- Integración con **Garmin** (aplicar ya al programa de desarrolladores; la aprobación tarda). Strava no sirve: prohíbe usar sus datos con IA.
- Más distancias (5K, 10K, media en asfalto) y formatos por tiempo/vueltas (backyard), con simulador.
- Puntaje de carreras ("¿me conviene esta?") con búsqueda web, separando datos confirmados de estimados.
- Recordatorios / notificaciones y app instalable guiada.

## Antes de cobrar (obligatorio)

- Render plan pago (el gratis se duerme ~30 s).
- Límites del coach y rutas guardados en base de datos (hoy viven en memoria y se reinician con el servidor).
- LLC, revisión legal de términos y privacidad, política de reembolsos.
- Pantalla de login de Google con nombre TrailReady, logo y links de privacidad/términos.

## Riesgos y pendientes conocidos

- Calidad del aire (OpenAQ) devuelve vacío.
- La afirmación "reduce el riesgo de lesión un 50%" en la sesión de fuerza necesita fuente o suavizarse.
- La landing promete "se adapta a ti" y "conoce tus trails locales": el coach y las rutas ya lo cumplen solo para usuarios con cuenta.
- Llave de Anthropic vence el 11/11/2027.
