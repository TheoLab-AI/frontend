# Session Handoff — Impeccable init + document + critique (PRODUCT.md, DESIGN.md, baseline crítico /consultoria)

> **Sesión 2026-06-03 (Juan + Claude Opus 4.7).**
> Hermana cronológica de [SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md](SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md).
> Cierra la tarea P1 #5 de STATUS.md: "`/impeccable init` en frontend para activar contexto del skill".
> **NO toca código de producción.** Solo doc estratégica + configuración del skill + critique baseline.

---

## Resumen 1 minuto

1. **`/impeccable init` ejecutado.** Escritos PRODUCT.md (estratégico) y `.impeccable/live/config.json` (live mode pre-configurado, CSP verified null).
2. **`/impeccable document` ejecutado.** Escritos DESIGN.md (Stitch-compliant frontmatter + 6 secciones + 11 Named Rules) y `.impeccable/design.json` sidecar (tonal ramps OKLCH + 9 componentes con HTML/CSS self-contained).
3. **`/impeccable critique app/consultoria/` ejecutado.** Score **26/32 (~32/40) banda "Good"**. Snapshot persistido en `.impeccable/critique/2026-06-03T06-34-33Z__app-consultoria-page-tsx.md`. Detector deterministic regresó `[]` (cero AI slop pattern matches).
4. **Drift entre brand v0.4 y `globals.css` detectado y canonizado** como deuda en DESIGN.md: `--orange #FF8A00` falta, `--paper #F2F1EF` no está mapeado a bg-elevated, `burgundy` deprecado a fallback impresión pero aún en runtime (Button solid hover + Badge accent).
5. **Plan de acción 6-comandos definido y NO ejecutado** (el usuario decidió cerrar sesión y consolidar antes de implementar fixes). Espera continuación en próxima sesión.

---

## Decisiones tomadas en esta sesión (NO relitigar)

| Decisión | Valor | Razón |
|---|---|---|
| Register default proyecto | `brand` | Hoy todo el surface es marketing. v0.1+ dashboards podrán override per-task. |
| Creative North Star del sistema visual | "The Archivist's Workbench" | Mesa de archivo: papel grueso, tinta, hairlines como reglas de margen, oro como sello lacrado. Honra Sage+Magician mix + voz Archivist. |
| Tipografía | Inter única familia (NO JetBrains Mono) | Brand v0.3+v0.4 "hierarchy lives in weight and scale, not typeface variety". Cifras y mono usan Inter con `font-variant-numeric: tabular-nums`. El JetBrains Mono propuesto en wireframe v1 queda como deuda a reescribir. |
| Referencias positivas brújula | Stripe/Vercel (technical-confident) + Hermes/Aesop (luxury restraint) + buenas animaciones cinematográficas | Anclas para resistir AI slop test. |
| Anti-references explícitas | SaaS cliché + Magazine warm-cream + Glassmorphism + Agency portfolio + emojis/exclamaciones/em dashes/buzzwords IA | Matriz escrita en PRODUCT.md auditable por cualquier agente futuro. |
| 4 Design Principles canónicos | Cifras antes de adjetivos · Especificidad es la social proof · Su firma es dueña de lo suyo · Voz sobria, motion ambiciosa | Guían cualquier decisión visual o de copy. |
| Motion register | NO sutil Stripe. SÍ Apple iPhone scroll-driven + Awwwards transitions entre rutas + Framer layout choreography | Tensión deliberada: copy calmo, página en movimiento. |
| Burgundy status | Deprecado a fallback impresión solamente | Brand v0.4. NUEVO trabajo NO debe introducirlo. Refactor pendiente del Button solid hover + Badge accent en runtime. |
| Gradient insignia middle stop | `orange #FF8A00 al 55%` | `globals.css` tiene un middle stop inventado `oklch(0.72 0.2 60)` que aproxima orange pero no es canónico. Deuda a corregir. |
| F04 strategy | Implementar PR5 sticky scroll + paralelamente diseñar `/consultoria/diagnostico-sample` sub-página | Cierra el embudo. Sample real anonimizado todavía no existe, hay que diseñarlo. |

---

## Archivos NUEVOS

