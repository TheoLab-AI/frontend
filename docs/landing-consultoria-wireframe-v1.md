# Wireframe estructural `/consultoria` — v1

> **Fuentes:** `landing-consultoria-copy-v1.md` (v1.1) + research conversion patterns B2B alto ticket + Brand System v0.4
> **Status:** BORRADOR v1 · pendiente aprobación de Juan
> **Última actualización:** 2026-06-01

---

## Fundamentos del layout

| Item | Valor |
|---|---|
| Container max-width | `80rem` (1280px) |
| Container padding inline | `clamp(1.25rem, 4vw, 3rem)` |
| Grid implícito | 12 columnas, gutter 24px desktop / 16px mobile |
| Section padding vertical | 96px desktop · 64px mobile (más generoso que el default DS de 48/24 por densidad editorial) |
| Vertical rhythm | eyebrow → 12px → title → 8px → subtitle → 24px → content |
| Border radius | `0px` default · `2px` solo botones y pill chips |
| Hairlines | 1px slate 18% opacity |
| Mobile breakpoint | 768px |
| Desktop breakpoint | 1024px+ |

## Tokens nuevos a añadir

```css
@theme {
    /* falta en globals.css actual */
    --color-orange: #FF8A00;
    
    /* gradient corregido v0.4 (en globals.css está inventado un middle stop) */
    --gradient-theolab: linear-gradient(90deg,
        #FF4500 0%,
        #FF8A00 55%,
        #FFD700 100%
    );
    
    /* mono real para cifras (hoy usa ui-monospace fallback) */
    --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
```

Cargar `JetBrains_Mono` via `next/font/google` en `layout.tsx`.

## Reglas de motion (research-aligned)

- Section entrance: stagger 80ms entre hijos, duration 240ms, ease-out, `translateY(8px → 0)` + `opacity(0 → 1)`
- Botón hover: `background-color 160ms linear`. Sin scale, sin shadow dinámica.
- Link hover: `opacity 0.85`. Sin color shift.
- Press: `opacity 0.7`. Sin scale-down.
- `prefers-reduced-motion: reduce` → todas las transiciones a 0ms, sin translateY
- View Transitions API entre rutas: 180ms cross-fade

---

## Frame 01 · Hero

**Función conversion:** Hook + promesa + CTA visible sin scroll. Tipográfico puro (research §2: Sequoia Arc / Linear pattern).

**Layout:**
- Section full-bleed
- Container brand, padding-top 120px desktop / 80px mobile, padding-bottom 96px
- Background: `--color-bg` (alabaster light mode / onyx dark mode)
- Sin imagen. Sin AI generative. Sin stock.

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  CONSULTORÍA DE IA · FIRMAS LEGALES COLOMBIA              │  ← eyebrow JetBrains Mono 12px tracking 0.22em
│                                                             │
│  Usted sabe el qué.                                         │  ← headline Inter Tight 700, tracking -3%,
│  Nosotros traemos el cómo.                                  │     clamp(2.5rem, 6vw, 5rem), line-height 0.95
│                                                             │
│  Consultoría de IA específica para firmas legales           │  ← subhead Inter 400, body-lg,
│  colombianas. Analizamos su firma a fondo, identificamos    │     max-width 580px,
│  dónde la IA puede recuperar horas y bajar riesgo, y le     │     color slate muted
│  entregamos el plan ejecutable. Con cifras antes de         │
│  adjetivos.                                                 │
│                                                             │
│  El plan antes de la herramienta.                           │  ← promesa L1: Inter Tight 600 tracking -2%,
│  DIAGNÓSTICO MEDIBLE · 1 A 3 SEMANAS                        │     clamp(1.5rem, 3vw, 2.25rem)
│                                                             │  ← promesa L2: JetBrains Mono 14px tracking 0.05em,
│                                                             │     color burgundy
│                                                             │
│  [ Agendar reunión de introducción ]   Ver cómo ↓           │
│   ↑ button solid burgundy             ↑ link slate underline
└─────────────────────────────────────────────────────────────┘
```

**Mobile (<768px):**
- Headline puede ocupar 2 líneas o 3
- Subhead max-width 100%
- Promesa L1+L2 más juntas
- CTA primario full-width, secundario debajo (no al lado)

**Estados:**
- Botón "Agendar reunión": hover bg `#660019` (burgundy 80%), press opacity 0.7
- Link "Ver cómo ↓": hover opacity 0.85
- Foco-visible en ambos: outline 2px crimson, offset 2px

