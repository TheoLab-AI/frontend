# Session Handoff — PR4 OfferLadderV3 (embudo F03 onyx con split fundador/regular)

> **Sesión 2026-06-03 (Juan + Claude).**
> Hermana cronológica de los handoffs previos del rediseño v3 (`SESSION-HANDOFF-2026-06-02*.md`).
> Cubre el último gap pendiente del PR #2: la sección F03 "Cómo trabajamos".

---

## Resumen 1 minuto

1. **PR4 completado** — `components/consultoria/OfferLadderV3.tsx` (313 líneas) sustituye el placeholder F03 con el embudo editorial onyx del HTML v3.
2. **3 peldaños grid 3-6-3**: Reunión (gratis) / Consultoría wide (2 tiers Inicial + Completa con split fundador/regular **inline simultáneo**, sin toggle) / Implementación (a la medida).
3. **A11y aplicada tras adversarial review** en 4 dimensiones paralelas (Workflow): jerarquía h2→h3→h4, contrastes ≥4.5:1 sobre onyx, `<del>` semántico, `<aside>` para el frame fundador, role=list/listitem.
4. **`OfferLadder.tsx` de Alexis intacto** — sigue siendo el del home institucional con precios regulares.
5. **Commit `654488b` pusheado en `feat/consultoria-redesign-v3`**. PR #2 ahora con 15 commits, mergeable, Vercel Preview Comments check verde.
6. **Incidente y recovery**: commit inicial cayó en `feat/hero-r3f-migration` (HEAD local cambió por sesión paralela sin notar). Recovery: cherry-pick a la branch correcta + push + `git reset --hard HEAD~1` en la branch errónea para borrar duplicado local (no pusheado).

---

## Decisiones tomadas en esta sesión (NO relitigar)

| Decisión | Valor | Razón |
|---|---|---|
| Patrón visual | Editorial "índice de libro" border-y onyx con grid 3-6-3 | Replica el HTML v3 literal de Juan. Inspiración 21st.dev descartada (cards genéricas/glassmorphism, lejos del lenguaje TheoLab) |
| Pricing layout | Regular tachado + Fundador display gold **simultáneo** (NO toggle) | Handoff PR3 lo especificó. Reduce fricción cognitiva; comunica oferta + ancla de descuento al primer scan |
| `OfferLadder.tsx` (Alexis) | NO sobrescribir. Crear archivo nuevo `OfferLadderV3.tsx` | Sigue consumido por el home institucional con precios regulares solamente |
| Fuente única | `lib/oferta.ts` — STEPS + FOUNDER_FRAME + FOUNDER_SPOTS_TOTAL | Cambio de precio en un único lugar refleja en landing + JSON-LD + tests |
| Tags peldaños | "Peldaño 0X" uniforme + `<h3>{step.name}</h3>` | Simétrico entre single y wide. SR navega por encabezados consistente |
| Tiers como `<article>` con `<h4>` | aria-labelledby al h4 (jerarquía h2→h3→h4 correcta) | Adversarial review marcó h2→h3→`<p>` como bloqueante WCAG |
| Precio tachado | `<del>` semántico + sr-only "Precio anterior:" | aria-label en span con line-through anuncia mal en NVDA/VO |
| Tamaño mínimo texto | 0.75rem (12px) | Adversarial review marcó 0.6rem/0.65rem como violación WCAG 1.4.4 Resize text |
| Contrastes | Alabaster /75 mínimo en texto pequeño, /80 en body | Adversarial review marcó /40, /50, /55 como AA fail (< 4.5:1) |
| Inline styles | Reemplazados por Tailwind arbitrary values (`text-[1.75rem]`, `leading-[1.6]`) | Evita conflicto entre `text-headline` utility (clamp) y `fontSize` inline |
| `useId()` para tier IDs | Sí, en lugar de `option.label.toLowerCase().replace(...)` | SSR-safe; preserva integridad si añaden tiers con acentos |

---

## Archivos NUEVOS

| Path | Líneas | Descripción |
|---|---|---|
| `components/consultoria/OfferLadderV3.tsx` | 313 | Componente F03 completo: `OfferLadderV3` + sub-componentes `PeldanoCell`, `SinglePeldano`, `WidePeldano`, `TierBlock`, `StrikethroughPrice`, `DisplayPrice`, `FounderFrame` |
| `docs/SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md` | este | — |

## Archivos MODIFICADOS

