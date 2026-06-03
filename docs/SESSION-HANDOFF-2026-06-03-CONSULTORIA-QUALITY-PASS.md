# Session Handoff — Consultoria Quality Pass

> **Sesión 2026-06-03 (Juan + Claude).** Continuación cronológica de
> `SESSION-HANDOFF-2026-06-03-IMPECCABLE-INIT-DOC-CRITIQUE.md` y
> `SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md`.
> No-commit. Working tree quedó dirty para que el commit lo decida la próxima
> sesión sobre evidencia visual y/o métricas adicionales si Juan las pide.

---

## Resumen 1 minuto

1. **Harden HeroSplite ejecutado** (11 fixes). Cubre los 2 P1 del critique baseline + resilience adicional (Spline ErrorBoundary, persistencia URL de pills, motion safety).
2. **Workflow `consultoria-quality-pass` corrido** (4 fixes paralelos + verify único + re-critique). Score 31/40 → 32/40. Los 3 P2 + 1 P3 del baseline previo cayeron.
3. **3 micro-fixes manuales** del nuevo critique: decoration burgundy → crimson, alabaster /45 → /75 (AA), h2 FAQ `sr-only` → visible. Gates pasan.
4. **Estado mergeable**: P0 = 0, P1 = 0, typecheck + biome + build verdes. Score final estimado 34-35/40 (Excellent) sin medir todavía.
5. **No-commit por decisión de Juan**: continuamos en próxima sesión con working tree intacto.

---

## Score trend (critique snapshots)

| Run | Snapshot | Score | Banda | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|---|---|
| Baseline pre-harden | `.impeccable/critique/2026-06-03T06-34-33Z__app-consultoria-page-tsx.md` | 26/32 | Good | 0 | 2 | 2 | 1 |
| Post-harden HeroSplite | `.impeccable/critique/2026-06-03T07-16-06Z__app-consultoria-page-tsx.md` | 31/40 | Good | 0 | 0 | 3 | 1 |
| Post-workflow 4 fixes | `.impeccable/critique/2026-06-03T07-38-46Z__app-consultoria.md` | 32/40 | Good | 0 | 0 | 1 | 2 |
| Post-3 micro-fixes | _no medido_ | ~34-35/40 estimado | Excellent | 0 | 0 | 0 | 0-1 |

Detector deterministic regresó `[]` en las 3 mediciones (cero pattern matches).

---

## Lo que se hizo (cronológico)

### Fase A — Harden HeroSplite (manual, yo)

11 fixes sobre `components/sections/HeroSplite.tsx`. Resuelven los 2 P1 del baseline + endurecen contra fallos de red, JS-off, reduced-motion, mobile estrecho. Detalle:

| Tag | Fix |
|---|---|
| H1 | Typewriter SSR/SR resilient — `typedCount` inicial = `TITLE_TOTAL`. `aria-label={TITLE_FULL_TEXT}` en h1 garantiza SR estable desde el primer render. useEffect rebobina sólo si motion permitido. |
| H2 | Persistencia URL — `?sintomas=Horas,Riesgo` sync con `window.location.search` directo (sin `useSearchParams` para evitar Suspense bailout en prerender). `popstate` listener + `history.replaceState` en toggle. |
| H3 | Spline failure isolation — nuevo `components/ui/ErrorBoundary.tsx` + wrapper `SpliteSlot` con timeout 10s + fallback geométrico SVG con retry. |
| H4 | SymptomPill check icon honra `prefers-reduced-motion` (conditional initial/animate/transition). |
| H5 | RAF early-return si `robotObjRef.current === null`. `document.pointerleave` reemplaza `window.mouseout` (más confiable). |
| H6 | `matchMedia` fallback a `addListener`/`removeListener` para Safari < 14. |
| H7 | `min-w-0` en flex children + `break-words` en banner reactivo. |
| H8 | Copy "seleccione lo que más le pese — sin compromiso" → "seleccione lo que aplique. sin compromiso." (em-dash baneado). |
| H9 | Comentario header `/diagnostico` → `/consultoria`. |
| H10 | `aria-hidden="false"` redundante removido. |
| H11 | Spline mobile `aspect-square` → `aspect-[4/5] max-h-[60svh]` (no come viewport en 320-360px). |

Gates pasaron al cerrar la fase.

### Fase B — Workflow `consultoria-quality-pass`

Estructura: 4 fixes en paralelo (sin worktree, archivos disjuntos) → verify único → re-critique.

