# Handoff R3F Fase 3 — migración Hero producción Spline → R3F · sesión 2026-06-02 (noche)

> **Para el agente o director que va a revisar el PR de Fase 3.**
> Esto es continuación directa de [Fase 2](./SESSION-HANDOFF-2026-06-02-R3F-PHASE2.md). Fase 2 dejó el GLB rigged + el POC adaptado; Fase 3 migra el Hero de producción.
> Branch nueva (NO en `feat/consultoria-redesign-v3` directamente) para no bloquear el merge del PR #2.

---

## Resumen 1 minuto

1. Hero de producción de `/consultoria` migrado de Spline (`<SpliteScene>`) a React Three Fiber (`<Canvas>`).
2. Tres componentes nuevos: `RobotLookAt.tsx` (carga GLB + rota head bone), `HeroR3FScene.tsx` (Canvas con setup HD onyx), `HeroR3F.tsx` (Hero completo con copy column idéntica + Canvas).
3. `app/consultoria/page.tsx` cambia 1 import y 1 JSX node: `HeroSplite` → `HeroR3F` (vía `dynamic({ssr:false})`).
4. `HeroSplite.tsx` se conserva en el repo como fallback de emergencia durante 1-2 sprints; se borra después de validar Vercel preview.
5. Validado local: typecheck OK, biome OK, build OK (8/8 páginas estáticas, `/consultoria` ○ Static).
6. **Branch `feat/hero-r3f-migration` creada desde `feat/consultoria-redesign-v3` (HEAD `a7ba8b1`).** PR independiente; mergea contra `main` después de PR #2 o se rebasea si PR #2 demora.

---

## Decisiones tomadas (NO relitigar)

| Decisión | Valor | Razón |
|---|---|---|
| Branch | `feat/hero-r3f-migration` (desde `feat/consultoria-redesign-v3`) | Evita contention con PR #2. Permite mergear PR #2 independiente del estado de Fase 3 |
| Bone para LookAt | `tripo::Head_0` (no Mixamo) | El rig de Prism mantuvo naming Tripo del modelo source. `tripo::Head_0` es el head bone superior; sub-bone `tripo::Head_1` cuelga de él |
| Amplitudes head | yaw 0.42 rad (~24°), pitch 0.22 rad (~13°) | Conservadoras vs Spline (0.55 / 0.28) porque ahora rota solo cabeza — los ángulos se notan más |
| Lerp factor | 0.09 | Mismo que Spline original — feedback validado |
| Eje pitch (signo) | `pitch = -m.y` | Cursor arriba (clientY baja, m.y negativo) → cabeza se inclina arriba (rotation.x positivo en local frame del bone) |
| Composición rotación | `head.quaternion.copy(baseQuat).multiply(deltaQuat)` | Preserva el rest pose del bone. Modificar `.rotation.x/y` directo sobrescribiría la pose binding del rig |
| Allocaciones por frame | `tmpEuler.current` + `tmpQuat.current` reutilizados | Evita GC pressure en useFrame (60fps × 2 nuevos objects = 120 allocs/seg) |
| Exposure | 1.15 (vs POC 1.0) | Fondo onyx absorbe luz, necesita más exposure para no quedar plano |
| Environment preset | `studio` (vs POC `city`) | Gradiente neutro más cinematic sobre onyx; `city` tiene tintes amarillos que chocan con el Spotlight gold |
| Bloom intensity / threshold | 0.4 / 0.72 (vs POC 0.25 / 0.9) | En oscuro, los highlights del traje cyborg se vuelven dramáticos a threshold más bajo. Conservador para no quemar |
| ContactShadows | opacity 0.55 color #000 | Más definida que el POC (0.45) — el Canvas transparente proyecta sobre el Card var(--color-onyx), necesita contraste |
| 3-point lighting | Key cálido upper-right, fill frío izq-inferior, rim cálido trasero | Evita que Key compita con el Spotlight gold (upper-LEFT del Card); rim cálido da halo coherente con var(--color-gold) |
| OrbitControls | REMOVIDOS | Producción no permite rotación libre. Solo POC los necesita |
| Canvas `alpha: true` | SÍ | Hereda bg del Card padre (var(--color-onyx)) en lugar de pintar su propio fondo |
| Import dynamic ssr:false | SÍ | three.js + drei tocan `window`/`document` durante module eval; defer al cliente evita hydration mismatches |
| Loading fallback | `min-h-[108svh]` | Mantiene el espacio del Hero durante carga del chunk three.js; sin reflow al hidratar |
| Sub-componentes duplicados | TypedTitle, SymptomPill, HeroVeil, constantes — duplicados desde HeroSplite | Mantiene los dos componentes aislados durante período de fallback. Cuando HeroSplite se borre se pueden extraer a módulo compartido |
| Borrar HeroSplite ahora | NO | Fallback de emergencia 1-2 sprints. Se borra en futuro cleanup PR |