| Path | Líneas | Descripción |
|---|---|---|
| `PRODUCT.md` (raíz) | ~180 | Estratégico Stitch-compliant: register brand · users primario (socios firmas legales) + secundario (B2B LatAm) · voz Archivist · anti-references como matriz · 4 design principles · a11y · decisiones cerradas |
| `DESIGN.md` (raíz) | ~310 | Visual Stitch-compliant: YAML frontmatter (8 colors + 7 typography + 8 components) · 6 secciones spec · North Star "The Archivist's Workbench" · 11 Named Rules · Do's & Don'ts con anti-references propagadas |
| `.impeccable/design.json` | ~400 | Sidecar live mode: 8 tonal ramps OKLCH · 9 componentes (Button solid/outline/accent, Card default/dark, Badge gold/neutral, Wordmark, SectionLabel) con HTML/CSS self-contained · motion tokens · breakpoints · narrative completa |
| `.impeccable/live/config.json` | 4 líneas | Live mode pre-configurado: `app/layout.tsx` inject target · `</body>` insertBefore · jsx commentSyntax · cspChecked: true (CSP detect.mjs regresó null shape) |
| `.impeccable/critique/2026-06-03T06-34-33Z__app-consultoria-page-tsx.md` | ~110 | Snapshot del critique baseline. Score 26/32. Persistido para que `/impeccable polish` lo consuma como backlog automático. |
| `docs/SESSION-HANDOFF-2026-06-03-IMPECCABLE-INIT-DOC-CRITIQUE.md` | este | — |

## Archivos MODIFICADOS

| Path | Hunks | Cambio |
|---|---|---|
| Ninguno | — | Esta sesión NO modificó código de producción. Solo se agregaron docs estratégicas + config de skill. |

---

## Validación local

```
git branch          : feat/consultoria-redesign-v3
pnpm typecheck      : no corrido (sin cambio de código)
pnpm biome check    : no corrido (sin cambio de código)
detect.mjs          : [] (cero AI slop pattern matches en app/consultoria + components/consultoria + components/sections)
detect-csp.mjs      : { shape: null, signals: [] } (no CSP → cspChecked: true sin patch)
```

---

## Critique baseline · /consultoria

### Score

| Métrica | Valor |
|---|---|
| Total | 26/32 (~32/40) |
| Banda | Good |
| P0 count | 0 |
| P1 count | 2 |
| P2 count | 2 |
| P3 count | 1 |
| AI slop verdict | Negative (no slop manifiesto) |
| Detector deterministic | `[]` clean |

### Heurísticas Nielsen (0-4)

| # | Heurística | Score | Hallazgo |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | SpotsWidget OK; falta feedback inline post síntomas Hero |
| 2 | Match Real World | 4 | Lenguaje del socio (matter, secreto, peldaños no tiers) |
| 3 | User Control & Freedom | 2 | SymptomPill sin reset; FAQ Q1 fixed open |
| 4 | Consistency & Standards | 4 | Tokens respetados, motion reusado, placeholder estructurado |
| 5 | Error Prevention | N/A | Sin formularios |
| 6 | Recognition Over Recall | 3 | 01/02/03 visibles; section IDs no expuestos |
| 7 | Flexibility & Efficiency | 3 | Anchors navbar; sin atajos teclado |
| 8 | Aesthetic & Minimalist | 4 | Cero clutter; hairlines como estructura |
| 9 | Error Recovery | N/A | Sin formularios |
| 10 | Help & Documentation | 3 | FAQ 5Q cubre; sin contextual help fuera FAQ |

### Priority Issues (no ejecutados)

1. **[P1] Typewriter SR rompe transición narrativa** — `components/sections/HeroSplite.tsx:73-104`. `aria-hidden={!done}` + `sr-only` post-done hace que SR pierda la transición "Usted sabe el qué → nosotros traemos el cómo". Fix: render título completo en sr-only desde mount. Comando: `/impeccable audit components/sections/HeroSplite.tsx`.
2. **[P1] SymptomPill no persiste — flujo lectura roto** — `components/sections/HeroSplite.tsx:300-307`. `Set<Symptom>` es local state; scroll a otra sección y vuelta = pills desmarcados. Fix: persistir en `URLSearchParams` (`?sintomas=horas,riesgo`) o `localStorage`; pasar selección a F03 como prioridad sugerida. Comando: `/impeccable harden components/sections/HeroSplite.tsx`.
3. **[P2] F04 placeholder sin micro-CTA interrumpe embudo** — `app/consultoria/page.tsx:58-64`. SectionPlaceholder "Próximamente" sin link. Fix temporal: micro-CTA a `#cta` ("Pregúntenos qué incluye el Diagnóstico"). Fix definitivo: implementar PR5. Comando: `/impeccable clarify` o `/impeccable shape "F04 sticky scroll diagnostico"`.
4. **[P2] OfferLadderV3 gap visual débil en md** — `components/consultoria/OfferLadderV3.tsx:80`. `gap-px` (1px hairline) desaparece a primera lectura en 1024px+. F03 es la sección de pricing crítica. Fix: `gap-2` (8px) o `border-l` interno por PeldanoCell. Comando: `/impeccable layout components/consultoria/OfferLadderV3.tsx`.
5. **[P3] Spline fallback "Cargando..." genérico mobile** — `components/sections/HeroSplite.tsx:289-298`. UX bump visible 1-2s. Fix: skeleton geométrico o screenshot estático. Comando: `/impeccable optimize components/sections/HeroSplite.tsx`.