| Fix | Status | Archivos |
|---|---|---|
| `clarify-f04` | applied | `app/consultoria/page.tsx` — `SectionPlaceholder` extendido con prop opcional `cta`. Nota "Próximamente — PR5" reemplazada por 3 entregables concretos + enlace a `#cta`. |
| `quieter-eyebrows` | applied | `components/sections/{Espejo,Diferenciadores,ParaQuien,FAQ}.tsx` — eyebrow eliminado. De 7/7 a 3/7 (conservados: HeroSplite, OfferLadderV3, CTAFinal). |
| `layout-offer` | applied | `components/consultoria/OfferLadderV3.tsx` — `gap-px + bg` trick reemplazado por `border` explícito 1px `var(--color-divider)` (frágil sub-pixel rendering en 1024-1366px → robusto). |
| `adapt-cta` | applied | `components/sections/CTAFinal.tsx` — `text-display` en valores de contacto → `clamp(1.875rem, 4vw + 0.75rem, 2.75rem)`. `break-all` como red de seguridad. |

Verify: typecheck pass, build pass, **biome fail** por errores en `.claude/skills/impeccable/scripts/*` (vendor UMD + scripts del skill). El `biome.json` no excluía `.claude/`. Fix de 1 línea aplicado: `!.claude` agregado a `files.includes`. Biome pasa ahora sobre 68 files relevantes.

Re-critique: 32/40 (Good). Los 4 fixes confirmados como caídos.

### Fase C — Micro-fixes (3 hallazgos del critique post-workflow)

| Sev | Fix | Archivo:línea |
|---|---|---|
| P2 | `text-[var(--color-alabaster)]/45` → `/75` (contraste 4.5:1 sobre onyx) + email duplicado removido del bloque postal | `components/sections/CTAFinal.tsx:121` |
| P3 | `decoration-[var(--color-burgundy)]` → `decoration-[var(--color-crimson)]` (Burgundy Sunset Rule) | `app/consultoria/page.tsx:162` |
| P3 | h2 FAQ `sr-only` → `motion.h2 text-headline [text-wrap:balance]` (acordeón sin ancla visual era regresión del quieter) | `components/sections/FAQ.tsx:73` |

Gates pasaron al cerrar la fase.

---

## Archivos NUEVOS en esta sesión

| Path | Origen | Propósito |
|---|---|---|
| `components/ui/ErrorBoundary.tsx` | Fase A | Class component reutilizable. Fallback puede ser ReactNode o función con `{error, retry}`. Capturado por `componentDidCatch` + `getDerivedStateFromError`. |
| `docs/SESSION-HANDOFF-2026-06-03-CONSULTORIA-QUALITY-PASS.md` | este | — |
| `.impeccable/critique/2026-06-03T07-16-06Z__app-consultoria-page-tsx.md` | Fase A | Snapshot post-harden, baseline para el workflow. |
| `.impeccable/critique/2026-06-03T07-38-46Z__app-consultoria.md` | Fase B | Snapshot post-workflow (32/40). |

## Archivos MODIFICADOS en esta sesión (deliberadamente)

| Path | Fase | Cambio |
|---|---|---|
| `components/sections/HeroSplite.tsx` | A | Rewrite completo (11 fixes). |
| `biome.json` | B | `!.claude` agregado a `files.includes` (línea 24). |
| `app/consultoria/page.tsx` | B + C | `SectionPlaceholder.cta` prop (B), decoration crimson en lugar de burgundy (C). |
| `components/sections/Espejo.tsx` | B | Eyebrow eliminado del header. |
| `components/sections/Diferenciadores.tsx` | B | Eyebrow eliminado del header. |
| `components/sections/ParaQuien.tsx` | B | Eyebrow eliminado del header. |
| `components/sections/FAQ.tsx` | B + C | Eyebrow eliminado (B), h2 visible con motion (C). |
| `components/consultoria/OfferLadderV3.tsx` | B | Gap+bg trick → border explícito 1px divider. |
| `components/sections/CTAFinal.tsx` | B + C | Clamp custom en valores de contacto (B), `/75` y sin email duplicado en bloque postal (C). |