---

## Archivos NUEVOS (parte de este handoff)

| Path | Líneas | Descripción |
|---|---|---|
| `components/r3f/RobotLookAt.tsx` | 96 | Carga GLB rigged + LookAt head bone con quaternion local |
| `components/sections/HeroR3FScene.tsx` | 94 | Canvas R3F con setup HD onyx (exposure 1.15, studio, bloom 0.4, 3-point) |
| `components/sections/HeroR3F.tsx` | 348 | Hero completo: Card+Spotlight+HeroVeil+typewriter+pills+banner+Canvas |
| `docs/SESSION-HANDOFF-2026-06-02-R3F-PHASE3.md` | este archivo | - |

## Archivos MODIFICADOS

| Path | Cambio |
|---|---|
| `app/consultoria/page.tsx` | -1 import (HeroSplite) +1 import dynamic (HeroR3F) + 1 comentario actualizado + 1 JSX node cambiado. 20 ins / 4 del |

## Archivos NO TOCADOS

| Path | Razón |
|---|---|
| `components/sections/HeroSplite.tsx` | Fallback de emergencia durante 1-2 sprints |
| `components/sections/HeroR3FPoc.tsx` | POC aislado en `/consultoria/r3f-poc` — preservado intacto |
| `components/r3f/Robot.tsx` | Componente original del POC, sin LookAt — preservado |
| `public/models/robot.glb` | Ya está rigged 5.16 MB de Fase 2 |
| Cualquier F02..F08 | Trabajo independiente |

---

## Commits propuestos (en este PR)

**Commit 1** — `508b942` — Componentes R3F nuevos (`RobotLookAt`, `HeroR3FScene`, `HeroR3F`).

**Commit 2** — `8959083` — `app/consultoria/page.tsx`: switch HeroSplite → HeroR3F dinámico.

**Commit 3** (próximo) — handoff doc (este archivo).

---

## Verificaciones antes del PR

```powershell
Set-Location C:\TheoLab\frontend

# 1. Branch correcta
git branch --show-current
# Debe imprimir: feat/hero-r3f-migration

# 2. typecheck limpio
npx --yes pnpm@11.3.0 typecheck
# Debe pasar sin errores

# 3. biome limpio (4 files)
npx --yes pnpm@11.3.0 exec biome check `
  components/r3f/RobotLookAt.tsx `
  components/sections/HeroR3F.tsx `
  components/sections/HeroR3FScene.tsx `
  app/consultoria/page.tsx
# Debe ser "Checked 4 files. No fixes applied." sin errores

# 4. Build OK
npx --yes pnpm@11.3.0 build
# Debe completar con 8/8 páginas estáticas y /consultoria ○ Static

# 5. Working tree limpio (con la excepción de OfferLadderV3.tsx untracked,
#    que NO es trabajo de Fase 3 — pertenece a PR4 / otra sesión)
git status --short
# Debe mostrar SOLO:
#   ?? components/consultoria/OfferLadderV3.tsx
```

---

## Comportamiento esperado en producción

| Aspecto | Comportamiento |
|---|---|
| Primera carga | Loading fallback (section onyx vacía) durante ~500ms-1s mientras chunk three.js se descarga e hidrata. Sin reflow después |
| Render visible | ~10-20 s para GLB + Environment HDR (mismo orden de magnitud que el POC) |
| Mouse follow | Cabeza del robot rota suavemente para seguir el cursor en TODA la viewport (no solo sobre el Canvas) — bypass del Spline mouse-only-on-canvas |
| Pills activas | Banner reactivo con los términos seleccionados (idéntico a HeroSplite) |
| Typewriter | "Usted sabe el qué. Nosotros, el cómo." con cursor crimson parpadeante + shimmer en "cómo" |
| Mobile (<lg) | Canvas en columna inferior aspect-square (como HeroSplite mobile); UNA sola instancia activa según viewport |
| prefers-reduced-motion | Typewriter salta al estado final; LookAt deshabilitado (cabeza en rest pose) |

---