**Animación al cargar:**
- 5 hijos del hero: eyebrow → headline → subhead → promesa block → CTA block
- Stagger 80ms, cada uno 240ms ease-out con `translateY(8px → 0)`
- Total ≈ 700ms

**Decisiones de research aplicadas:**
- Hero tipográfico puro (§2): cero imagen, evita el riesgo de AI generative + cumple v0.4
- Un solo CTA primario + link secundario (§2): "Agendar reunión" único botón
- Eyebrow JetBrains Mono como ancla visual y tonal (§5: eyebrows como señales de navegación)

---

## Frame 02 · El Espejo (3 síntomas)

**Función conversion:** Validar que entendemos el mundo del socio antes de proponer. Research §1: bloque problema precede solución.

**Layout:**
- Background: white sobre alabaster (`--color-bg-elevated`)
- Border-top hairline (separación del hero)
- Section padding 96/64

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  EL PROBLEMA QUE YA CONOCE                                  │  ← eyebrow
│                                                             │
│  Tres síntomas que no son del mercado.                      │  ← title Inter 600, headline scale, tracking -2%
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 01          │  │ 02          │  │ 03          │         │  ← número eyebrow mono crimson
│  │ Horas       │  │ El junior   │  │ La pro-     │         │  ← title de card Inter 600, title scale
│  │ perdidas    │  │ que usa     │  │ puesta      │         │
│  │ en          │  │ ChatGPT     │  │ perdida     │         │
│  │ producción  │  │             │  │             │         │
│  │             │  │             │  │             │         │
│  │ [body]      │  │ [body]      │  │ [body]      │         │  ← body Inter 400 leading-relaxed
│  │             │  │             │  │             │         │
│  │ ───         │  │ ───         │  │ ───         │         │  ← hairline 6px crimson (proof line)
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  La pregunta correcta no es qué herramienta usar — es qué   │  ← line de cierre Inter 500 italic,
│  cambia en su firma con criterio.                           │     centrada, max-width 640px, color slate
└─────────────────────────────────────────────────────────────┘
```

**Cards spec:**
- Grid 3 columnas desktop, 1 columna mobile
- Background: `--color-bg` (alabaster) sobre `bg-elevated` parent → ligera elevación visual
- Border: 1px slate 18% opacity en los 4 lados
- Padding: 28px desktop / 20px mobile
- Border radius: 0px
- Sin shadow
- min-height 280px desktop para uniformidad
- Hairline crimson 6px en bottom: separa card del siguiente bloque, recuerda al pattern del componente `ServiceCard` existente

**Animación viewport entry:**
- `whileInView` con `amount: 0.3` (entra cuando 30% de la sección está visible)
- Stagger 80ms entre las 3 cards
- Cada card: `translateY(12px → 0)` + `opacity(0 → 1)` en 240ms ease-out

**Decisiones de research aplicadas:**
- Card grid horizontal (§5: "es el único uso justificado de cards horizontales")
- Stagger 80ms entre cards (§6: "única animación de scroll con valor narrativo")
- Border radius 0 (§Brand v0.4: "TheoLab is a sharp brand")

---

## Frame 03 · Lo que hacemos · El embudo

**Función conversion:** Explicar el método con honestidad de pasos. Embudo de 3 peldaños. Pricing visible en Peldaño 02 con ancla fundadora.

**Layout:**
- Background: `--color-onyx` (invierte mode) — corte editorial fuerte
- Colors invierten: alabaster sobre onyx, crimson/gold como acentos
- Section padding 96/64

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  (onyx background, alabaster text)                          │
│                                                             │
│  CÓMO TRABAJAMOS                                            │  ← eyebrow gold/60
│                                                             │
│  Tres peldaños. Cada uno responde una pregunta distinta.    │  ← title alabaster
│                                                             │
│  TheoLab no vende una herramienta de IA. Vende criterio...  │  ← sub-bloque body, max-width 680px
│                                                             │
│  ┌──────────────┐  ┌──────────────────────────┐  ┌────────┐│
│  │ PELDAÑO 01   │  │ PELDAÑO 02               │  │ P 03   ││
│  │              │  │                          │  │        ││
│  │ Reunión      │  │ Consultoría              │  │ Implem ││
│  │ de intro     │  │                          │  │        ││
│  │              │  │ ─────────                │  │        ││
│  │ GRATIS·20MIN │  │ INICIAL                  │  │ POR    ││
│  │              │  │ 2h + Diagn 1 semana      │  │ DEFINIR││
│  │ [body 3 ln]  │  │                          │  │        ││
│  │              │  │ $500.000  $200.000       │  │ Plan 6 ││
│  │ > Si no en-  │  │ regular   fundador (10)  │  │ Plan 12││
│  │ cajamos...   │  │                          │  │        ││
│  │              │  │ ─────────                │  │        ││
│  │              │  │ COMPLETA                 │  │        ││
│  │              │  │ Inicial + 4 sesiones·3sem│  │        ││
│  │              │  │                          │  │        ││
│  │              │  │ $1.500.000  $1.200.000   │  │        ││
│  │              │  │ regular     fundador     │  │        ││
│  │              │  │                          │  │        ││
│  │              │  │ Nota Edición Fundadora.. │  │        ││
│  └──────────────┘  └──────────────────────────┘  └────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Cards spec (asimétricas):**
- Grid 12-col: Peldaño 01 = 3 cols, Peldaño 02 = 6 cols (doble ancho — pricing necesita aire), Peldaño 03 = 3 cols
- Mobile: stack vertical, full width cada uno
- Background: `--color-bg-elevated` sobre onyx (un negro ligeramente menos profundo, e.g. `#131313`)
- Border: 1px slate 18% — visible sobre onyx
- Padding: 32px desktop / 24px mobile
- Pricing line: JetBrains Mono `clamp(1.5rem, 2.5vw, 2rem)`, dos cifras lado a lado: regular tachada slate, fundador gold
- Nota "Edición Fundadora" en small mono, max-width 280px

