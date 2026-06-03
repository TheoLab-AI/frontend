---
timestamp: 2026-06-03T07-16-06Z
slug: app-consultoria-page-tsx
---
## Design Health Score

| # | Heuristica | Score | Hallazgo clave |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | SpotsWidget navbar correcto; typewriter inicia con texto completo SSR-safe; aria-live en banner reactivo funciona |
| 2 | Match Between System / Real World | 4 | Lenguaje socio legal preservado; peldanios no tiers; copy especifico Colombia |
| 3 | User Control and Freedom | 3 | SymptomPill persiste en URL (?sintomas=) + popstate; FAQ permite cerrar; sin breadcrumb global |
| 4 | Consistency and Standards | 4 | Tokens respetados en toda la superficie; motion variants reutilizados; SectionPlaceholder structure-consistent |
| 5 | Error Prevention | 3 | ErrorBoundary + timeout 10s en Spline; retry sin bloquear hero; typewriter resiliente a JS slow/fail |
| 6 | Recognition Over Recall | 3 | Pattern 01/02/03 carga navegacion visual; SpotsWidget en navbar ancla urgencia |
| 7 | Flexibility & Efficiency | 3 | Anchors navbar a todas las secciones; sin atajos teclado; sin busqueda FAQ |
| 8 | Aesthetic and Minimalist Design | 4 | Cero clutter; hairlines como estructura; motion solo donde narra algo; no card grids genericos |
| 9 | Error Recovery | 3 | Spline: fallback geometrico con retry explicito; banner reactivo sin estado roto posible |
| 10 | Help and Documentation | 1 | FAQ cubre objeciones clave; F04 placeholder no tiene micro-CTA; sin contextual help fuera FAQ |
| Total | | 31/40 | Good |

## Anti-Patterns Verdict

LLM: No AI slop detectable. Rechaza los 5 tells saturados 2024-2026. La unica tension es el patron eyebrow en todas las secciones (7/7) que roza la gramática AI segun The Eyebrow Discipline Rule.

Deterministic: detect.mjs retorno [] en toda la superficie. Cero pattern matches.

Visual overlays: No corridas.

## Overall Impression

La pagina sube de 26/32 (baseline) a 31/40 post-harden. Los dos P1 cayeron. Los tres P2 restantes son operacionales, no esteticos.

## What's Working

1. Typewriter hardened: typedCount inicia en TITLE_TOTAL en SSR; h1 tiene aria-label completo; sr-only duplicado eliminado.
2. URL-persistence de SymptomPills: ?sintomas= persiste via history.replaceState; popstate rehydra en back/forward.
3. Spline failure isolation: ErrorBoundary + timeout 10s + fallback geometrico con retry.
4. Copy evidencia antes que adjetivos: cifras observables en Espejo, Diferenciadores, OfferLadderV3.

## Priority Issues

[P2] F04 placeholder sin micro-CTA interrumpe embudo: page.tsx:58-64. Reemplazar nota mono por micro-CTA a #cta. Command: /impeccable clarify app/consultoria/page.tsx

[P2] Eyebrow en cada seccion (7/7): cadencia AI. DESIGN.md reserva el patron para secciones que abren bloque tematico nuevo. Eliminar de Espejo, Diferenciadores, ParaQuien, FAQ. Command: /impeccable quieter app/consultoria/

[P2] OfferLadderV3 separacion visual debil en 1024px: gap-px desaparece en laptops 13-14 pulgadas. Incrementar a gap-0.5 o gap-1 en md+. Command: /impeccable layout components/consultoria/OfferLadderV3.tsx

[P3] CTA cards text-display rompe en viewport menor a 380px: numero WhatsApp puede desbordarse. Reducir a text-headline en CTAFinal. Command: /impeccable adapt components/sections/CTAFinal.tsx

## Persona Red Flags

Jordan (abogada asociada, primera visita): F04 placeholder lee como producto incompleto. Timeline 6-12 meses implementacion sin "usted puede salir" visible genera friccion.

Casey (socio fundador, movil): CTA cards con text-display pueden ser ilegibles en iPhone SE. Sin boton explicito de WhatsApp para tap rapido.

## Minor Observations

hasMounted en page.tsx:41-44 es dead code si PR4/PR5 no lo usan en 2 sprints.

CTAFinal.tsx:119-121: email duplicado en bloque postal (texto plano, no link).

FAQ.tsx:80-83: h2 FAQ solo en sr-only; inconsistente con el resto de secciones.

ConsultoriaHeader.tsx:63: "CUPOS JUNIO" hardcodeado; se desactualiza en julio.

## Questions to Consider

Si PR5 no tiene fecha concreta, es mas honesto reemplazar F04 con descripcion estatica del Diagnostico que cierre el embudo hoy.

El patron eyebrow en 7 secciones es gramática AI o firma visual deliberada?

CTAFinal: cual es el canal preferido para calificar leads B2B alto ticket? Si es WhatsApp, darle mayor peso visual.
