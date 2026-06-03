---
target: app/consultoria/
total_score: 26
p0_count: 0
p1_count: 2
timestamp: 2026-06-03T06-34-33Z
slug: app-consultoria-page-tsx
---
# Critique · /consultoria · 2026-06-03

## Design Health Score

| # | Heurística | Score | Hallazgo clave |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | SpotsWidget navbar bien; falta feedback inline tras seleccionar síntomas en Hero |
| 2 | Match Between System & Real World | 4 | Lenguaje del socio (matter, secreto profesional, ROI medido); "peldaños" no "tiers" |
| 3 | User Control & Freedom | 2 | SymptomPill sin reset claro; sin breadcrumb global; FAQ no permite cerrar Q1 default |
| 4 | Consistency & Standards | 4 | Tokens respetados, motion variants reusados, SectionPlaceholder mimics estructura compilada |
| 5 | Error Prevention | N/A | No hay formularios; CTA salen a WhatsApp/correo |
| 6 | Recognition Over Recall | 3 | Números 01/02/03 cargan pattern visual; section IDs no visibles al usuario |
| 7 | Flexibility & Efficiency | 3 | Anchors navbar + SpotsWidget; sin atajos de teclado ni búsqueda FAQ |
| 8 | Aesthetic & Minimalist Design | 4 | Cero clutter; hairlines como estructura; motion solo donde narra algo |
| 9 | Error Recovery | N/A | No hay formularios |
| 10 | Help & Documentation | 3 | FAQ de 5 preguntas cubre objeciones; sin contextual help fuera FAQ |
| Total | | 26/32 (~32/40) | Good — base sólida, ajustes operacionales pendientes |

## Anti-Patterns Verdict

LLM: No AI slop manifiesto. Rechaza los 5 tells saturados 2024-2026 (icon+title+desc cards, gradient text, hero-metric template, eyebrows en cada sección, buzzwords IA). Aesthetic editorial-typographic cercana pero diferenciada por Onyx, cero serif, motion no estática. Identity preservation por brand v0.3/v0.4 commit con Inter.

Deterministic: `detect.mjs` regresó `[]`. Cero pattern matches en app/consultoria, components/consultoria, components/sections.

Visual overlays: no corrida (prototipo con F04 placeholder y PR3 R3F en branch paralela).

## Overall Impression

Entre las landings B2B legal colombianas más sobrias que existen. Copy carga el peso (cifras observables, especificidad del entregable, propiedad del cliente). Motion restraint y propositivo. Debilidades operacionales (estado no persiste, micro-CTA en placeholder, fallback mobile genérico), no estéticas. Oportunidad mayor: SymptomPill estado URL-persistente + F04 implementado.

## What's Working

1. Copy editorial con cifras observables (Espejo, Diferenciadores, OfferLadderV3 pricing inline split fundador/regular). "Cifras antes de adjetivos" cumplido.
2. Accesibilidad arquitectónica adversarial-reviewed: role="list" explícito en OfferLadderV3 (Safari/VoiceOver workaround), sr-only para typewriter, aria-labelledby consistente.
3. Motion restraint respeta voz Archivist: typewriter narrativo, prefers-reduced-motion honrado, SymptomPill checkmark significativo, fadeUp/stagger no compite con copy.

## Priority Issues

### [P1] Typewriter SR rompe transición narrativa
- What: HeroSplite.tsx:73-104. aria-hidden={!done} oculta el typewriter parcial al SR; sr-only se anuncia solo al final. Usuario ciego pierde "Usted sabe el qué → nosotros traemos el cómo".
- Why: Primer h1, primera impresión. SR no oye la diferenciación retórica core.
- Fix: Render título completo en sr-only desde el mount sin gate done.
- Command: /impeccable audit components/sections/HeroSplite.tsx

### [P1] SymptomPill no persiste, rompe flujo lectura
- What: HeroSplite.tsx:300-307. Set<Symptom> es state local; scroll a otra sección y vuelta = pills desmarcados.
- Why: Socio B2B alto ticket relee y compara. Pierde intent signal valioso. Sugiere descuido.
- Fix: Persist en URLSearchParams (?sintomas=horas,riesgo) o localStorage. Rehydrate on mount. Bonus: pasar selección a F03 como prioridad sugerida (Inicial vs Completa).
- Command: /impeccable harden components/sections/HeroSplite.tsx