**Estados pricing:**
- Sin hover en cifras (no clickables)
- Hover en card completa: border-color burgundy (subtle), 160ms

**Animación viewport entry:**
- Stagger 120ms entre las 3 cards (más generoso porque card 02 es información-densa)
- Cada una 280ms ease-out con `translateY(12px → 0)`

**Decisiones de research aplicadas:**
- Pricing visible con ancla regular/fundador (§4: "patrón ancla + edición fundadora")
- Asimetría 3-6-3 para dar peso visual al peldaño que vendemos (§1: "psicología del scroll")
- Nota honesta sobre fundador (§4: "no es promoción, es precio de ser primeros")

---

## Frame 04 · El Diagnóstico · Activo entregable

**Función conversion:** Hacer tangible el output. Research §3: "el Diagnóstico desmenuzado es la única social proof disponible hoy".

**Layout:**
- Background: `--color-bg` (alabaster)
- Section padding 96/64

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  LO QUE SE LLEVA                                            │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ "El Diagnóstico"│  │ Qué incluye:                    │  │
│  │ no es un PDF.   │  │                                 │  │
│  │ Es un activo.   │  │  ─  Análisis documentado de     │  │
│  │                 │  │     procesos, tipos de matter,  │  │
│  │ (title display) │  │     flujos de información       │  │
│  │                 │  │                                 │  │
│  │                 │  │  ─  Mapa de oportunidades       │  │
│  │                 │  │     priorizadas con estimación  │  │
│  │                 │  │     de horas recuperadas        │  │
│  │                 │  │                                 │  │
│  │                 │  │  ─  Riesgos identificados:      │  │
│  │                 │  │     secreto profesional,        │  │
│  │                 │  │     dependencia de personas...  │  │
│  │                 │  │                                 │  │
│  │                 │  │  ─  Configuración de agentes    │  │
│  │                 │  │     (si entra a Implementación) │  │
│  │                 │  │                                 │  │
│  │                 │  │  ─  Cifras reproducibles del    │  │
│  │                 │  │     estado inicial              │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│                                                             │
│  > El Diagnóstico es suyo desde el día uno. El motor que    │
│  > lo opera, no — eso es licencia nuestra...                │  ← quote, italic, slate, left border crimson 2px
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Layout grid:**
- 2 cols desktop (5+7 cols del 12-grid)
- 1 col mobile (title arriba, lista debajo)
- Bullets con "─" em-dash en lugar de "•" para coherencia con DS v0.4 (em-dash heavy, sin punto medio)
- Padding interno: ambas columnas 0px lateral (alineadas al grid)

**Animación:**
- Title aparece primero, lista aparece con stagger 60ms por item

**Decisiones de research aplicadas:**
- Especificidad del entregable absorbe el riesgo de pricing barato (§4: "si $200k suena barato, especificidad debe absorber")

---

## Frame 05 · Por qué TheoLab · Diferenciadores

