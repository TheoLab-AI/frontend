# Product

## Register

brand

## Users

**Primario.** Socios fundadores de firmas legales colombianas (5 a 50 abogados, práctica activa). B2B alto ticket. Llegan por referido o reputación, raramente por SEO. Contexto al usar el sitio: están validando si TheoLab es proveedor "serio" antes de pedir una reunión de introducción. Job to be done: confirmar que detrás del nombre hay criterio técnico real, evidencia de método, y propiedad clara del entregable. La objeción de fondo no es precio, es riesgo profesional (secreto, dependencia, vendor lock-in).

**Secundario.** Empresas B2B colombianas y de LatAm que "ya saben dónde van" y necesitan infraestructura, modelos o adopción de IA. Llegan por el home institucional `/`. Contexto: evaluación temprana, comparan TheoLab contra agencies generalistas y consultoras tradicionales. Job to be done: descartar rápido si TheoLab es agency más, o si es proveedor de infraestructura real con harness propio.

**Anti-usuario.** Tomadores de decisión que esperan templates de marketing, ofertas de descuento, cards con iconos+títulos+desc y testimoniales fabricados. El sitio debe filtrarlos por estética, no por copy explícito.

## Product Purpose

TheoLab vende criterio técnico de IA aplicada a operaciones empresariales serias. El frontend es la primera carta profesional y el filtro de fit. Hoy aloja dos surfaces:

- **`/` (home institucional).** Vende los 4 tiers TheoLab (Infraestructura IA, Adopción, Automatización y agentes, Tecnología jurídica) con evidencia del harness v0.1.0 (cov 0.975 / strict 0.675 / FP 0.091).
- **`/consultoria`.** Oferta legal específica con embudo de 3 peldaños (Reunión gratis · Consultoría con pricing fundador 10 cupos · Implementación a medida). Esta es la ruta caliente de conversión hoy.

`v0.1+` traerá dashboard, blog técnico y demos del harness. Esos surfaces podrán declarar `register: product` por tarea, pero el default del proyecto se mantiene `brand` mientras la web siga siendo el canal primario.

Éxito en una métrica: una reunión de introducción agendada por un socio que llegó frío al sitio, leyó la propuesta y vino convencido de que el método es real. El sitio no necesita generar lead alto volumen; necesita no perder un solo socio fit.

## Brand Personality

- **Mix Jung.** 70% Sage + 30% Magician. Persona declarada: **The Archivist**.
- **Voz.** Sobria, evidence-first, sin ornamento, sin marketing fluff. Densidad editorial sobre tono inspiracional. Frases declarativas, no preguntas retóricas.
- **3-word.** Deliberada · Evidence-first · Asentada.
- **Tensión deliberada.** Voz sobria en copy y tipografía, pero ambición visual y motion cinematográfico al nivel de Apple product pages. El sitio debe leerse calmo y verse técnicamente extraordinario. La densidad no es timidez.
- **Tagline canónico.** "Tú sabes el qué — nosotros traemos el cómo." (Solo lugar donde se admite la pausa larga; en el resto del copy, sin em dashes.)
- **Locale.** es-CO. Español completo con acentos siempre. Tono respetuoso/profesional, sin formalidad anticuada. Tutear cliente no es regla; depende de la sección. El home institucional usa "usted"; la voz interna del Archivist puede ir más directa.

## Anti-references

Escritas como matriz para que cualquier audit lo pueda ejecutar literal.