### Persona Red Flags (cada uno con findings específicos)

- **Jordan** (abogada asociada 28): Hero pills + banner reactivo confunde si "está EN el diagnóstico" o "será abordado"; FAQ Q1 dice 6-12 meses implementación = interminable.
- **Riley** (CTO 15 años BYOC): FAQ Q2 datos responde Ley 1581/secreto sin estructura técnica; Diferenciador 02 "caja negra" no explícito sobre migración.
- **Casey** (mobile distraído): Spline stacked + "Cargando..." + pills ~40px; CTA Final dos botones agregan paso "elige canal" antes de "agenda".
- **Esteban (custom — Socio Fundador firma legal Cali 48 años, conservador)**: Typewriter cursor crimson lee "en construcción"; Spline robot lee "agency de diseño, no proveedor técnico"; F02 Espejo señala problema sin remitir solución en siguiente sección; CTA WhatsApp/correo vs calendario lee anticuado.

### Provocative Questions (no ejecutadas)

1. Si los 10 cupos fundadores son scarcity engine, ¿por qué solo el navbar widget los comunica? Considerar `<FounderCounter />` inline en F03 espejando SpotsWidget.
2. ¿Hero Spline 3D narra algo o es lujo? PR3 R3F puede acoplar narrativa: robot reacciona a pills seleccionados, no solo al cursor.
3. ¿F04 sticky scroll vs `/consultoria/diagnostico-sample` con Diagnóstico real anonimizado? El sample real maximiza "Especificidad es social proof". **Decisión Juan: implementar AMBOS** (PR5 + sample), sample requiere diseño primero.

---

## Lo que el siguiente agente NO debe tocar

