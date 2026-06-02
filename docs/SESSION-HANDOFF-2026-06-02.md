# Session Handoff — Rediseño /diagnostico v3

> **Sesion 2026-06-01 → 2026-06-02 (madrugada).** Continuar en sesion siguiente con este doc como fuente de verdad.
> **Owner:** Juan. **Asistente:** Claude Code.

---

## Resumen ejecutivo en 60 segundos

Estamos reescribiendo la pagina `/diagnostico` desde la version vieja (quiz-funnel con bento + mock PDF gigante) a la version v3 (editorial 9-secciones con Hero Splite 3D + embudo con pricing + sticky scroll de metodologia). Fuente de verdad del diseno: `C:/Users/juanj/Downloads/TheoLab Design System (1)/design_handoff_consultoria_hero_3d/`.

**Estado**: 3 de 6 PRs aplicados localmente. Ninguno commited a git todavia. Dev server corriendo en `localhost:3000`. Faltan PRs 3, 4, 5 y ajustes finales del Hero.

---

## Lo que ya se aplico (PRs locales, sin commit)

### PR1 — Setup deps + primitivas editoriales (COMPLETADO)
- `pnpm add @splinetool/runtime @splinetool/react-spline`
- Creados en `components/ui/`:
  - `Card.tsx` (variants default/dark, padding none/sm/md/lg, rounded-none forzado)
  - `Spotlight.tsx` (fill default `var(--color-gold)`)
  - `Splite.tsx` (export `SpliteScene`, Suspense + lazy, prop `scene`)
  - `TextShimmer.tsx` (variants brand/crimson, asChild via Radix Slot)
- Agregadas a `app/globals.css`:
  - `@utility animate-spotlight` + `@keyframes spotlight`
  - `@utility text-shimmer-brand` + `@utility text-shimmer-crimson` + `@keyframes shimmer-slide`

### PR2 — Header global Navbar (COMPLETADO, aprobado visualmente con fixes)
- Primitiva `components/ui/Navbar.tsx` composable: Root, Brand, Items, Status, CTA, Mobile.
- `components/sections/SiteHeader.tsx` — header global para `/` (tema alabaster, items: Servicios/Evidencia/Filosofia/Diagnostico, CTA GitHub).
- `components/sections/DiagnosticoHeader.tsx` — header para `/diagnostico` (tema onyx, items: Metodologia/El Entregable/Garantias/Test/Preguntas, status widget CUPOS opcional, CTA Agendar Calificacion).
- `app/layout.tsx` modificado para inyectar `SiteHeader` con guard `usePathname()` que retorna null en `/diagnostico` (evita doble nav).
- `app/diagnostico/page.tsx` modificado para reemplazar el header inline con `<DiagnosticoHeader spotsLeft={spotsLeft} />`.

**Fixes pos-revision aplicados:**
- `whitespace-nowrap` en items del Navbar (resolvio "El Entregable" rompiendose en 2 lineas).
- Removido `subLabel="TL // DIAGNOSTICO V2.0"` del Brand de DiagnosticoHeader (decision visual).
- Variant `accent` del Button reescrito para usar gradient Golden Hour (`linear-gradient` crimson + naranja OKLCH + gold) con texto onyx y `font-semibold`.
- Items del Navbar ya no usan tokens semanticos globales `--color-fg` / `--color-fg-muted` (que se invertian bajo `prefers-color-scheme: dark` del OS y dejaban texto blanco invisible sobre header light). Ahora respetan el `theme` del Navbar local: `theme="onyx"` usa alabaster/65, `theme="alabaster"` usa onyx/55.