| Familia | Cómo se detecta | Por qué se rechaza |
|---|---|---|
| **SaaS cliché** | Card grids con icon + título + descripción · hero metric template (cifra gigante + label + stat de soporte + gradient accent) · numbered eyebrows 01/02/03 en cada sección · gradient text decorativo · cards horizontales repetidas para "features" | Lenguaje saturado del mercado IA 2024-2026. Reduce TheoLab a "otra herramienta más". El diferenciador estructural se pierde. |
| **Magazine warm-cream** | Body bg cream/sand/paper/parchment con chroma baja warm (OKLCH L 0.84+, C < 0.06, hue 40-100) · serif retro tipo Tiempos/Source Serif · tokens nombrados `--paper` `--cream` `--linen` | Default AI 2026 por monocultura. "Warmth" tipo Aesop debe venir de tipografía y acentos, no de body tinted-warm. TheoLab carga calor con Burgundy / Crimson / Gold, no con bg crema. |
| **Glassmorphism y blur decorativo** | Backdrop-filter para cards "premium" · neumorphism · sombras suaves "elegantes" | Vibe 2022. Reduce seriedad B2B. Glass cuando es funcional sí; como recurso decorativo no. |
| **Agency portfolio** | Gradientes saturados full-page · marquees scrolling con nombres de clientes · swiss-grunge mix · tipografía oversized centered con stock imagery debajo | Lenguaje de creative shop, no de proveedor de infraestructura. TheoLab no es agency. |
| **Emojis, exclamaciones, em dashes en copy** | `?` y `!` interrogación/exclamación de marketing, emojis decorativos, em dashes `—` o `--` en el copy (excepción única: el tagline canónico) | Tells de marketing barato y de generación AI. Comas, dos puntos, semicolons, períodos, paréntesis bastan. |
| **Buzzwords IA** | "AI-powered", "transform", "leverage", "seamless", "unlock", "harness AI" (excepción: `harness` como nombre propio del producto técnico), "world-class", "enterprise-grade", "next-generation", "cutting-edge", "game-changer", "mission-critical", "disruptive", "revolutionary", "synergy" | Saturados. Sustituir por verbo + sustantivo concreto que describa lo que el producto literalmente hace. |
| **Tiny uppercase tracked eyebrow en cada sección** | Eyebrows pequeñas all-caps tracked encima de cada `<section>` ("ABOUT" "PROCESS" "PRICING") | Saturated AI scaffold 2023-onwards. Una eyebrow puntual por brand decision sí, eyebrow en TODA sección como gramática default no. |
| **Side-stripe borders** | `border-left` > 1px como acento en cards/callouts/list items | Nunca es intencional. Si necesitas énfasis, usa borders completos, leading numbers, hairlines superiores. |

## Design Principles

Cuatro reglas estratégicas que ordenan cualquier decisión visual o de copy futura. No son tokens, no son tácticas.

### 1. Cifras antes de adjetivos

Toda promesa se acompaña de un número observable. Si no hay número, se reformula. Aplica a:
- **Copy.** "rápido" → "1 a 3 semanas". "preciso" → "cov 0.975 / strict 0.675 / FP 0.091". "muchas horas" → "estimación documentada de horas por proceso".
- **UI.** Si una sección dice valor, debe haber al menos un número visible. La sección Evidence del home es la implementación canónica.
- **Test.** Pasar las cifras del harness en el sitio sin contexto del usuario. Si quedan abstractas, el principio no se está cumpliendo: traducir.

### 2. Especificidad es la social proof

No hay testimoniales (todavía). La confianza la carga la textura del entregable. Aplica a:
- **Diagnóstico.** Listar qué incluye con verbos concretos (análisis documentado, mapa de oportunidades priorizadas, riesgos identificados por nombre). Nada genérico.
- **Pricing.** Mostrar regular y fundador en simultáneo (no toggle) ancla el descuento como decisión, no como promo. Lo hace `/consultoria` F03.
- **Embudo.** Cada peldaño responde una pregunta distinta y declara qué decisión cierra. Nada de "consulta personalizada".

### 3. Su firma es dueña de lo suyo

Propiedad del cliente como diferenciador estructural, no feature publicitaria. Aplica a:
- **Copy.** El bloque `PropiedadCliente` en el home, frases tipo "El Diagnóstico es suyo desde el día uno", explícito en el contrato de implementación.
- **UX.** Cero patrones de lock-in (no captura agresiva, no gated content, no "schedule a demo" como única CTA). Las CTAs muestran qué pasa después.
- **Arquitectura.** Cuando llegue dashboard, el data ownership es del cliente. El sitio no puede sugerir lo contrario por accidente UX (no "we'll keep your data safe", sino "es tu repositorio, te lo entregamos en este formato").

### 4. Voz sobria, motion ambiciosa