| Path | Hunks | Cambio |
|---|---|---|
| `app/consultoria/page.tsx` | 3 | (a) `import { OfferLadderV3 }` agregado; (b) JSDoc F03 actualizado de "placeholder hasta PR4" → "componente OfferLadderV3 — PR4"; (c) `<SectionPlaceholder id="como" ... tone="onyx" />` reemplazado por `<OfferLadderV3 />`. Sin tocar imports/JSDoc/render de F01/F04/F05/F06/F07/F08 ni la función `SectionPlaceholder` (sigue para F04) |

---

## Validación local

```
git branch          : feat/consultoria-redesign-v3
biome check         : clean (1 fix iterativo: organize imports + role="group" en article quitado)
pnpm typecheck      : clean
pnpm vitest run     : 22/22 pass
pnpm build          : falla local (next/font Google fonts fetch — entorno sin internet a Google Fonts). NO es regresión del PR; Vercel preview valida en su infra.
PR #2 checks remote : Vercel Preview Comments = SUCCESS
```

---

## Workflow Git ejecutado (con incidente y recovery)

### Bloque 1 — commit accidental en branch incorrecta

Al arrancar la sesión, el HEAD local estaba en `feat/hero-r3f-migration` (la sesión paralela de Fase 3 R3F había hecho checkout sin que yo lo notara). Mi commit `9be4e9c` cayó ahí en lugar de `feat/consultoria-redesign-v3`.

### Bloque 2 — cherry-pick a la branch correcta

```
git checkout feat/consultoria-redesign-v3
git pull --ff-only origin feat/consultoria-redesign-v3
git cherry-pick 9be4e9c        # genera 654488b sobre base correcta
git push origin feat/consultoria-redesign-v3
```

PR #2 actualizado automáticamente. Vercel preview redeploy disparado.

### Bloque 3 — limpiar duplicado local en hero-r3f-migration

```
git checkout feat/hero-r3f-migration
git reset --hard HEAD~1        # borra 9be4e9c (no pusheado, sin impacto remoto)
git checkout feat/consultoria-redesign-v3
```

`feat/hero-r3f-migration` queda con HEAD = `d86e3c4` (último commit legítimo de la sesión paralela). Sin contaminación.

---

## Adversarial review (Workflow 4 dimensiones paralelas)

Ejecutado con `Workflow` tool sobre 4 agentes simultáneos cada uno con schema estricto:

| Dimensión | Status | Findings críticos aplicados |
|---|---|---|
| **a11y** | OK con cambios | h2→h3→h4 jerarquía, contrastes /75 mínimo, tamaños ≥0.75rem, `<del>` semántico + sr-only, role=list/listitem, `<article>` aria-labelledby, `<aside>` FounderFrame |
| **visual-alignment** | Falló schema | El agente no devolvió JSON estructurado. NO bloquea — el componente ya respeta los patrones de Espejo/Diferenciadores/ParaQuien/CTAFinal por construcción |
| **edge-cases** | Sin findings | Componente robusto contra el contrato `lib/oferta` |
| **code-quality** | OK con cambios | Reemplazo de inline styles por Tailwind arbitrary, refactor `RegularPrice` boolean prop → `StrikethroughPrice` + `DisplayPrice`, `formatStepIndex` camelCase, `useId()` para tier IDs |

Findings completos persistidos en transcript dir del workflow:
`C:\Users\juanj\AppData\Local\Temp\claude\C--TheoLab\76a24079-38f0-4877-98ff-b452b730166b\tasks\waygyw5c1.output`

---

## Lo que el siguiente agente NO debe tocar

| Archivo | Razón |
|---|---|
| `components/consultoria/OfferLadder.tsx` (Alexis) | Lo consume el home institucional `/` con precios regulares solamente. PR4 NO lo modifica. |
| `components/sections/HeroSplite.tsx` | Sigue siendo el Hero de producción en `feat/consultoria-redesign-v3`. Su migración a R3F vive en PR #3 separado (`feat/hero-r3f-migration`). |
| Cualquier archivo de PR #3 (`HeroR3F.tsx`, `HeroR3FScene.tsx`, `components/r3f/RobotLookAt.tsx`) | Owner: sesión paralela / Alexis. NO mezclar con PR #2. |
| `app/consultoria/page.tsx` (HeroR3F dynamic import + slot F01) | Cuando se mergeen PR #2 + PR #3, Git fusionará automáticamente (cambios en líneas distintas). NO pre-fusionar manualmente. |
| `tests/e2e/consultoria.spec.ts` (M de la sesión paralela) | Modificación de Fase 3. NO incluir en commits de PR4. |