### PR6 — Hero Splite + TextShimmer refinement (COMPLETADO, pendiente ajustes Spline)
- `components/sections/HeroSplite.tsx` — Card variant=dark, Spotlight gold, veil de legibilidad lg-only, layout grid lg:2cols, typewriter "Usted sabe el que. Nosotros, el como." (delay 520ms, 42ms/char, cursor crimson parpadeante, respeta prefers-reduced-motion). Palabra "como" envuelta en `<TextShimmer variant="crimson">`. Pills toggleables Horas/Riesgo/Propuestas/Otro con check animado spring + banner reactivo "Reconocido. Lo abordamos en el Diagnostico: {lista}".
- `app/diagnostico/page.tsx` — eliminado el bloque hero scrollytelling viejo (lineas 199-330 segun el page.tsx en ese momento), reemplazado por `<HeroSplite />`. Eliminados states `mousePos`/`isHovered`/`heroRef`/`useScroll`/`useTransform` + listeners de mouse globales que solo servian al hero viejo.
- `components/sections/Evidence.tsx` — agregado prop `accent?: boolean` en metricas. La primera ("Coverage") marca `accent=true` y su label se envuelve con `<TextShimmer variant="brand">` (1 shimmer maximo por viewport).

**Fixes pos-revision aplicados:**
- `min-h-[100svh]` cambiado a `min-h-[108svh]` para dar espacio vertical adicional al robot.
- Contenedor del Spline cambio de `inset-y-0 lg:w-[58%] xl:w-[55%]` a `top-[clamp(56px,8vh,96px)] bottom-0 lg:w-[64%] xl:w-[60%]` (mas ancho y con offset top para no chocar contra navbar).

**Scene Spline en uso:**  
`https://prod.spline.design/cNuv3mbYZVR2Citm/scene.splinecode`  
(Hardcodeada en `components/sections/HeroSplite.tsx` linea 22-23. Si llega URL nueva, cambiar solo esa constante.)

---

## Pendientes activos del Hero Splite (Juan los hace en Spline)

| Issue | Fix en Spline | Re-export necesario |
|---|---|---|
| Fondo dividido (linea vertical donde empieza el canvas Spline) | Click area vacia del canvas → panel Scene → BG Color: bajar Alpha/Opacity del color `3A3A3A` de 100% a 0% (o cambiar al ultimo cuadro del color picker con damero transparente) | Si |
| Robot gira a un lado al pasar el mouse (no de frente al cursor) | Probar Direction del Look At en orden: Y → -Y → X → -X. Solo uno mira correctamente al cursor segun la orientacion del GLB importado. Tambien probar Look At sobre el Body Object raiz (`922f8171beff441b`) en vez del mesh hijo si nada funciona | Si |
| Watermark "Made with Spline" en preview publico | Plan Basic Spline $9 USD/mes lo quita. Pagar 1 mes, exportar, cancelar. Para landing premium TheoLab a $1.5M COP la inversion se justifica | Si (re-exportar despues de pagar para que la URL quede sin watermark) |
| Framing del robot (queda alto/cortado abajo) | En Spline: panel Viewport → Personal Camera → Zoom out o ajustar Position Y del modelo. Tambien puede ser util ajustar `Auto Zoom: Yes` para que enmarque automaticamente | Si |

**Flujo recomendado**: aplicar los 4 fixes en una sola sesion de Spline, exportar UNA vez con todo, pasarle la URL nueva a Claude. El cambio en codigo es 1 sola linea (constante `SPLINE_SCENE` en `HeroSplite.tsx`).

---

## Lo que FALTA (PRs 3, 4, 5)

### PR3 — Page shell v3: limpiar obsoletos + secciones estaticas (PENDIENTE)
Reemplazar el page.tsx actual (que aun tiene bento grid, mock PDF gigante, quiz interactivo, pilares de conviccion, FAQ viejo) por la estructura v3:
- F02 El Espejo — 3 sintomas numerados (copy literal del HTML v3)
- F05 Diferenciadores — 3 numerados (Vertical legal / Su firma dueña / ROI medido)
- F06 Para quien — atendemos / no atendemos
- F07 CTA final — WhatsApp + correo (onyx)
- F08 FAQ — 5 Q&A (incluye "Por que precio fundador?")
- F09 Footer
- Mantener HeroSplite intacto (es el F01)
- Dejar F03 (Como trabajamos) y F04 (Diagnostico) como placeholder hasta PRs 4 y 5

**Fuente de verdad copy**: `C:/Users/juanj/Downloads/TheoLab Design System (1)/design_handoff_consultoria_hero_3d/reference-prototype/TheoLab - Consultoria v3.html`