### [P2] F04 placeholder sin micro-CTA interrumpe embudo
- What: page.tsx:58-64. SectionPlaceholder dice "Próximamente". No hay link, no hay CTA.
- Why: Socio lee F03 precio, pisa F04 hueco, interpreta proveedor incompleto. Embudo roto justo antes de F07.
- Fix: Reemplazar nota mono por micro-CTA a #cta: "Pregúntenos qué incluye el Diagnóstico". Mantiene flujo, no requiere implementar F04.
- Command: /impeccable clarify app/consultoria/page.tsx o /impeccable shape "F04 sticky scroll diagnostico"

### [P2] OfferLadderV3 separación visual débil en md
- What: OfferLadderV3.tsx:80. grid-cols-1 md:grid-cols-12 gap-px. Hairline 1px desaparece a primera lectura en 1024px. F03 es la sección más crítica de conversión.
- Why: Si el socio no distingue Reunión (gratis) vs Consultoría (pago), el ancla del precio fundador pierde dramatismo.
- Fix: Aumentar gap-px a gap-2 (8px) o subir peso visual del border vertical interno con border-l por PeldanoCell. Validar en 1024px y 1440px reales.
- Command: /impeccable layout components/consultoria/OfferLadderV3.tsx

### [P3] Spline fallback "Cargando..." genérico en mobile
- What: HeroSplite.tsx:289-298. Mobile renderiza SpliteFallback con texto "Cargando escena…" 1-2s sobre fondo onyx vacío.
- Why: Casey (mobile distraído) ve hueco y se va antes de que cargue.
- Fix: Skeleton geométrico (líneas hairline animadas) o screenshot estático pre-rendered. Placeholder no necesita fidelidad; necesita no leer broken.
- Command: /impeccable optimize components/sections/HeroSplite.tsx

## Persona Red Flags

Jordan (Confused First-Timer, abogada asociada 28 años): Hero pills + banner reactivo confunde si está EN el diagnóstico o si será abordado. FAQ Q1 menciona 6-12 meses implementación = interminable. Falta timeline visual.

Riley (Stress Tester, CTO 15 años, BYOC sospechoso): FAQ Q2 sobre datos responde prosa Ley 1581 + secreto, sin estructura técnica (Docker/VPC/exportable). Diferenciador 02 lee marketing hasta "no atado a caja negra"; no explícito sobre migración.

Casey (Distracted Mobile, gerente operativa una mano): Hero Spline stacked bajo copy + "Cargando…" + pills pequeños ~40px. CTA Final dos botones en stack agregan paso "elige canal" antes de "agenda".

Esteban (custom — Socio fundador firma legal Cali 48 años, conservador): Typewriter cursor crimson lee como "en construcción". Robot Spline lee como "agency de diseño, no proveedor técnico". Espejo "El junior que usa ChatGPT" señala problema sin remitir solución en siguiente sección. Dos botones (WhatsApp/correo) en lugar de calendario lee anticuado.

## Minor Observations

- Wordmark.tsx:23 aria-label="TheoLab" correcto, usado en footer decorativo OK.
- FAQ.tsx:56 openIndex arranca en 0 (Q1 abierto). null permitiría estado cerrado. Para B2B donde Q1 (tiempo) es objeción top, dejarlo en 0 es defensible.
- lib/contact.ts centraliza datos; JSON-LD lo consume. Single source of truth.
- Section padding py-24 md:py-32 editorial generoso. OK.

## Questions to Consider

1. Si los 10 cupos fundadores son el scarcity engine, por qué solo el navbar widget los comunica. F03 muestra precio fundador sin contador inline ni fecha de cierre. Esteban ve oferta sin urgencia. Quizá FounderCounter en F03 espejando SpotsWidget.
2. Hero Spline 3D narra algo o es lujo. Robot mouse-follow lindo, qué aprende el socio. Si "nos diferencia", revisar contra Voz sobria. PR3 R3F puede acoplar narrativa: robot reacciona a pills seleccionados, no solo al cursor.
3. F04 placeholder debería en su lugar mostrar un sample real del Diagnóstico. PRODUCT.md principle "Especificidad es social proof" pediría /consultoria/diagnostico-sample anónimo con diagnóstico real. Más alto valor que sticky scroll narrativo.