## Limitaciones conocidas heredadas de Fase 2

**Memory leak en Next.js Turbopack con R3F + GLB grande + hard reload.**

Después de la primera carga, hacer hard reload (Ctrl+Shift+R) varias veces hace que el dev server suba a 951+ MB de RAM y empiece a colgar requests.

**Workaround durante desarrollo**:
- Trabajar con UNA carga por sesión (sin hard reload), o
- `taskkill /F /T /PID <pid_3000>` y reiniciar `pnpm dev`, o
- `pnpm build && pnpm start` para servir build estática sin Turbopack — más lento de iterar pero estable.

**Implicación en producción**: NINGUNA. El build de producción NO tiene Turbopack y NO sufre este memory leak. Es exclusivo del dev server.

---

## Lo que NO está terminado (Fase 4, otra sesión)

- **Validar Vercel preview**: cargar el preview del PR y validar visualmente:
  1. Calidad del render del robot sobre fondo onyx (vs alabaster del POC)
  2. LookAt funciona suave (no jitter, sin saltos al cambiar de columna en lg)
  3. Spotlight gold + HeroVeil + Canvas no compiten visualmente
  4. Mobile (<lg) hidrata el Canvas correctamente con `isLgUp=false`
  5. prefers-reduced-motion congela la cabeza
- **Borrar HeroSplite tras 1-2 sprints** de uso del HeroR3F en producción sin incidentes:
  - Borrar `components/sections/HeroSplite.tsx`
  - Borrar `components/ui/Splite.tsx`
  - Borrar dep `@splinetool/runtime` y `@splinetool/react-spline` del `package.json`
- **Borrar el POC** `/consultoria/r3f-poc` y `components/sections/HeroR3FPoc.tsx` (ya cumplió su función)
- **Refactor opcional**: extraer TypedTitle, SymptomPill, HeroVeil a un módulo compartido si no se borran ambos Heros pronto. Solo justifica si surge una tercera variante.

---

## Paths críticos

```
C:/TheoLab/frontend/
  components/r3f/RobotLookAt.tsx                            ← NUEVO Fase 3
  components/r3f/Robot.tsx                                  ← POC original, intacto
  components/sections/HeroR3F.tsx                           ← NUEVO Fase 3
  components/sections/HeroR3FScene.tsx                      ← NUEVO Fase 3
  components/sections/HeroSplite.tsx                        ← Fallback de emergencia
  components/sections/HeroR3FPoc.tsx                        ← POC intacto
  app/consultoria/page.tsx                                  ← MODIFICADO Fase 3
  app/consultoria/r3f-poc/page.tsx                          ← POC intacto
  public/models/robot.glb                                   ← 5.16 MB rigged de Fase 2
  docs/SESSION-HANDOFF-2026-06-02-R3F-PHASE3.md             ← este archivo
  docs/SESSION-HANDOFF-2026-06-02-R3F-PHASE2.md             ← handoff hermano (rig + GLB)
  docs/SESSION-HANDOFF-2026-06-02-R3F.md                    ← handoff Fase 1 (POC inicial)
```

---

## Memoria global del director — actualización sugerida

Agregar al final de `C:/Users/juanj/.claude/projects/C--/memory/theolab-rediseno-diagnostico-v3.md`:

```markdown
## Fase 3 R3F completada (sesion 2026-06-02 noche)

- Hero de produccion migrado de Spline a R3F. 3 archivos nuevos:
  components/r3f/RobotLookAt.tsx, components/sections/HeroR3FScene.tsx,
  components/sections/HeroR3F.tsx.
- LookAt al mouse sobre head bone tripo::Head_0 (no Mixamo — Prism preservo
  naming Tripo). Amplitudes yaw 0.42 / pitch 0.22, lerp 0.09. Slerp en
  useFrame via quaternion local (preserva rest pose del rig).
- Setup R3F oscuro: exposure 1.15, Environment studio, bloom 0.4 threshold
  0.72, ContactShadows opacity 0.55 #000, 3-point lighting calibrado para
  no competir con Spotlight gold upper-left.
- app/consultoria/page.tsx: import dynamic ssr:false (three.js toca window),
  loading fallback min-h-108svh evita reflow.
- HeroSplite.tsx preservado como fallback de emergencia 1-2 sprints.
- Branch feat/hero-r3f-migration desde feat/consultoria-redesign-v3 — PR
  independiente de PR #2. Validado local typecheck + biome + build (8/8
  paginas estaticas, /consultoria O Static).
```