**Función conversion:** Tres argumentos cerrados. Research §3 dice usar especificidad como social proof.

**Layout:**
- Background: alabaster
- 3 bloques verticales en columna (NO horizontal — más legible, no cards)
- Cada bloque separado por hairline

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  DIFERENCIADORES                                            │
│                                                             │
│  Tres cosas. En este orden.                                 │
│                                                             │
│  01 ──── Vertical legal específica                          │  ← número crimson + em-dash + título Inter 600
│         Hablamos el lenguaje del socio fundador...          │
│         (body Inter 400, max-width 720px, left padding)     │
│                                                             │
│  ─────────────────────────────────  hairline                │
│                                                             │
│  02 ──── Su firma es dueña de lo suyo                       │
│         Su entorno. Sus datos. Su configuración...          │
│                                                             │
│  ─────────────────────────────────                          │
│                                                             │
│  03 ──── ROI medido, no prometido                           │
│         La Consultoría estima horas a recuperar con cifras │
│         sobre su firma, no genéricas. La Implementación     │
│         entrega esas horas medidas en producción...         │
│                                                             │
│  No prometemos transformación. La Consultoría entrega       │  ← línea de cierre Inter 500, italic,
│  criterio medible. Las horas las entrega la Implementación, │     centrada, max-width 720px, color slate
│  cuando los agentes corren en producción.                   │
└─────────────────────────────────────────────────────────────┘
```

**Estilo de bloques:**
- Número Inter Tight 600, tracking -1%, tamaño 1.5rem, color crimson
- Em-dash "────" entre número y título (visual rhythm)
- Padding-left del body alineado al em-dash final del número

**Decisiones de research aplicadas:**
- Sin cards horizontales (research §5: "uso justificado de cards solo en Frame 02")
- Lista vertical con hairlines: patrón editorial FT weekend

---

## Frame 06 · Cómo medimos (Evidencia traducida) — OPCIONAL

**Función conversion:** Social proof técnica sin nombrar harness (reconciliación D-2 + research §3).

**Layout:**
- Background: `--color-onyx`
- Padding 80px desktop / 56px mobile
- 3 métricas grandes lado a lado, mono JetBrains

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  (onyx background)                                          │
│                                                             │
│  CÓMO MEDIMOS                                               │
│                                                             │
│  Construimos con métricas a la vista — no con promesas.     │  ← title alabaster
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                │
│  │           │  │           │  │           │                │
│  │  97.5%    │  │  67.5%    │  │  9.1%     │                │  ← cifras JetBrains Mono ultra-grande
│  │           │  │           │  │           │                │     gradient text crimson→orange→gold
│  │  Tasa de  │  │  Criterios│  │  Falsos   │                │  ← label mono small alabaster/60
│  │ valida-   │  │ completos │  │ positivos │                │
│  │ ción      │  │ cumplidos │  │           │                │
│  └───────────┘  └───────────┘  └───────────┘                │
│                                                             │
│  Métricas tomadas del run de validación oficial del         │  ← cita pequeña Inter 400, mono opcional
│  motor que opera todas nuestras implementaciones.           │     NO se nombra "harness"
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**DECISIÓN PENDIENTE:** ¿Incluir esta sección o no?

**Pro:** research dice que es la única social proof verificable disponible hoy. El cliente legal senior responde bien a métricas concretas.

**Contra:** D-2 dice "harness invisible como pitch al socio". Aunque no lo nombre, mostrar métricas técnicas puede leer "esto no me incumbe a mí, dueño de firma legal" — el socio no le importa cobertura técnica, le importa horas.

**Recomendación:** **Excluir en v1**. La especificidad del Diagnóstico (Frame 04) + el bloque ROI medido (Frame 05) ya cubren credibilidad. Si después de outreach se siente faltante, se añade.

**Marcador en el wireframe:** Frame 06 queda como opt-in. La numeración baja para los siguientes.

---

## Frame 06 (real) · Para quién

**Función conversion:** Filtro explícito. Honestidad sobre fit reduce reuniones perdidas.

**Layout:**
- Background: alabaster
- 2 columnas paralelas: sí / no

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  A QUIÉN SERVIMOS                                           │
│                                                             │
│  Firmas legales colombianas, 5 a 50 abogados, con           │  ← title
│  práctica activa.                                           │
│                                                             │
│  [sub-bloque body, max-width 720px]                         │
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │ ATENDEMOS FIRMAS QUE     │  │ NO ATENDEMOS (todavía)   ││  ← labels JetBrains Mono ALL CAPS
│  │                          │  │                          ││     left col: crimson
│  │  ─  Operan en Colombia,  │  │  ─  Firmas contables —   ││     right col: slate
│  │     con socio fundador.. │  │     pronto, no hoy       ││
│  │                          │  │                          ││
│  │  ─  Entre 5 y 50 abog... │  │  ─  Agencias o marketing ││
│  │                          │  │     fuera de foco        ││
│  │  ─  Sienten alguno de    │  │                          ││
│  │     los tres síntomas... │  │  ─  Firmas con equipo    ││
│  │                          │  │     técnico interno...   ││
│  │  ─  Buscan implementar   │  │                          ││
│  │     IA con criterio      │  │                          ││
│  └──────────────────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Decisiones de research aplicadas:**
- Filtro explícito reduce dropouts (§5)
- Patrón Wilson Sonsini: "industrias servidas" como primera señal (§7)

---

## Frame 07 · CTA final · Siguiente paso

**Función conversion:** Friction cero. WhatsApp + correo simétricos.

**Layout:**
- Background: `--color-onyx`
- Section padding 96/64
- 2 columnas para CTAs en desktop, stack vertical en mobile

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  (onyx background)                                          │
│                                                             │
│  SIGUIENTE PASO                                             │
│                                                             │
│  Veinte minutos. Sin compromiso. En su agenda.              │  ← title alabaster headline
│                                                             │
│  La reunión de introducción es gratis y dura 20 minutos.    │
│  Conversamos, le contamos cómo trabajamos, y usted decide.  │  ← body max-width 720px
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │                          │  │                          ││
│  │  POR WHATSAPP            │  │  POR CORREO              ││  ← labels mono ALL CAPS small gold
│  │                          │  │                          ││
│  │  +57 XXX XXX XXXX        │  │  admin@theolab.tech      ││  ← display Inter Tight 700 alabaster
│  │                          │  │                          ││     cada bloque clickable (link wrap)
│  │  Respuesta el mismo día. │  │  Respuesta < 24 horas.   ││  ← caption slate/70
│  │                          │  │                          ││
│  │  →                       │  │  →                       ││  ← arrow indicator hover-visible
│  └──────────────────────────┘  └──────────────────────────┘│
│                                                             │
│  THEOLAB · BOGOTÁ · COLOMBIA                                │  ← post-CTA mono small alabaster/40
│  admin@theolab.tech                                         │
└─────────────────────────────────────────────────────────────┘
```