### PR4 — F03 Como trabajamos: embudo 3 peldaños + pricing inline (PENDIENTE)
Embudo con 3 peldaños donde el del medio (Peldaño 02 · Consultoria) es WIDE y muestra los 2 tiers con precios SIMULTANEOS (Regular + Fundador):

```ts
// lib/pricing.ts
export const PRICING_PLANS = [
  {
    id: 'inicial', name: 'Inicial',
    duration: '2 h de sesion + diagnostico',
    timeline: '1 semana',
    prices: { regular: 500_000, founder: 200_000 },
    isFeatured: false,
  },
  {
    id: 'completa', name: 'Completa',
    duration: 'Inicial + 4 sesiones',
    timeline: '3 semanas',
    prices: { regular: 1_500_000, founder: 1_200_000 },
    isFeatured: true,
  },
]
export const FOUNDER_FRAME = 'Los primeros diez clientes acceden a precio fundador. No es promocion: es el precio de ser primeros, y de ayudarnos a calibrar el metodo sobre casos reales.'
export const FOUNDER_SPOTS_TOTAL = 10
```

NO toggle Regular/Fundador — ambos precios visibles a la vez. NO `@number-flow/react`. Features de cada plan: TODO con Juan en proxima sesion.

Peldaños 01 (Reunion intro gratis) y 03 (Implementacion · plan 6/12 meses) sin precios visibles. Inspiracion 21st.dev del eval: tailark `pricing-plans` (border-y editorial "indice de libro") — NO instalarlo, replicar el patron con primitivas TheoLab.

### PR5 — F04 Diagnostico + Sticky Scroll MAPEAR/PRIORIZAR/ENTREGAR (PENDIENTE)
Reemplaza el bento grid actual (el de las 3 cards en paralelo) por un Sticky Scroll Reveal narrativo (estilo aceternity adaptado a tokens TheoLab):
- 3 pasos: MAPEAR / PRIORIZAR / ENTREGAR (los verbos del bento viejo que Juan confirmo conservar)
- Texto editorial a la izquierda que avanza con scroll
- Visual sticky a la derecha que cambia por paso: mock Meet, matriz Horas/Mes vs Complejidad, thumbnail editorial del entregable

Tambien incluye el bloque F04 del HTML v3: titulo "El Diagnostico no es un PDF. Es un activo", lista "que incluye", blockquote.

---

## Decisiones tomadas (no relitigar sin data nueva)