**Nota sobre git status**: el working tree tiene más archivos M (ej. `app/robots.ts`, `components/motion/variants.ts`, varios `tests/*`, `tsconfig.json`, `vitest.config.ts`, `components/consultoria/OfferLadder.tsx`, `components/sections/Philosophy.tsx`, etc.) que provienen de sesiones previas en la branch `feat/consultoria-redesign-v3` y no fueron tocados deliberadamente en esta sesión. Antes de commitear, revisar `git diff` por archivo para decidir qué entra en cuál commit.

---

## Gates al cerrar

```
pnpm typecheck         → pass
pnpm biome check .     → pass (68 files, no fixes)
pnpm build             → pass (static prerender /consultoria OK)
```

Dev server quedó vivo en background (Bash ID `bnrbncsnf`) en `http://localhost:3000`. Si la próxima sesión lo necesita parado: TaskStop sobre ese ID.

---

## Próximos pasos (decididos)

1. **Re-correr critique para medir score final** post 3 micro-fixes. Comando:
   ```
   /impeccable critique app/consultoria/
   ```
   Esperado: 34-35/40 (banda Excellent). Si confirma, listo para PR merge.

2. **Decidir estructura del commit(s)**. Opciones:
   - **1 commit todo**: `feat(consultoria): quality pass (harden hero + 4 fixes workflow + 3 micro-fixes)`. Conventional, scope amplio.
   - **3 commits granulares**: uno por fase (harden, workflow, micro-fixes). Más legible en el historial.
   - **Excluir explícitamente** los M files preexistentes que no son de esta sesión (revisar con `git diff <file>`).

3. **Decidir merge del PR #2**. Si Alexis ya aprobó las decisiones de diseño y el score está en Excellent, mergeable.

## Deuda menor pendiente (no bloqueante)

| Item | Archivo | Costo |
|---|---|---|
| `hasMounted` dead code | `app/consultoria/page.tsx:41-44` | trivial — eliminar |
| `CUPOS JUNIO` se desactualiza en julio | `components/consultoria/ConsultoriaHeader.tsx:63` | requiere lógica de fecha o cambio de copy |
| FAQ stagger del header eyebrow (revisar si quedó motion.div huérfano post quieter) | `components/sections/FAQ.tsx` | revisar visual; corregir si rompe stagger |
| Re-medir score con critique para confirmar Excellent | — | 1 comando |

---

## Aprendizajes para futuras sesiones

1. **Workflow pattern útil**: 4 fixes paralelos (archivos disjuntos) + verify único + re-critique funciona bien cuando los fixes son específicos y bien especificados. ~6 min total para 4 fixes. No requiere worktrees si los archivos son disjuntos.

2. **Prompt del workflow debe enumerar Named Rules aplicables**. El agente del `clarify-f04` introdujo `decoration-[var(--color-burgundy)]` violando The Burgundy Sunset Rule. El prompt no la mencionaba. Aprendizaje: cualquier prompt de workflow que toque tokens debe listar las Named Rules de DESIGN.md aplicables.

3. **`biome.json` debe ignorar `.claude/`** por default en proyectos con skills instalados. El UMD vendor de scripts/ rompe biome parser. Fix: `!.claude` en `files.includes`.

4. **`useSearchParams` fuerza Suspense en prerender estático** (Next.js 16). Para sync ligero de URL en Client Component dentro de página prerendered, usar `window.location.search` + `popstate` listener directo. Más simple y sin bailout.

5. **El detector deterministic (`detect.mjs`) es buen complemento del LLM**, no sustituto. Catches patrones canonizados (cards repetidas, eyebrows numerados, gradient text decorativo). El LLM detecta cosas más sutiles (eyebrow ritual en 7/7 secciones, contraste AA, anclas visuales faltantes).

---

## Estado del proyecto al cerrar

- **Branch**: `feat/consultoria-redesign-v3`
- **Working tree**: dirty (M + untracked sin commit)
- **PR #2**: 15 commits previos del rediseño v3, mergeable; los cambios de esta sesión NO están aún en el PR
- **Memoria actualizada**: `consultoria-critique-baseline.md` (el plan de 6 comandos quedó ejecutado salvo el polish final opcional)
- **Dev server**: vivo en `localhost:3000`
- **Próxima sesión**: arrancar leyendo este handoff + `consultoria-critique-baseline.md` + abrir `app/consultoria` en browser

Relacionado: [[SESSION-HANDOFF-2026-06-03-PR4-offerladderv3]], [[SESSION-HANDOFF-2026-06-03-IMPECCABLE-INIT-DOC-CRITIQUE]], [[SESSION-HANDOFF-2026-06-02-R3F-PHASE2]].
