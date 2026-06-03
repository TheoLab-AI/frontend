# Session Handoff — PR3 + migración /diagnostico → /consultoria

> **Sesión 2026-06-02 (continuación de las 3 sesiones previas).**
> Para el agente y el director que continúen en próxima sesión.
> Hermanos de este documento (orden cronológico):
> - `SESSION-HANDOFF-2026-06-02.md` (PR1/PR2/PR6 — Claude #1)
> - `SESSION-HANDOFF-2026-06-02-R3F.md` (R3F POC + GLB opt — Claude #2)
> - `SESSION-HANDOFF-2026-06-02-PR3-consultoria-migration.md` — este doc (PR3 + git workflow + migración — Claude #3)

---

## Resumen en 60 segundos

Sesión #3 cubrió:

1. **PR3 (page shell v3)** — construidas 6 secciones nuevas de la landing (Espejo / Diferenciadores / Para Quién / CTA / FAQ / Footer) con copy literal del prototipo HTML v3. `page.tsx` reescrito de 777 → 155 líneas.
2. **Pulido del Hero Splite (PR6)** — mouse-follow del robot vía React (bypasea el Mouse Look nativo de Spline que solo cubría el rect del canvas), pitch corregido, media-query SSR-safe para evitar doble descarga del `.splinecode`.
3. **Descubrimiento de trabajo paralelo de Alexis** — `origin/main` tenía 26 commits de @AlexisJ16 (hace ~28 h) con la arquitectura "front de dos niveles": `/` institucional + `/consultoria` landing comercial. Los handoffs de Claude #1 y #2 no lo sabían.
4. **Decisión Juan: URL final = `/consultoria`** con contenido nuestro. Sobrescribir la landing de Alexis. Home institucional intacto salvo el header.
5. **Migración completa** — `/diagnostico` → `/consultoria`. Componentes nuestros renombrados a `ConsultoriaHeader`/`ConsultoriaFooter`. Componentes legacy de Alexis borrados (excepto `OfferLadder` que sigue usándose en el home).
6. **`lib/oferta.ts` extendido** con tier fundador (`founderPrice?`, `founderNote?`). Fuente única, JSON-LD emite ambos Offers.
7. **9 commits en `feat/consultoria-redesign-v3`** + **PR #2 abierto** → https://github.com/TheoLab-AI/frontend/pull/2

Estado al final: branch en GitHub, PR esperando review + Vercel preview deployment.

---

## Estructura final de rutas (validada con `pnpm build`)

| Ruta | Qué hay | Quién la hizo |
|---|---|---|
| `/` | Home institucional (Hero, Services, OfferLadder, PropiedadCliente, Evidence, Philosophy, HomeCTA, Footer) | Alexis. Único cambio nuestro: `SiteHeader` sustituye `InstitutionalNav` en el layout del route group |
| `/consultoria` | Landing v3 — Hero Splite + 6 secciones editoriales + 2 placeholders | Nuestro (PR3) |
| `/consultoria/r3f-poc` | POC R3F del robot (aislado, no producción) | Claude #2 |
| `/robots.txt`, `/sitemap.xml`, `/_not-found` | Generadas | Next |

`/diagnostico` ya no existe — el `app/diagnostico/` se eliminó en la migración.

---

## Decisiones tomadas en esta sesión (NO relitigar)

| Decisión | Valor | Razón / contexto |
|---|---|---|
| URL final de la landing | `/consultoria` (sobrescribiendo lo de Alexis) | Juan: "lo definimos como /consultoria … todo lo que hemos definido es lo que va a quedar" |
| Home institucional | Intacto, salvo header | Juan: "Mantenemos por ahora pero aplica algunos cambios como del header que hicimos" → `SiteHeader` reemplaza `InstitutionalNav` |
| Embudo | Extender `lib/oferta.ts` con split fundador | Juan: "Extendemos con split fundador". Inicial fundador $200K, Completa fundador $1.2M |
| Coordinación con Alexis | Avanzamos sin coordinar (le avisamos en el PR) | Juan: "No, avancemos y simplemente asegurémonos de hacer una buena y óptima migración" |
| GLB del robot en repo | Sí (14 MB optimizado) — `public/models/robot.glb` | Juan: "En el repo (Recommended)" |
| PR creation | `gh` CLI autenticado | Juan: "Opción B" |
| Resolución conflict `app/layout.tsx` | Tomada versión Alexis (root layout limpio) | El SiteHeader se aplica en el route group institucional, no en root |
| `OfferLadder.tsx` de Alexis | Preservado intacto | Lo consume el home institucional con precios regulares; PR4 reescribirá uno nuevo para `/consultoria` con split fundador |
| Test `$200.000` prohibido en `/consultoria` | Removido del FORBIDDEN_IN_CONSULTORIA | La edición fundadora es pública hasta llenar 10 cupos |

---

## Workflow git ejecutado (referencia para próxima vez)

**Bloque 1 — congelar trabajo nuestro en commits** (sobre `c6c1494`, main local atrasado):

```
96587fd  feat(deps): add Spline runtime + R3F stack
10cc8ef  feat(ui): primitivas editoriales — Card, Spotlight, Splite, TextShimmer, Navbar
5ebe4b3  feat(diagnostico): hero Splite + DiagnosticoHeader + SiteHeader injection
911438b  feat(diagnostico): secciones v3 + cleanup page.tsx
d7e4685  chore(assets): add optimized robot GLB (14 MB)
0f29bad  feat(diagnostico): add R3F POC at /diagnostico/r3f-poc
ca3e08c  docs: session handoffs 2026-06-02 (rediseño v3 + R3F POC)
```

**Bloque 2 — merge `origin/main`** (26 commits Alexis):
- Conflict en `app/layout.tsx` (tomar versión Alexis)
- Conflict auto-mergeado en `components/sections/Evidence.tsx` (preserva `accent` prop + actualiza sha del harness)
- Commit `fb7a7d2`

**Bloque 3 — migración a `/consultoria`**:
- Borrar componentes Alexis sobreescritos
- Renombrar `DiagnosticoHeader/Footer` → `ConsultoriaHeader/Footer` (mover a `components/consultoria/`)
- Sobrescribir `app/consultoria/page.tsx` con v3
- Actualizar `app/consultoria/layout.tsx` (pasar `spotsLeft={3}`)
- Aplicar `SiteHeader` en `app/(institucional)/layout.tsx`
- Extender `lib/oferta.ts` + actualizar `lib/seo.ts ofertaJsonLd`
- Refactor `CTAFinal.tsx` para consumir `lib/contact.ts`
- Borrar `app/diagnostico/`, mover r3f-poc a `app/consultoria/r3f-poc/`
- Adaptar tests (`consultoria.spec.ts`, `coherence.spec.ts`, `oferta.test.ts`)
- Commit `ab4f6c0`

**Bloque 4 — push + PR**:
- `git push -u origin feat/consultoria-redesign-v3`
- `gh pr create --base main --head feat/consultoria-redesign-v3 ...`
- PR #2: https://github.com/TheoLab-AI/frontend/pull/2

**Tooling necesario para correr esto** (ya instalado en máquina de Juan):
- `pnpm` global: `npm install -g pnpm` (versión 11.3.0) — necesario para husky pre-commit
- `gh` CLI: `winget install --id GitHub.cli` (versión 2.93.0) en `C:\Program Files\GitHub CLI\gh.exe`
- Para `gh` en bash MinGW: `export PATH="/c/Program Files/GitHub CLI:$PATH"` o invocar con path absoluto

---

## Lo que queda pendiente (orden recomendado)

### Inmediato — esperar review/merge del PR #2
- Vercel preview se dispara automáticamente al push. Revisar las 3 rutas (`/`, `/consultoria`, `/consultoria/r3f-poc`).
- Si OK → merge → Vercel despliega a producción.
- Si Alexis pide cambios → ajustar en la branch antes del merge.

### PR4 — F03 Embudo + pricing inline (NO bloqueado)
`lib/oferta.ts` ya tiene `founderPrice` + `founderNote`. Solo falta el componente UI.

**Plan**:
- Crear `components/consultoria/OfferLadderV3.tsx` (NO sobrescribir `OfferLadder.tsx` de Alexis que usa el home).
- 3 peldaños: Reunión (gratis) / Consultoría (wide, ambos tiers con regular + fundador) / Implementación (a la medida).
- Reemplazar el placeholder F03 en `app/consultoria/page.tsx` por `<OfferLadderV3 />`.
- Pricing inline SIMULTÁNEO (NO toggle Regular/Fundador). Cada `StepOption` muestra `option.price` (regular) y `option.founderPrice` (si presente) con `option.founderNote`.
- Frame editorial debajo: `FOUNDER_FRAME` exportado de `lib/oferta.ts`.
- Inspiración patrón: tailark `pricing-plans` (border-y editorial "índice de libro"), replicar con primitivas TheoLab — NO instalar la lib.

### PR5 — F04 Sticky Scroll MAPEAR / PRIORIZAR / ENTREGAR (NO bloqueado)
Reemplazar el placeholder F04 con sticky scroll narrativo estilo aceternity adaptado a tokens TheoLab.
- Texto editorial izquierda que avanza con scroll.
- Visual sticky derecha que cambia por paso: mock Meet (MAPEAR), matriz Horas/Mes vs Complejidad (PRIORIZAR), thumbnail entregable (ENTREGAR).
- Incluir bloque F04 del HTML v3: título "El Diagnóstico no es un PDF. Es un activo", lista "qué incluye", blockquote.

### Fase 2 R3F (Juan en Blender, 15-30 min)
Separar Head/Body del GLB para que el LookAt rote solo la cabeza.
- Loop cut en cuello, `P > Selection`, renombrar Head/Body en Outliner, exportar `robot.glb` reemplazando.
- Detalles paso a paso en `SESSION-HANDOFF-2026-06-02-R3F.md` (Fase 2).
- Detectado en working tree: `public/models/robot-rigged-raw.glb` (untracked, no commiteado) — parece avance parcial.

### Fase 3 R3F (Claude, 6-10 h, sesión completa)
Migrar Hero de producción de Spline a R3F.
- Replicar copy editorial (typewriter, pills, banner reactivo) en `HeroR3F`.
- LookAt con `useFrame` + slerp suave + `prefers-reduced-motion`.
- Re-calibrar luces del POC alabaster → setup onyx (exposure 1.15, Environment `studio`, bloom 0.4).
- 1 línea cambio en `app/consultoria/page.tsx`: `<HeroSplite />` → `<HeroR3F />`.
- Mantener `HeroSplite.tsx` 1-2 sprints como fallback.

### Spline watermark (decisión pendiente)
Si **NO** se migra a R3F pronto: pagar 1 mes Spline Basic ($9 USD), re-exportar, cancelar. Quita el "Made with Spline" del preview público.

Si **SÍ** se migra a R3F en sesión próxima: saltar el pago, ir directo a Fase 2 + Fase 3.

---

## Validación final del estado actual

```
typecheck     : clean
vitest        : 22/22 pass
next build    : ✓ static pages 8/8
ramas         : feat/consultoria-redesign-v3 (en local + en origin)
PR            : #2 abierto contra main
working tree  : 1 untracked (public/models/robot-rigged-raw.glb — trabajo Fase 2 paralelo)
```

## Próxima sesión: lo primero que hacer

1. Verificar estado del PR #2 — ¿mergeado, en review, cerrado?
2. Si mergeado: `git checkout main && git pull` en local, branch `feat/consultoria-redesign-v3` ya se puede borrar.
3. Si no mergeado: revisar comments, aplicar cambios sobre la branch, push.
4. Confirmar el archivo `public/models/robot-rigged-raw.glb` con Juan (¿avance Fase 2? ¿commitear? ¿borrar?).
5. Decidir next PR: PR4 (más inmediato, valor visible en landing) o Fase 3 R3F (preparación a largo plazo).

---

## Co-author de los commits

`Claude Opus 4.7 (1M context) <noreply@anthropic.com>` (cumple convención del bash skill global del usuario).