| Archivo | Razón |
|---|---|
| `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` | Recién escritos en esta sesión. Single source of truth para cualquier audit/critique/polish/craft futuro. Solo editar si nueva decisión cierra (NO relitigar las cerradas arriba). |
| `.impeccable/live/config.json` | Live mode pre-configurado. NO cambiar a menos que falle live.mjs con `config_invalid`. |
| `.impeccable/critique/2026-06-03T06-34-33Z__*.md` | Snapshot persistido. `/impeccable polish` lo consume automáticamente. Re-correr `/impeccable critique app/consultoria/` cuando se apliquen fixes para ver score subir. |
| Código de producción en `app/` y `components/` | Esta sesión NO los tocó. Tres PRs abiertos (#1 SEO, #2 rediseño v3 + PR4, #3 R3F) están en review/merge. |

---

## Lo que queda pendiente

### Inmediato (próxima sesión, ya planeado)

Plan de acción del critique, en orden:

1. **`/impeccable harden components/sections/HeroSplite.tsx`** → cubre P1 typewriter SR + P1 SymptomPill persist en un solo pase.
2. **`/impeccable shape "F04 sticky scroll diagnostico"`** → plan PR5 con copy + wireframe v1 cerrados.
3. **`/impeccable shape "/consultoria/diagnostico-sample"`** → spec sub-página + checklist de inputs (bloqueado por: Juan debe anonimizar un Diagnóstico real existente).
4. **`/impeccable layout components/consultoria/OfferLadderV3.tsx`** → P2 gap visual.
5. **`/impeccable optimize components/sections/HeroSplite.tsx`** → P3 Spline fallback.
6. **`/impeccable polish app/consultoria/`** → pase final pre-merge PR #2.

### Deuda técnica detectada (canonizada en DESIGN.md)

| Deuda | Path | Acción |
|---|---|---|
| Burgundy en runtime | `components/ui/Button.tsx:24` hover + `components/ui/Badge.tsx:18` accent variant | Refactor: reemplazar `hover:bg-[var(--color-burgundy)]` por `hover:bg-[var(--color-fg)]/85` o `hover:bg-[var(--color-crimson)]`. Badge accent → mover a Badge gold variant o crear nuevo. |
| Middle stop inventado del gradient | `app/globals.css:133` y `app/globals.css:243` | Cambiar `oklch(0.72 0.2 60)` por `#FF8A00` (orange canónico brand v0.4). |
| `--paper #F2F1EF` faltante | `app/globals.css:22` | Agregar `--color-paper: #F2F1EF` y reasignar `--color-bg-elevated: var(--color-paper)`. |
| JetBrains Mono en wireframe v1 | `docs/landing-consultoria-wireframe-v1.md:38` | Reescribir esa sección a Inter + `tabular-nums`. NO cargar JetBrains Mono. |

### Re-baseline post-fixes

Después de aplicar los 5 priority issues + los 4 cleanup técnicos arriba, re-correr `/impeccable critique app/consultoria/`. Esperado: subir a 30-32/32 (~36-38/40) banda **Excellent**. Trend line acumulará histórico para comparación.

---

## Cómo verificar local (próxima sesión)

```powershell
Set-Location C:\TheoLab\frontend
git branch --show-current        # DEBE imprimir: feat/consultoria-redesign-v3
                                  # Si imprime otra, ver "Regla crítica" del handoff anterior
git pull --ff-only

# Ver lo escrito en esta sesión
Get-ChildItem PRODUCT.md, DESIGN.md
Get-ChildItem .impeccable -Recurse

# Re-cargar contexto del skill (no es necesario; las próximas sesiones leen automáticamente)
node .claude/skills/impeccable/scripts/context.mjs

# Continuar con el plan
# 1. /impeccable harden components/sections/HeroSplite.tsx
# 2. ... resto del plan
```

---

## Paths críticos

```
C:/TheoLab/frontend/
  PRODUCT.md                                                        ← NUEVO (Stitch-compliant)
  DESIGN.md                                                         ← NUEVO (Stitch-compliant)
  .impeccable/
    design.json                                                     ← NUEVO (sidecar live mode)
    live/
      config.json                                                   ← NUEVO (live config Next.js App Router)
    critique/
      2026-06-03T06-34-33Z__app-consultoria-page-tsx.md             ← NUEVO (snapshot baseline)
  docs/
    SESSION-HANDOFF-2026-06-03-IMPECCABLE-INIT-DOC-CRITIQUE.md      ← NUEVO (este)
    SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md                 ← hermana (PR4)
    landing-consultoria-wireframe-v1.md                             ← deuda JetBrains Mono pendiente
    landing-consultoria-copy-v1.md                                  ← OK
  app/globals.css                                                   ← 3 deudas técnicas detectadas (orange, paper, gradient stop)
  components/ui/Button.tsx                                          ← burgundy en hover (deuda)
  components/ui/Badge.tsx                                           ← burgundy en accent variant (deuda)
  components/sections/HeroSplite.tsx                                ← P1 + P1 + P3 (próxima sesión)
  components/consultoria/OfferLadderV3.tsx                          ← P2 gap visual (próxima sesión)
  app/consultoria/page.tsx                                          ← P2 F04 placeholder (próxima sesión)
```

---

## Co-author de los commits

`Claude Opus 4.7 (1M context) <noreply@anthropic.com>` (cuando se hagan en próxima sesión; esta no commiteó).

---

## Reglas críticas heredadas

- **`git branch --show-current` antes de cualquier commit** (sesiones paralelas con Alexis mueven HEAD). Regla del [SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md](SESSION-HANDOFF-2026-06-03-PR4-offerladderv3.md).
- **NUNCA `--no-verify`** en pre-commit hooks (CLAUDE.md §3.5).
- **NUNCA introducir burgundy en código nuevo** (DESIGN.md "The Burgundy Sunset Rule" recién canonizada).
- **NUNCA introducir segunda familia tipográfica** (DESIGN.md "The Single Family Rule" recién canonizada).
- **NUNCA reasentar middle stop del gradient con valores OKLCH inventados**; el stop legítimo es `#FF8A00`.
- **PRODUCT.md y DESIGN.md son normativos.** Cualquier conflicto entre código actual y estos docs se resuelve modificando código, no docs (a menos que nueva decisión cierre explícitamente con Juan).