**CTA Cards spec:**
- Cada card es `<a href>` clickable completa
- Background: transparente, border 1px slate 22% opacity
- Padding: 32px desktop / 24px mobile
- Hover: border-color burgundy 160ms, arrow opacity 1
- Default: arrow opacity 0.4

**Sticky header opcional (decisión pendiente):**
- Si se incluye: altura 48px, fondo onyx sólido, contiene "TheoLab" wordmark + botón "Agendar reunión" → activa en scroll > 600px
- Si no se incluye: el CTA del hero + el CTA final son suficientes

**Recomendación:** Excluir sticky en v1. Research dice que el sticky funciona en alto ticket si es ultra-minimal sin movimiento. Para v1 lanzamos sin él y medimos en outreach si se siente faltante.

---

## Frame 08 · FAQ

**Función conversion:** Resolver objeciones antes de que maten la reunión.

**Layout:**
- Background: alabaster
- Lista vertical, 1 columna, max-width 720px (reading-comfort cap)
- TODAS las preguntas abiertas (no acordeón) — landing seria, no SaaS playground

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  PREGUNTAS QUE NOS HACEN                                    │
│                                                             │
│  Q1 ──── ¿Cuánto tarda ver resultados?                      │  ← Q en Inter 600 title scale
│         [answer body Inter 400, leading-relaxed]            │
│                                                             │
│  ─────────────────────────────────  hairline                │
│                                                             │
│  Q2 ──── ¿Mis datos quedan en infraestructura de TheoLab?   │
│         [answer]                                            │
│                                                             │
│  ─── ... (Q3, Q4, Q5)                                       │
└─────────────────────────────────────────────────────────────┘
```

**Decisiones de research aplicadas:**
- No acordeón (§5: "acordeón sugiere 'no es importante leer'")
- 5 preguntas máximo: tiempo, datos, salida del contrato, fundador, idioma

---

## Frame 09 · Footer

**Función:** Cierre institucional + legal mínimo.

**Layout:**
- Background: `--color-onyx`
- Padding 64px desktop / 48px mobile
- 1 columna centrada

**Composición desktop:**

```
┌─────────────────────────────────────────────────────────────┐
│  (onyx background)                                          │
│                                                             │
│  THEOLAB                                                    │  ← wordmark grande
│                                                             │
│  Bogotá · Colombia · 2026                                   │  ← mono small alabaster/60
│  admin@theolab.tech                                         │
│                                                             │
│  ─────────────────────────────────  hairline                │
│                                                             │
│  TheoLab opera bajo políticas de habeas data (Ley 1581)     │  ← caption Inter 400 alabaster/50
│  y respeto al secreto profesional.                          │
│                                                             │
│  © 2026 TheoLab AI. Todos los derechos reservados.          │  ← mono extra-small alabaster/40
│  theolab.tech                                                │
└─────────────────────────────────────────────────────────────┘
```

**Sin links** — landing legal v1 no requiere nav. Si se agrega home institucional, ahí se conectan.

---

## Componentes nuevos a crear

| # | Componente | Path | Reusa |
|---|---|---|---|
| 1 | `ConsultoriaHero` | `components/sections/consultoria/Hero.tsx` | `Button`, `Wordmark` existentes |
| 2 | `SintomaGrid` + `SintomaCard` | `consultoria/SintomaGrid.tsx` | — |
| 3 | `EmbudoPeldaños` + `Peldaño` + `PricingBlock` | `consultoria/Embudo.tsx` | — |
| 4 | `DiagnosticoActivo` | `consultoria/DiagnosticoActivo.tsx` | — |
| 5 | `DiferenciadoresLista` | `consultoria/Diferenciadores.tsx` | — |
| 6 | `ParaQuienSplit` | `consultoria/ParaQuien.tsx` | — |
| 7 | `CtaFinal` | `consultoria/CtaFinal.tsx` | — |
| 8 | `Faq` | `consultoria/Faq.tsx` | — |
| 9 | `FooterLegal` | `components/sections/FooterLegal.tsx` | — |
| 10 | `EyebrowLabel` (utility) | `components/ui/EyebrowLabel.tsx` | reemplaza usos sueltos |

## Componentes existentes a auditar

| Componente | Estado |
|---|---|
| `Button` | Probablemente OK. Verificar variant solid burgundy y outline. |
| `Wordmark` | OK |
| `SectionLabel` | Reusar para eyebrows |
| `Badge` | No usado en `/consultoria` v1 |

---

## Decisiones del wireframe que necesitan tu aprobación

| # | Decisión | Alternativa |
|---|---|---|
| 1 | **NO incluir sección de Evidencia/Métricas** (Frame 06 marcado opt-in) | Incluirla con cifras traducidas sin nombrar harness |
| 2 | **NO sticky header en v1** | Incluir sticky minimal con CTA Agendar reunión |
| 3 | **Em-dash "─" en lugar de bullet "•"** en listas | Bullets tradicionales |
| 4 | **Background alternation: alabaster / white-elevated / onyx / alabaster / onyx / alabaster / onyx / alabaster / onyx** | Patrón distinto |
| 5 | **Asimetría 3-6-3 en peldaños del embudo** (peldaño 02 doble ancho) | Tres iguales 4-4-4 |
| 6 | **FAQ todas abiertas (no acordeón)** | Acordeón collapsible |
| 7 | **Section padding 96/64** (más generoso que DS default 48/24) | Default 48/24 |
| 8 | **JetBrains Mono cargada via next/font** | Mantener ui-monospace fallback |

---

## Próximos pasos

1. **Juan revisa wireframe** y aprueba/itera decisiones 1-8
2. **Si aprueba:** Alexis (yo) implementa componentes en `components/sections/consultoria/`
3. **Si pide cambios:** itero wireframe v1 → v2
4. **Post-implementación:** Playwright snapshot + Lighthouse + revisión cross-device

## Procedencia

- **Copy v1.1:** `landing-consultoria-copy-v1.md`
- **Research conversion:** agente background completed 2026-06-01, 7 secciones + 5 patrones aplicables
- **Brand v0.4:** `C:\TheoLab\docs\brand\design-system\README.md`
- **Plan operativo:** `C:\TheoLab\docs\strategy\plan-operativo.md` tareas A-2/A-3/A-4
- **Modelo de negocio:** `C:\TheoLab\docs\strategy\modelo-negocio.md` §4 oferta + §5 entrega