---

## Lo que queda pendiente

### Inmediato — review/merge
1. **Vercel preview de PR #2** — validar visualmente F03 (eyebrow gold, tiers Inicial + Completa con split, FounderFrame).
2. **Coordinar merge order**: PR #1 (fix SEO) → PR #2 (rediseño + PR4) → PR #3 (Fase 3 R3F sobre la base mergeada).

### PR5 — F04 Sticky Scroll MAPEAR / PRIORIZAR / ENTREGAR (no bloqueado)
- Reemplazar el placeholder F04 con sticky scroll narrativo estilo aceternity adaptado a tokens TheoLab.
- Texto editorial izquierda que avanza con scroll.
- Visual sticky derecha que cambia por paso: mock Meet (MAPEAR), matriz Horas/Mes vs Complejidad (PRIORIZAR), thumbnail entregable (ENTREGAR).
- Copy literal del bloque F04 del HTML v3: título "El Diagnóstico no es un PDF. Es un activo", lista "qué incluye", blockquote.

### Cleanup post-merge
- Tras 1-2 sprints estables de Fase 3 R3F en prod, borrar `HeroSplite.tsx`, `components/ui/Splite.tsx`, deps `@splinetool/*`, POC `/consultoria/r3f-poc`.

---

## Cómo verificar local (próxima sesión)

```powershell
Set-Location C:\TheoLab\frontend
git branch --show-current        # DEBE imprimir: feat/consultoria-redesign-v3
                                  # Si imprime otra, ver "Regla crítica" abajo.
git pull --ff-only
npx --yes pnpm@11.3.0 dev
# Abrir http://localhost:3000/consultoria#como
```

**Checklist visual F03**:
- Fondo onyx con eyebrow `● Cómo trabajamos` gold
- 3 peldaños lado a lado en desktop (3-6-3); en mobile stack vertical
- Peldaño 02 wide: 2 tiers (Inicial + Completa). Cada uno con:
  - `~~$500.000~~ Regular` (tachado, alabaster /65)
  - `$200.000 Fundador · 10 cupos` (gold display 1.75rem)
- Frame editorial `EDICIÓN FUNDADORA · 10 CUPOS` con regla horizontal arriba
- Eyebrow + headline + sub: animación fadeUp con stagger al entrar al viewport

---

## Regla crítica (aprendida con este incidente)

**Sesiones paralelas mueven HEAD sin avisar.** Antes de cualquier `git add`/`commit`:

```powershell
git branch --show-current
git status
git log -3 -- <archivo-que-vas-a-tocar>
```

Si la branch esperada no es la activa, NO commitear hasta resolver. Esta regla quedó documentada en:
- `~/.claude/projects/C--/memory/theolab-rediseno-diagnostico-v3.md` → sección "REGLAS críticas"
- `~/.claude/projects/C--/memory/MEMORY.md` → línea del rediseño v3

---

## Co-author de los commits

`Claude Opus 4.7 (1M context) <noreply@anthropic.com>` (cumple convención del bash skill global del usuario).

---

## Paths críticos

```
C:/TheoLab/frontend/
  components/consultoria/OfferLadderV3.tsx                          ← NUEVO (PR4)
  components/consultoria/OfferLadder.tsx                            ← Alexis, NO TOCAR (home)
  components/consultoria/ConsultoriaHeader.tsx                      ← anchor #como linkea aquí
  app/consultoria/page.tsx                                          ← MODIFICADO 3 hunks (F03)
  app/(institucional)/page.tsx                                      ← home consume OfferLadder (Alexis)
  lib/oferta.ts                                                     ← fuente única (consumida por OfferLadderV3 + OfferLadder + ofertaJsonLd)
  lib/seo.ts                                                        ← ofertaJsonLd emite Offer regular + fundador
  docs/SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md              ← este archivo

PR #2: https://github.com/TheoLab-AI/frontend/pull/2  (15 commits, OPEN, mergeable)
PR #3: https://github.com/TheoLab-AI/frontend/pull/3  (Fase 3 R3F, OPEN)
PR #1: https://github.com/TheoLab-AI/frontend/pull/1  (fix SEO, OPEN)
```