| Decision | Valor | Fuente |
|---|---|---|
| Stack frontend | Next.js 16.2 + React 19 + TS strict + Tailwind v4 CSS-first + Biome + pnpm@11.3.0 + Motion 12 | `frontend/DESIGN-DECISIONS.md` |
| NO shadcn como libreria | Primitivas custom en `components/ui/` con Radix + CVA + tokens TheoLab | DESIGN-DECISIONS.md seccion 4 |
| Pagina target | `/diagnostico` (la URL actual) — NO crear `/consultoria` aparte | Decision Juan sesion 2026-06-01 |
| Hero 3D | Spline (.splinecode embebido via @splinetool/react-spline). NO video. NO Three.js directo todavia (a evaluar en proxima sesion) | README handoff §4 + decision Juan |
| Modelo 3D | GLB generado en 3D AI Studio con PBR. Path: `C:/Users/juanj/Downloads/922f8171beff441b.glb` (57.9 MB sin-PBR descartado, 59.7 MB con PBR vigente) | Decision Juan |
| Watermark Spline | DECISION PENDIENTE — Juan evalua si paga 1 mes Basic ($9 USD) para quitarlo | Apertura |
| Quiz interactivo del page.tsx viejo | DESCARTADO — fuera de v3 | Decision Juan |
| Mock PDF gigante del page.tsx viejo | DESCARTADO — fuera de v3 | Decision Juan |
| Pilares de conviccion del page.tsx viejo (Numbers or it didn't happen / Speak Business Not Code / We Stay) | DIFERIDO — se reconsidera despues de PR3, no es prioridad | Decision Juan |
| Bento 3 cards paralelas (MAPEAR/PRIORIZAR/ENTREGAR) | REEMPLAZADO por Sticky Scroll Reveal narrativo (PR5) | Decision Juan |
| Features de cada plan de Consultoria | TODO — definir con Juan en proxima sesion | Pendiente |
| Idioma | Espanol Colombia (es-CO). Copy literal del HTML v3 cuando aplique. | DESIGN-DECISIONS + handoff |
| Voz | 70% Sage + 30% Magician. Sin emojis, sin exclamaciones, sin buzzwords (AI-powered, disruptive, synergy, unlock, leverage) | WORKSPACE.md + brand v0.3 |
| Convencion commits | conventional commits (docs:/feat:/fix:/chore:/refactor:). NO commits sin aprobacion visual de Juan en localhost. | WORKSPACE.md |

---

## Paths criticos

```
C:/TheoLab/frontend/                                       ← repo destino (Next.js)
  app/diagnostico/page.tsx                                 ← pagina actual (mezcla v3 + obsoletos por PR3)
  app/globals.css                                          ← tokens @theme + utilities custom
  app/layout.tsx                                           ← SiteHeader inyectado aqui
  components/ui/                                           ← Card, Spotlight, Splite, TextShimmer, Navbar, Button, Badge, SectionLabel, Wordmark
  components/sections/                                     ← Hero (home), HeroSplite (/diagnostico), Services, Evidence, Philosophy, Footer, SiteHeader, DiagnosticoHeader
  components/motion/variants.ts                            ← fadeUp, fadeIn, stagger, heroDisplayReveal
  lib/tokens.ts                                            ← brand tokens en TS
  lib/utils.ts                                             ← cn()
  lib/pricing.ts                                           ← PENDIENTE PR4

C:/Users/juanj/Downloads/TheoLab Design System (1)/design_handoff_consultoria_hero_3d/  ← handoff fuente de verdad
  README.md                                                ← guia exhaustiva 13 secciones
  reference-prototype/TheoLab - Consultoria v3.html        ← prototipo HTML + copy literal ES-CO
  reference-prototype/consultoria/*.css *.js               ← estilos del prototipo
  design-tokens/colors_and_type.css                        ← fuente de verdad colores/tipografia
  character-reference/character-poster.png                 ← look del personaje (referencia + fallback futuro)
  character-reference/character.mp4                        ← referencia de movimiento (NO produccion)

C:/Users/juanj/Downloads/922f8171beff441b.glb              ← modelo 3D PBR (59.7 MB) — vigente
C:/Users/juanj/Downloads/caf0054cad8d49e9.glb              ← modelo 3D sin-PBR (descartado, se puede borrar)
```

---

## Dev server (puede estar corriendo o no al reanudar)

```powershell
# Levantar si esta apagado:
Set-Location C:\TheoLab\frontend
npx --yes pnpm@11.3.0 dev
# Abre: http://localhost:3000  (home) y http://localhost:3000/diagnostico (target principal)
```

- `pnpm` NO esta en PATH global. Usar `npx --yes pnpm@11.3.0`. Corepack no habilitado (permisos C:\Program Files).
- Turbopack hot-reload activo.

---

## Tareas para PROXIMA SESION (aparte del rediseno, evaluacion estrategica)

Juan solicito evaluar 3 cosas independientes en otra sesion:

### A. React Three Fiber (R3F) como alternativa a Spline
**Que es R3F:** libreria React para Three.js (renderer 3D WebGL). Permite cargar GLB directamente con `<gltfModel>` y controlar interacciones (mouse follow, animaciones, materiales) 100% en codigo, sin depender de un editor externo ni de URLs de Spline.

**Pros vs Spline:**
- Cero watermark, cero suscripcion ($0)
- Control fino del comportamiento desde codigo (typecheck, motion react, etc.)
- Posicion en source de verdad: el GLB esta en el repo, no en una URL externa
- Bundle puede ser mas chico si solo necesitamos lo que usamos

**Contras vs Spline:**
- Curva de aprendizaje del developer
- Hay que escribir el Mouse Look event manualmente (con `useFrame` + raycaster) — ~30-50 lineas
- Iluminacion, materiales, post-effects: requieren codigo (Spline lo da en UI)

**Que necesitamos evaluar:**
- Costo en horas vs ahorro de $9/mes
- Si vale la pena el control completo o si Spline es "suficiente"
- Demo rapido con el GLB actual (cargarlo en R3F, agregar mouse follow basico, ver si se ve bien)

**Condicion del usuario**: Juan quiere R3F si Claude lo puede integrar bien sin pedirle a Juan que escriba codigo 3D. **Aceptable porque R3F es codigo TS/React puro — Claude lo puede llevar entero**.

### B. Blender + MCP de Blender
**Que es Blender:** editor 3D open source, gratuito, profesional. Permite abrir el GLB, editar materiales, separar el mesh en partes (cabeza vs cuerpo), agregar huesos/rigging, exportar GLB optimizado.

**MCP de Blender:** existe `blender-mcp` (de la comunidad — buscar en mcp-registry oficial o GitHub). Permitiria que Claude controle Blender desde aqui mismo, ejecute operaciones de modeling/rigging via tools.

**Que necesitamos evaluar:**
- Si el MCP de Blender existe y es estable (no abandonware)
- Si Claude puede usarlo para separar el mesh actual en cabeza + cuerpo, exportar GLB optimizado, y devolverlo
- Si vale la pena vs aceptar que rote el cuerpo entero (lo que tenemos hoy con Spline)

**Condicion del usuario**: si funciona, podriamos tener cabeza separada del cuerpo para movimientos mas naturales.

### C. Reutilizar el GLB actual o re-generar
**Pregunta Juan**: si vamos a R3F o Blender, hay que empezar de cero el modelo o se reutiliza el GLB de 59.7 MB con PBR que ya tenemos?

**Respuesta corta**: SE REUTILIZA. El GLB es estandar de la industria 3D. Tanto R3F como Blender lo cargan sin problema. PBR (texturas metalness/roughness/normal) viene embebido y se mantiene.

**Lo que NO se mantiene si cambiamos a R3F/Blender**:
- Los eventos de Spline (Look At, etc.) — se reimplementan en codigo
- La escena Spline (camara, luces) — se reconfigura

**Lo que SI se mantiene**:
- El modelo 3D mismo (geometria + materiales PBR)
- La estetica del robot-abogado

---

## Tareas in-session activas

```
#1 [completed] PR1 — Setup deps + primitivas editoriales UI
#2 [completed] PR2 — Header global Navbar (Resizable + Tubelight hibrido)
#3 [pending]   PR3 — Page shell v3: limpiar obsoletos + secciones estaticas
#4 [pending]   PR4 — F03 Como trabajamos: embudo 3 peldaños + pricing inline
#5 [pending]   PR5 — F04 Diagnostico + Sticky Scroll MAPEAR/PRIORIZAR/ENTREGAR
#6 [completed] PR6 — Hero Splite + TextShimmer + AnimatedNumber refinements
```

Las tasks #3 a #5 son lo unico pendiente para terminar la pagina v3. PR4 esta bloqueado parcialmente por la definicion de features de cada plan. PR3 y PR5 se pueden ejecutar al toque.

---

## Ultimo gesto: que hacer al reanudar

1. Verificar dev server corriendo en `localhost:3000` o levantarlo.
2. Refrescar `/diagnostico` y validar PR1+PR2+PR6 siguen viendose bien.
3. Si Juan completo los fixes Spline y trajo URL nueva, cambiar la constante `SPLINE_SCENE` en `components/sections/HeroSplite.tsx` linea 22-23 y refrescar.
4. Arrancar PR3 (page shell v3) con copy literal del HTML v3. Con flujo "construye → Juan aprueba en localhost → siguiente".
5. Despues PR4 (con features de plans definidos) y PR5.
6. Al finalizar los 3 PRs, commit con mensajes conventional + push, branch `feat/diagnostico-redesign-v3`.

**Memoria global del usuario tambien actualizada** en `C:/Users/juanj/.claude/projects/C--/memory/MEMORY.md` (entry "TheoLab rediseno /diagnostico v3").
