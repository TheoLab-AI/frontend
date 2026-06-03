---
name: TheoLab
description: Sistema visual sobrio, evidence-first. Mesa de archivo con sello de oro al final.
colors:
  onyx: "#0A0A0A"
  slate: "#536878"
  alabaster: "#E5E4E2"
  paper: "#F2F1EF"
  crimson: "#FF4500"
  orange: "#FF8A00"
  gold: "#FFD700"
  burgundy: "#800020"
  bg: "{colors.alabaster}"
  bg-elevated: "{colors.paper}"
  fg: "{colors.onyx}"
  fg-muted: "{colors.slate}"
  accent: "{colors.crimson}"
  accent-bright: "{colors.gold}"
typography:
  display:
    fontFamily: "Inter Tight, Inter, ui-sans-serif, system-ui"
    fontSize: "clamp(2.75rem, 6vw + 1rem, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.03em"
    fontVariation: "opsz auto"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "clamp(1.875rem, 2vw + 1rem, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "clamp(1.375rem, 1vw + 1rem, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
    fontFeature: "ss01, cv11, calt, kern, tnum"
  bodyLg:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "clamp(1.0625rem, 0.4vw + 1rem, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
  ui:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  none: "0px"
  xs: "2px"
spacing:
  containerMax: "80rem"
  containerPad: "clamp(1.25rem, 4vw, 3rem)"
  sectionY: "clamp(4rem, 8vw, 8rem)"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-solid:
    backgroundColor: "{colors.onyx}"
    textColor: "{colors.alabaster}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-solid-hover:
    backgroundColor: "{colors.burgundy}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.bg-elevated}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-accent:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.onyx}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  card-default:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "24px"
  card-dark:
    backgroundColor: "{colors.onyx}"
    textColor: "{colors.alabaster}"
    rounded: "{rounded.none}"
    padding: "24px"
  badge-neutral:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  badge-accent:
    backgroundColor: "{colors.burgundy}"
    textColor: "{colors.alabaster}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  badge-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.onyx}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
---

# Design System: TheoLab

## 1. Overview

**Creative North Star: "The Archivist's Workbench"**

Una mesa de archivo con luz controlada. Papel grueso de tono cálido neutro (alabaster, paper). Tinta densa (onyx) como peso del sistema. Reglas de margen finísimas (hairlines slate al 18% de opacidad) que ordenan secciones como una página de FT Weekend. Y, al final del recorrido, un sello lacrado en oro: el acento se gana, no se reparte. Esta no es la estética de una herramienta de productividad ni de una agency cool. Es la estética de un proveedor que cobra por criterio.

El sistema rechaza por contrato lo que PRODUCT.md ya delimitó: cards genéricas con iconos, hero metric templates, body bg cream/sand magazine-warm, glassmorphism decorativo, agency portfolio gradient walls, eyebrows tracked en cada sección. El registro de la voz Archivist (sobrio, denso, sin ornamento) tiene su contraparte visual exacta: tipografía Inter como única familia, hairlines sin sombras, esquinas casi rectas. La compensación es motion deliberadamente ambiciosa (scroll-driven cinematográfico, transiciones memorables entre rutas, coreografía de layout). Voz calmada, página en movimiento.

**Key Characteristics:**

- **Sin radius por defecto.** Esquinas rectas (`0px`) en cards, botones, badges. La excepción son chips puntuales (`2px`).
- **Sin sombras.** La profundidad vive en hairlines y contraste tonal entre `bg`, `bg-elevated` y `onyx`.
- **Una sola familia tipográfica.** Inter Variable carga todo el peso; jerarquía en escala y weight, no en variedad.
- **Color committed, no decorativo.** Burgundy/Crimson/Gold cargan identidad como roles deliberados; nunca como acento suelto.
- **Tactile press de 1px.** La única "respuesta física" del sistema: `translate-y-[1px]` en `:active`.
- **Hairlines como reglas tipográficas.** 1px slate al 18% (`var(--color-divider)`) separan, no decoran.

## 2. Colors: Obsidian Chrome × Golden Hour

Dos sub-paletas en tensión deliberada. La estructura es fría y mineral; la expresión es cálida y candente. El sistema vive en el equilibrio entre ambas; rara vez las mezcla.

### Primary

- **Crimson** (`#FF4500`): acento por defecto del sistema. Carga focus rings, CTAs accent (gradient), selection text, eyebrow dots de sección. Es la chispa que ancla la mirada cuando todo lo demás está en gris-negro-papel.

### Secondary

- **Orange** (`#FF8A00`): existe únicamente como middle stop del **Gradient Insignia** (`linear-gradient(90deg, #FF4500 0%, #FF8A00 55%, #FFD700 100%)`). NUNCA se usa standalone. Su rol es transición de fuego entre crimson y gold; sacarlo del gradient quiebra la firma visual.

### Tertiary

- **Gold** (`#FFD700`): el sello lacrado. Carga el wordmark "Lab" (gradient pintado), highlights de impacto en hero, badges premium ("EDICIÓN FUNDADORA"), dot eyebrows sobre fondos `onyx`. Se reserva para los momentos donde el sistema dice "esto importa".

### Neutral

- **Onyx** (`#0A0A0A`): texto primario en light mode, body bg en dark mode, fondo de secciones de corte editorial (F03 OfferLadder, CTA Final, Footer). Es la tinta.
- **Slate** (`#536878`): texto secundario, metadata, eyebrows sobre fondo claro, base de los hairlines `var(--color-divider)` con opacidad ajustada.
- **Alabaster** (`#E5E4E2`): papel base. Body bg en light mode; texto sobre fondos onyx. Es la superficie donde vive casi todo el sistema.
- **Paper** (`#F2F1EF`): superficie elevada un escalón sobre alabaster. Cards `default`, fondos de sección secundarios. La única "elevación" visible del sistema (sin sombra; solo tono).

### Deprecated

- **Burgundy** (`#800020`): "tinta legacy" de brand v0.4. Solo fallback de impresión y, transitoriamente, hover del Button solid (`bg-onyx → bg-burgundy`). NUEVO trabajo en UI no debe introducir burgundy como rol activo; se reemplaza por `crimson` cuando aplica. Pendiente: refactor del componente Button + Badge `accent` para retirar burgundy del runtime.

### Named Rules

**The Sealed Wax Rule.** Gold es sello, no decoración. Aparece en momentos puntuales (wordmark, eyebrow dots sobre `onyx`, highlights de hero, edición fundadora). Cubrir > 10% de un viewport con gold rompe la jerarquía: deja de ser sello.

**The One Voice Rule.** El gradient insignia (crimson → orange → gold) aparece en un solo elemento de impacto por surface, no más. Es la firma. Si lo repites, deja de leer como firma y empieza a leer como wallpaper.

**The Hairline-Not-Border Rule.** Las separaciones entre secciones y entre cards son hairlines 1px en color `divider` (slate al 18% de opacidad). Bordes gruesos, sombras, o gradientes-divisorios están prohibidos. La pagina del FT Weekend no tiene drop-shadows.

**The Burgundy Sunset Rule.** Burgundy está deprecado a fallback de impresión. NUEVO código no lo introduce. El refactor pendiente del Button solid y Badge accent retira burgundy del runtime; ese trabajo entra en el siguiente PR de cleanup.

## 3. Typography

**Display Font:** Inter Tight (axis `opsz` activo)
**Body Font:** Inter Variable (axis `opsz` activo)
**Label/Mono Font:** Inter Variable con `font-variant-numeric: tabular-nums` y tracking ampliado. **NO se usa una segunda familia mono.**

**Character:** Una sola voz tipográfica, modulada por peso y escala. La densidad de información se carga en tracking negativo (`-0.03em` en display, `-0.02em` en headline) y `text-wrap: balance` en `h1–h3`. La sensación es de página editorial con confidence técnica, no de SaaS landing.

### Hierarchy

- **Display** (`700`, `clamp(2.75rem, 6vw + 1rem, 5.5rem)`, `line-height 0.95`, `tracking -0.03em`): hero de página, headline principal de `/consultoria` y `/`. Una vez por página, máximo dos.
- **Headline** (`600`, `clamp(1.875rem, 2vw + 1rem, 2.75rem)`, `line-height 1.1`, `tracking -0.02em`): titulares de sección (F02 Espejo, F03 Cómo trabajamos, F08 FAQ). `<h2>`.
- **Title** (`600`, `clamp(1.375rem, 1vw + 1rem, 1.75rem)`, `line-height 1.2`, `tracking -0.02em`): titulares de card, tiers de pricing, headings de FAQ. `<h3>` y `<h4>`.
- **Body Lg** (`400`, `clamp(1.0625rem, 0.4vw + 1rem, 1.1875rem)`, `line-height 1.55`): subhead bajo headlines, párrafos de apertura de sección. Max-width 65ch (recomendado); 75ch (máximo absoluto).
- **Body** (`400`, `1rem`, `line-height 1.55`): copy general, FAQ answers, descripción de tiers. Max-width 65–75ch en cualquier columna de texto.
- **UI** (`500`, `0.875rem`, `tracking 0.01em`): button labels, link UI, navbar items.
- **Label** (`500`, `0.75rem`, `tracking 0.08em`, `uppercase`): eyebrows, badges, metadata. Solo en frases ≤ 4 palabras.

### Named Rules

**The Single Family Rule.** Brand v0.3+v0.4: "hierarchy lives in weight and scale, not typeface variety". El sistema usa solo Inter (Variable + Tight). Cifras y código usan Inter con `tabular-nums`, NO una segunda familia mono. El wireframe v1 de `/consultoria` propuso JetBrains Mono; queda como deuda pendiente a reescribir.

**The Eyebrow Discipline Rule.** Eyebrows tracked uppercase (`text-meta` style: 0.75rem, tracking 0.08em) NO van encima de TODA sección por reflejo. El AI scaffold típico es eyebrow en cada section block. TheoLab los reserva para secciones que abren un bloque temático nuevo (F03 "Cómo trabajamos", F07 "Siguiente paso"). En el resto, el headline va directo. Una eyebrow puntual es voz; eyebrow ritual es gramática AI.

**The Balanced Heading Rule.** `text-wrap: balance` en `h1–h3` para evitar líneas huérfanas. `text-wrap: pretty` en párrafos largos. Headings que overflow su container a 768px o 1024px deben acortar copy, no shrinkear la escala (la viewport es parte del diseño).

## 4. Elevation

El sistema es **flat por defecto y la profundidad vive en hairlines + contraste tonal**. No hay sombras, no hay drop-shadow, no hay backdrop-blur decorativo. El único movimiento de "respuesta física" es `translate-y-[1px]` en `:active` de botones, que comunica el press sin necesidad de sombra.

La elevación visual se construye en tres mecanismos:

1. **Hairlines** (`1px solid var(--color-divider)`, slate al 18% de opacidad). Separan secciones, marcan cards, dividen tier blocks. Son reglas tipográficas, no decoración.
2. **Layered tone** (`alabaster bg` → `paper bg-elevated`). Una card `default` se "eleva" cambiando de `alabaster` a `paper`, no añadiendo sombra. El delta tonal es pequeño y deliberado (~1.5% L en OKLCH).
3. **Tactile press** (`active:translate-y-[1px]`). Único movimiento físico del sistema. Sin scale-down, sin shadow expansion. Honra `prefers-reduced-motion` con instant transition.

### Named Rules

**The No-Shadow Rule.** Box-shadows están prohibidas como recurso de UI. Hay una excepción técnica futura (focus glow custom en inputs si la accesibilidad lo demanda), pero hoy: cero. El sistema visual de TheoLab no carga shadows como sintaxis.

**The Hairline-As-Rule Rule.** Las hairlines son reglas tipográficas, no decoración. Cada hairline tiene un propósito (separar sección, delimitar tier block, marcar divider de footer). Si una hairline está ahí "porque queda bonito", se retira.

## 5. Components

Cinco componentes cargan el sistema. Cada uno honra las Named Rules de las secciones anteriores.

### Buttons

Carácter: declarativo, plano, con tactile press de 1px.

- **Shape:** esquinas rectas (`rounded-none`, `0px`). Sin excepción.
- **Solid (default):** `bg-onyx text-alabaster`, `height 44px (md) / 36px (sm) / 48px (lg)`, `padding-x 20px`. Hover: `bg-burgundy` (DEPRECADO, pendiente migración a `bg-fg/85` o `bg-crimson` según refactor). Active: `translate-y-[1px]`. Focus-visible: `ring-2 ring-crimson ring-offset-2`.
- **Outline:** `border-divider bg-transparent text-fg`. Hover: `border-onyx bg-bg-elevated`. Mismo tactile press y focus que solid.
- **Ghost:** `bg-transparent text-fg`. Hover: `bg-bg-elevated`. Sin border. Para acciones secundarias dentro de cards o navs.
- **Accent (gradient insignia):** `bg: linear-gradient(90deg, crimson, orange, gold) text-onyx font-semibold`. Hover: `brightness-95`. UNA INSTANCIA por surface. Esta es la firma visual; multiplicarla la diluye.

### Cards

Carácter: rectangulares, hairlined, sin shadow nunca.

- **Default:** `border 1px divider`, `bg alabaster`, `text fg`, `padding 24px (md) / 16px (sm) / 32px (lg)`, `rounded-none`. Hover (cuando aplica como link card): `border-onyx` (subtle), transition 300ms ease-brand.
- **Dark:** `border-0`, `bg onyx`, `text alabaster`, mismo padding scale. Para secciones de corte editorial (F03 OfferLadder, F07 CTA Final).
- **Nested cards: prohibidas.** Si necesitas más complejidad, refactoriza la arquitectura, no anides surfaces.
- **Card grids genéricos (icon + título + desc, repetidos x3): prohibidos.** SaaS cliché ya canonizado en PRODUCT.md anti-references.

### Badges

Carácter: tags cortos, label uppercase tracked.

- **Shape:** `rounded-none`, `padding 4px 10px`, `text-label` (0.75rem, tracking 0.08em, uppercase).
- **Neutral (default):** `bg bg-elevated`, `text fg-muted`, `border 1px divider`. Estado metadata, "BORRADOR", "PRIVADO".
- **Accent:** `bg burgundy` (DEPRECADO, pendiente migración), `text alabaster`. Énfasis pequeño.
- **Gold:** `bg gold`, `text onyx`. Sellado, "EDICIÓN FUNDADORA · 10 CUPOS".
- **Outline:** `border 1px fg`, `bg transparent`. Tags neutrales sobre fondos variables.

### Wordmark

Carácter: la firma del sistema. Pascal-case, una sola palabra dividida en dos colores.

- **Estructura:** `"Theo"` en `text-fg` (color current onyx light / alabaster dark) + `"Lab"` con `text-brand-gradient` (gradient insignia crimson → orange → gold pintado sobre texto vía `background-clip: text`).
- **Tipografía:** `font-display` (Inter Tight), `font-weight 700`, `leading-none`. Sin tracking negativo extra a lo que ya carga la display utility por tamaño.
- **Sizes:** `sm` (text-xl), `md` (text-3xl md:text-4xl), `lg` (text-5xl md:text-6xl), `xl` (text-display fluid).
- **Regla:** el Wordmark es la **única instancia legítima de gradient-clip-text** en todo el sistema. PRODUCT.md ya banea gradient text decorativo; el Wordmark es la excepción registrada.

### Section Label

Carácter: pagination editorial, mimics brand v0.3 ("01 · SERVICES").

- **Estructura:** `index` en `text-mono` (Inter + tabular-nums, 0.7rem) + dot `·` + `label` (`text-meta`, uppercase, tracking 0.08em).
- **Color:** `text-fg-muted` (slate).
- **Uso:** encabezado de sección cuando la sección abre un bloque temático nuevo. NO va en cada sección por reflejo (ver The Eyebrow Discipline Rule).

### Wordmark + Section Label son los signature components

Estos dos cargan la identidad editorial del sistema. Si los retiras, TheoLab pierde la mitad de su tell visual.

### Named Rules

**The Single Accent Button Rule.** El Button `accent` (gradient insignia) aparece UNA vez por surface, como la CTA principal del flow. Multiplicarlo lo degrada a wallpaper.

**The Nested Card Prohibition.** Nested cards (card dentro de card dentro de card) están prohibidas. Si la información requiere agrupación interna, usa hairlines verticales o spacing, no surfaces anidadas.

## 6. Do's and Don'ts

### Do:

- **Do** usar `rounded-none` (0px) como default en cards, botones, badges. Chip puntuales pueden ir a 2px (`rounded-xs`), nunca más.
- **Do** separar secciones con hairlines `1px solid var(--color-divider)` (slate al 18% opacidad).
- **Do** elevar superficies cambiando de `alabaster` (`#E5E4E2`) a `paper` (`#F2F1EF`). Sin shadow.
- **Do** aplicar `translate-y-[1px]` en `:active` de botones como única respuesta tactile.
- **Do** usar el gradient insignia (`crimson #FF4500 → orange #FF8A00 → gold #FFD700`) en UNA instancia por surface: typically el Wordmark o el Button accent principal.
- **Do** mantener Inter como única familia tipográfica. Cifras y código usan `font-variant-numeric: tabular-nums`, no JetBrains Mono ni otra mono.
- **Do** honrar `prefers-reduced-motion: reduce` con crossfade o instant transition en TODA animación. No negociable dado el commitment con motion alto (Apple iPhone / Awwwards / Framer).
- **Do** poner focus ring `2px crimson` con offset `2px` en TODO control interactivo. `globals.css :focus-visible` ya lo carga; no lo retires por surface.
- **Do** validar contraste body text ≥ 4.5:1 y large text ≥ 3:1. Lecciones de adversarial review PR4: `alabaster /40, /50, /55` ya identificados como AA fail; mínimo `/75` en texto pequeño sobre `onyx`.

### Don't:

- **Don't** usar SaaS cliché: cards icon+título+desc repetidas x3, hero metric template (cifra gigante + label + stat + gradient accent), numbered eyebrows 01/02/03 en cada sección, gradient text decorativo (excepción única: Wordmark).
- **Don't** caer en magazine warm-cream: body bg cream/sand/paper/parchment con chroma baja warm. El sistema tiene `alabaster #E5E4E2` (claro neutro) y `paper #F2F1EF` (un escalón); ninguno de los dos es magazine-cream y no se debe tintar hacia warm para "calidez". La calidez la carga el Golden Hour fuego (crimson/orange/gold), no el body bg.
- **Don't** glassmorphism, backdrop-blur decorativo, neumorphism, sombras suaves "elegantes". Banido. Vibe 2022.
- **Don't** agency portfolio: gradientes saturados full-page, marquees scrolling con nombres de clientes, swiss-grunge mix, tipografía oversized centered con stock imagery. TheoLab no es agency.
- **Don't** emojis, signos de exclamación, em dashes `—` o `--` en el copy (excepción única: el tagline canónico de PRODUCT.md). Comas, dos puntos, semicolons, períodos, paréntesis bastan.
- **Don't** buzzwords IA: "AI-powered", "transform", "leverage", "seamless", "unlock", "harness AI" (excepción: `harness` como nombre del producto técnico), "world-class", "enterprise-grade", "next-generation", "cutting-edge", "game-changer", "mission-critical", "disruptive", "revolutionary", "synergy".
- **Don't** tiny uppercase tracked eyebrow encima de TODA sección por reflejo. Eyebrows reservadas a secciones que abren un bloque temático nuevo. Una eyebrow puntual es voz; eyebrow ritual es gramática AI.
- **Don't** side-stripe borders: `border-left` o `border-right` > 1px como acento en cards/callouts/list items. Banido. Si necesitas énfasis, usa borders completos, leading numbers, o hairlines superiores.
- **Don't** anidar cards. Nested cards (card dentro de card) están prohibidas. Si la información requiere agrupación interna, usa hairlines o spacing, no surfaces anidadas.
- **Don't** introducir `burgundy #800020` en código nuevo de UI. Está deprecado a fallback de impresión por brand v0.4. El refactor del Button solid (hover) y Badge accent para retirar burgundy del runtime queda pendiente.
- **Don't** inventar middle stops del gradient insignia. El stop legítimo es `orange #FF8A00` al 55%. `globals.css` actualmente tiene un middle stop hardcodeado a `oklch(0.72 0.2 60)` que aproxima orange pero no es canónico; queda como deuda a corregir.
- **Don't** introducir una segunda familia tipográfica para mono o cifras. Inter con `tabular-nums` carga el rol mono. JetBrains Mono propuesto en wireframe v1 NO se canoniza.
- **Don't** dejar que los headings overflow en tablet/mobile. Si la copy revienta el container a 768px o 1024px, acortar copy o reducir el `clamp() max` de la utility; NO shrinkear el container.

---

**Test de auditoría rápido.** Si una nueva sección tiene rounded corners, drop-shadow, eyebrow tracked en su default-state, o un gradient text decorativo distinto del Wordmark, el sistema se está rompiendo. Si tres secciones consecutivas tienen card grids icon+title+desc, el sistema es SaaS cliché y hay que rediseñar.