Tensión deliberada, no contradicción. Copy en registro Archivist (calmo, denso, sin ornamento). Pero motion cinematográfico y deliberado, no apagado. Aplica a:
- **Motion register.** Las tres familias confirmadas como brújula: (a) scroll-driven cinematográfico tipo Apple iPhone (hero R3F + transformaciones ancladas a scroll), (b) transiciones memorables entre rutas tipo Awwwards top-tier (View Transitions API curada), (c) coreografía de layout tipo Framer (cuando algo cambia de estado, las piezas se reacomodan con fluidez). La cuarta familia (sutil-funcional Stripe) NO es nuestro registro: el sitio debe verse técnicamente extraordinario.
- **No-go.** Si el motion compite con el copy, el motion se pasó. Si el motion sirve la lectura (revela una métrica, abre una decisión, conecta dos ideas), el motion está en su lugar.
- **Reduced motion.** Honrado en TODA animación con crossfade o instant transition. No negociable dado el commitment con motion alto.

## Accessibility & Inclusion

- **WCAG AA mínimo** en todos los surfaces. Sin excepción.
- **Lighthouse a11y ≥95** en mobile como gate de deploy. No es target, es bloqueo.
- **Contraste.** Body text ≥ 4.5:1 contra su background. Large text (≥18px o bold ≥14px) ≥ 3:1. Placeholders cumplen 4.5:1 igual que body. Documentado en lecciones de adversarial review PR4: alabaster /40, /50, /55 ya identificados como AA fail.
- **Reduced motion.** `prefers-reduced-motion: reduce` honrado con crossfade o instant transition en cada animación. Globals.css ya tiene el media query base; cada componente con motion debe verificar fallback explícito.
- **Foco visible.** Outline 2px crimson con offset 2px (en `globals.css :focus-visible`). No remover.
- **Locale es-CO.** Inter Variable soporta acentos completos; nunca degradar tildes ni eñes. Los lectores legales colombianos detectan diacríticos faltantes como descuido inmediato.
- **Navegación por teclado.** Toda CTA, link y control alcanzable con tab. Modal/dialog vía Radix Primitives (ya en stack).
- **Semántica.** Jerarquía h1 → h2 → h3 → h4 sin saltos. Listas como `<ul>/<ol>/<li>`, no `<div>`s. `<article>` con `aria-labelledby` para tiers/cards. `<del>` semántico para precios tachados con sr-only "Precio anterior:". Lecciones canonizadas en PR4 adversarial review.
- **Idioma `lang="es-CO"`** en `<html>`. Ya configurado en `app/layout.tsx`.

## Notas de implementación cerradas

Estas decisiones están cerradas y no se relitigan sin data nueva (métrica de conversión, feedback estructurado de 3+ clientes, restricción técnica). Se documentan aquí para que cualquier agente futuro las honre sin re-preguntar.

- **Tipografía.** Una sola familia: **Inter Variable** (Inter + Inter Tight, axis `opsz` activo). Cifras y mono usan Inter con `font-variant-numeric: tabular-nums` + tracking ajustado, NO una segunda familia. El wireframe v1 de `/consultoria` pidió JetBrains Mono; queda pendiente reescribirlo a Inter tabular-nums. Regla brand v0.3: "hierarchy lives in weight and scale, not typeface variety".
- **Paleta.** Obsidian Chrome (Onyx · Slate · Alabaster) × Golden Hour (Burgundy · Crimson · Gold). OKLCH. Color strategy: **committed** — Burgundy/Crimson/Gold cargan identidad como roles deliberados, no como acentos sueltos.
- **Componentes.** Radix Primitives + CVA. NO shadcn. Custom from tokens para máxima identidad.
- **Stack.** Next.js 16.2 (App Router + Turbopack) · Tailwind v4 (CSS-first) · Motion 12 · View Transitions API · R3F para hero 3D.
- **Performance gates.** LCP < 2.5s · INP < 200ms · CLS < 0.1 · Lighthouse mobile ≥ 95 en todas las categorías.

## Referencias

- `DESIGN-DECISIONS.md` — stack y tokens cerrados (2026-05-26).
- `docs/landing-consultoria-wireframe-v1.md` — wireframe estructural `/consultoria`.
- `docs/landing-consultoria-copy-v1.md` — copy aprobado.
- `docs/SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md` — lecciones a11y vivas del último PR.
- `C:\TheoLab\docs\brand\design-system\README.md` — Brand System v0.4 completo.
- `C:\TheoLab\CLAUDE.md` — contrato de comportamiento workspace.
