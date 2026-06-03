---
timestamp: 2026-06-03T07-38-46Z
slug: app-consultoria
---
## Design Health Score

| # | Heurística | Score | Hallazgo clave |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | SpotsWidget navbar correcto; aria-live banner reactivo funciona |
| 2 | Match Between System / Real World | 4 | Lenguaje socio legal preservado; copy específico Colombia |
| 3 | User Control and Freedom | 3 | FAQ permite cerrar; sin breadcrumb global |
| 4 | Consistency and Standards | 4 | Tokens respetados; motion variants reutilizados; borders explícitos en OfferLadder |
| 5 | Error Prevention | 3 | ErrorBoundary en hero; retry sin bloquear |
| 6 | Recognition Rather Than Recall | 3 | FAQ h2 en sr-only reduce anclaje visual de sección; pattern 01/02/03 carga navegación |
| 7 | Flexibility & Efficiency | 3 | Anchors navbar a secciones; sin atajos teclado |
| 8 | Aesthetic and Minimalist Design | 4 | Eyebrow eliminado de 4/7 secciones; cero clutter; hairlines como estructura |
| 9 | Error Recovery | 3 | Spline: fallback geométrico con retry explícito |
| 10 | Help and Documentation | 2 | F04 micro-CTA a #cta añadido; FAQ cubre objeciones; sin contextual help fuera FAQ |
| **Total** | | **32/40** | **Good** |

## Anti-Patterns Verdict

**LLM assessment:** No AI slop detectable. Los cuatro fixes aplicados eliminan los dos patrones que más arriesgaban la lectura AI: eyebrows en todas las secciones (7/7 → 3/7 visible: HeroSplite, OfferLadderV3, CTAFinal) y separación visual débil en OfferLadder. El placeholder F04 ahora ancla el embudo con un micro-CTA específico y tres entregables concretos. CTAFinal ya no rompe layout en viewports estrechos.

**Deterministic scan:** detect.mjs retornó `[]` sobre los tres directorios escaneados (app/consultoria, components/sections, components/consultoria). Cero pattern matches en todos los archivos. Limpio.

**Visual overlays:** No corridas (servidor no levantado, solo auditoría de código fuente).

## Overall Impression

Post-fixes, la página lee como un documento editorial coherente: eyebrows solo donde abren bloque temático (3 instancias deliberadas), separadores explícitos en OfferLadder, y el placeholder F04 ya cierra su propio nudo narrativo con CTA a #cta. El único finding nuevo con impacto real es el texto de contacto pequeño en CTAFinal que no pasa AA en contraste (alabaster/45 sobre onyx). El score sube a 32/40.

## What's Working

1. Eyebrow discipline: de 7/7 a 3/7, las tres restantes (HeroSplite, OfferLadderV3, CTAFinal) abren bloques temáticos con cambio de fondo. El patrón ahora es voz, no gramática.
2. OfferLadderV3 dividers explícitos: border 1px var(--color-divider) en PeldanoCell y TierBlock reemplaza el gap-px trick; visible en cualquier DPI y viewport, incluido 1024px.
3. F04 micro-CTA: tres entregables concretos (mapa de brechas, priorización por impacto, plan de acción) + enlace a #cta interrumpe la secuencia de placeholder sin texto de venta.
4. CTAFinal clamp: clamp(1.875rem, 4vw + 0.75rem, 2.75rem) + break-all elimina overflow en iPhone SE.

## Priority Issues

**[P2] CTAFinal post-mono en alabaster/45 no pasa AA**
- Qué: CTAFinal.tsx:119-121 — bloque "THEOLAB · BOGOTÁ · COLOMBIA / admin@theolab.tech" usa `text-[var(--color-alabaster)]/45`. Contraste estimado ~4.2:1 sobre onyx. Texto pequeño (0.7rem, weight 500) requiere 4.5:1 mínimo.
- Por qué importa: texto de contacto visible en la sección de mayor conversión. Un socio que llega por mobile podría no poder leerlo.
- Fix: subir a `/55` o `/60` mínimo (~5.1:1). Alternativamente eliminar el email duplicado (ya está como link en la card) y dejar solo el topónimo.
- Comando sugerido: `/impeccable audit components/sections/CTAFinal.tsx`

**[P3] SectionPlaceholder CTA usa burgundy deprecado**
- Qué: page.tsx:163 — `decoration-[var(--color-burgundy)]` en el link del placeholder F04. Burgundy está deprecado por brand v0.4 (The Burgundy Sunset Rule). Código nuevo no debe introducirlo.
- Por qué importa: deuda técnica de brand. Si el refactor del Button solid tarde en llegar, este introduce un vector más.
- Fix: cambiar a `decoration-[var(--color-crimson)]` para consistencia con el resto del sistema.
- Comando sugerido: `/impeccable polish app/consultoria/page.tsx`

**[P3] FAQ h2 en sr-only sin anclaje visual**
- Qué: FAQ.tsx:72-75 — el h2 "Preguntas frecuentes" está completamente oculto. Sin eyebrow ni titular visible, la sección comienza directamente en el acordeón.
- Por qué importa: usuario que escanea verticalmente no tiene ancla visual para identificar que llegó a FAQ. Heurística H6 (Recognition over Recall): el usuario debe recordar que debajo del CTA hay FAQ, no reconocerlo.
- Fix: hacer visible el h2 en el nivel `text-headline` (sin eyebrow, directo al h2, consistente con Espejo y Diferenciadores post-fix).
- Comando sugerido: `/impeccable clarify components/sections/FAQ.tsx`

## Persona Red Flags

**Jordan (abogada asociada, primera visita):** F04 placeholder ya tiene CTA y entregables concretos — el riesgo de "producto incompleto" bajó significativamente. Riesgo residual: FAQ no tiene titular visible; Jordan que llegue al acordeón sin saber que es FAQ puede confundirse y abandonar antes de leer las respuestas a sus objeciones.

**Casey (socio fundador, mobile):** CTAFinal clamp resuelto en iPhone SE. El bloque postal THEOLAB · BOGOTÁ · COLOMBIA con contraste insuficiente es ilegible en pantallas OLED con brillo bajo.

## Minor Observations

- `page.tsx:41-44`: `hasMounted` sigue siendo dead code si PR4/PR5 no lo consumen. Remover en el mismo PR que los use, no antes.
- `CTAFinal.tsx:125-126`: email `admin@theolab.tech` en texto plano en bloque postal, no como `<a href="mailto:...">`. No es bloqueante (la card de correo lo tiene como link), pero inconsistente.
- `ConsultoriaHeader`: "CUPOS JUNIO" hardcodeado se desactualiza en julio. Fuera de scope de este fix.

## Questions to Consider

¿El FAQ sin titular visual es una decisión deliberada de diseño (la sección se auto-describe por sus preguntas) o un residuo del fix de eyebrow que eliminó más de lo previsto?

Con score 32/40 y P0/P1 en cero, ¿el umbral de merge para PR #2 es 32 o se requiere llegar a 35?
