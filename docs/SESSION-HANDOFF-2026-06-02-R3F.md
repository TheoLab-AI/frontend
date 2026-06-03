# Handoff R3F POC + Optimización GLB · sesión 2026-06-02

> **Para el agente que va a hacer commits y PRs.**
> Lee esto antes de tocar nada. No relitigues decisiones — son del director (Juan).
> El doc hermano [SESSION-HANDOFF-2026-06-02.md](./SESSION-HANDOFF-2026-06-02.md) cubre PR1/PR2/PR6 del rediseño v3 — ese trabajo es independiente de este, también sin commitear.

---

## Resumen 1 minuto

1. Se evaluó **React Three Fiber (R3F)** como reemplazo de Spline para el Hero 3D de `/diagnostico`. Decisión: **migrar**.
2. Se creó un **POC aislado** en `/diagnostico/r3f-poc` que valida visualmente la calidad HD del robot bajo R3F.
3. Se **optimizó el GLB**: 56.95 MB → 14.13 MB (-75%) con `@gltf-transform/cli`, sin pérdida visual.
4. **Aún no se migra el Hero real** (`HeroSplite.tsx` sigue intacto con Spline). Se hará en Fase 3 de una sesión futura.
5. **Nada commiteado todavía.** El agente debe crear los commits aislados que se proponen al final.

---

## Decisiones tomadas (NO relitigar)

| Decisión | Valor | Razón |
|---|---|---|
| Stack 3D producción | React Three Fiber (R3F) | Sin watermark, sin suscripción Spline, control total en TS, alineado con Next 16 + React 19 |
| Cargar el GLB existente | `922f8171beff441b.glb` reutilizado | El modelo PBR del robot-abogado se mantiene; solo se reimplementan los eventos Spline en código |
| Optimización GLB | `prune + dedup + weld + resize 2048 + WebP q92 + meshopt level=medium` | -75% peso, calidad idéntica, sin decoder externo (drei v10 maneja meshopt built-in) |
| `@react-three/drei` v10 obligatoria | drei v9 no soporta React 19 | Verificado en releases oficiales pmndrs |
| Fondo Canvas | Transparente, hereda del padre | En producción se monta dentro del `<Card variant="dark">` del Hero — el bg lo da el card, no el Canvas |
| Setup HD del POC | Fondo alabaster (`#E5E4E2`) con exposure 1.0, Environment `city`, bloom 0.25 | Calibrado para fondo claro; para producción onyx oscuro se vuelve a exposure 1.15, Environment `studio`, bloom 0.4 |
| Blender MCP | Descartado para el caso | El cuello del problema (decidir dónde cortar el mesh) requiere ojo humano viendo viewport; MCP no ahorra ese paso. Para 1 modelo, manual GUI es más eficiente |
| Fase 2 separar Head/Body | Pendiente — depende del director | Diferida: el LookAt rotará todo el cuerpo (igual que Spline actual) hasta que se separe. Sin bloqueo |

---

## Archivos NUEVOS (parte de este handoff)

Crear en commits según se propone al final.

| Path | Descripción | Tamaño |
|---|---|---|
| `components/r3f/Robot.tsx` | Componente cliente que carga `/models/robot.glb` con `useGLTF` + meshopt habilitado | 22 líneas |
| `components/sections/HeroR3FPoc.tsx` | Canvas R3F con setup HD: DPR retina, ACES tone mapping, Environment HDR `city`, 3-point lighting, ContactShadows, EffectComposer + Bloom + SMAA, OrbitControls | 96 líneas |
| `app/diagnostico/r3f-poc/page.tsx` | Ruta POC con `dynamic({ ssr: false })` que importa HeroR3FPoc — aislada, NO afecta `/diagnostico` ni `/` | 33 líneas |
| `public/models/robot.glb` | GLB optimizado con meshopt + WebP textures 2K | 14.13 MB |
| `public/models/robot-original.glb` | Backup del GLB original (no commitear, es solo local) | 56.95 MB |
| `docs/SESSION-HANDOFF-2026-06-02-R3F.md` | Este mismo archivo | - |

## Archivos MODIFICADOS (parte de este handoff)

| Path | Cambio | Notas |
|---|---|---|
| `package.json` | Agregadas deps: `three@0.184.0`, `@react-three/fiber@^9.6.1`, `@react-three/drei@^10.7.7`, `@react-three/postprocessing@^3.0.4`. Dev dep: `@types/three@^0.184.1` | Sin tocar nada existente |
| `pnpm-lock.yaml` | Regenerado por `pnpm add` | -- |

---

## Lo que el agente debe verificar antes de commitear

```powershell
# 1. Estos archivos deben existir en disco
Test-Path C:\TheoLab\frontend\components\r3f\Robot.tsx
Test-Path C:\TheoLab\frontend\components\sections\HeroR3FPoc.tsx
Test-Path C:\TheoLab\frontend\app\diagnostico\r3f-poc\page.tsx
Test-Path C:\TheoLab\frontend\public\models\robot.glb
# robot-original.glb existe pero NO se commitea (ver sección git abajo)

# 2. Los archivos nuevos deben pasar biome sin errores
Set-Location C:\TheoLab\frontend
npx --yes pnpm@11.3.0 exec biome check components/r3f/Robot.tsx components/sections/HeroR3FPoc.tsx app/diagnostico/r3f-poc/page.tsx
# Debe salir: "Checked 3 files. No fixes applied." sin "Some errors were emitted"

# 3. typecheck — IMPORTANTE: hay errores TS pre-existentes en app/diagnostico/page.tsx
# que NO son responsabilidad de esta sesión (son del handoff hermano PR1/PR2/PR6).
# Los archivos nuevos de R3F NO deben aparecer en la lista de errores.
npx --yes pnpm@11.3.0 typecheck 2>&1 | grep -E "r3f|HeroR3FPoc|r3f-poc"
# Debe salir vacío. Si aparece algo, hay regresión que corregir.

# 4. La página POC debe responder 200 con el dev server arriba
curl -s -o nul -w "%{http_code}" http://localhost:3000/diagnostico/r3f-poc
# Debe imprimir: 200

# 5. El GLB optimizado debe servirse
curl -s -o nul -w "%{http_code} %{size_download}" http://localhost:3000/models/robot.glb
# Debe imprimir: 200 14819684 (aprox)
```

---

## Lo que el agente NO debe tocar

| Archivo | Razón |
|---|---|
| `components/sections/HeroSplite.tsx` | Es el Hero actual con Spline. La migración a R3F es **Fase 3** de otra sesión. NO eliminar, NO modificar. |
| `app/diagnostico/page.tsx` (las líneas que renderizan `<HeroSplite />` y `<DiagnosticoHeader />`) | Misma razón: el Hero actual sigue siendo Spline hasta Fase 3. |
| `app/diagnostico/page.tsx` (los errores TS pre-existentes que verás al correr typecheck) | NO son de esta sesión. Pertenecen al handoff hermano. NO los corrijas aquí. |
| Cualquier archivo de PR1/PR2/PR6 listado en `SESSION-HANDOFF-2026-06-02.md` | Trabajo independiente, agente diferente. |

---

## Git y commits propuestos

### Estado actual de git

- Branch: `main`
- Repo limpio en términos de `main` actual, pero **hay un montón de cambios sin commitear de PR1/PR2/PR6 ANTERIORES a esta sesión** (el director los maneja en otro handoff). No mezclar con los de R3F.

### .gitignore — añadir antes del primer commit

```gitignore
# Backup local del GLB original (no producción)
public/models/robot-original.glb
```

### Estrategia de commits

Crear branch nueva desde `main` para aislar el trabajo R3F:

```bash
git checkout -b feat/diagnostico-r3f-poc
```

**Commit 1** — deps de R3F. Archivos: `package.json`, `pnpm-lock.yaml`.

```
feat(deps): add R3F stack for hero 3D evaluation

- three@0.184.0
- @react-three/fiber@^9.6.1 (React 19 support)
- @react-three/drei@^10.7.7 (React 19 support, drei v10 mandatory)
- @react-three/postprocessing@^3.0.4
- @types/three@^0.184.1 (dev)

Prepares for migration of /diagnostico hero from Spline to R3F.
HeroSplite.tsx remains untouched and in production until Phase 3.
```

**Commit 2** — asset GLB optimizado. Archivos: `public/models/robot.glb`, `.gitignore`.

```
chore(assets): add optimized robot GLB (14 MB, meshopt + WebP 2K)

- 56.95 MB → 14.13 MB (-75%) via gltf-transform pipeline:
  prune → dedup → weld → resize 2048 → WebP q92 → meshopt level=medium
- Visual quality identical to original (validated in POC).
- Drei's useGLTF loads with built-in meshopt decoder; no extra deps.
- robot-original.glb kept locally as backup, gitignored.
```

**Commit 3** — POC route + components. Archivos:
- `components/r3f/Robot.tsx`
- `components/sections/HeroR3FPoc.tsx`
- `app/diagnostico/r3f-poc/page.tsx`

```
feat(diagnostico): add R3F POC at /diagnostico/r3f-poc

Isolated proof of concept to evaluate React Three Fiber as Spline
replacement. Does NOT touch /diagnostico or / .

- HD render pipeline: DPR retina, ACES Filmic tone mapping (exposure 1.0),
  Environment HDR `city` preset, 3-point lighting (key from upper-left,
  warm fill from right-frontal, cool rim from back-low), ContactShadows,
  Bloom (intensity 0.25, threshold 0.9), SMAA postprocess.
- Background alabaster (#E5E4E2) for POC contrast eval; Canvas itself
  is transparent and inherits parent bg in production.
- Group rotation -PI/2 on Y corrects the GLB pivot to face camera.
- OrbitControls active for 360° inspection (POC-only; removed in
  Phase 3 production integration).
- dynamic({ ssr: false }) required: three.js touches window at import.
```

**Commit 4** — handoff doc. Archivo: `docs/SESSION-HANDOFF-2026-06-02-R3F.md`.

```
docs: handoff for R3F POC + GLB optimization session
```

### PR sugerido

Después de los 4 commits, abrir PR con base `main`:

- **Título**: `feat(diagnostico): R3F POC + GLB optimization for hero evaluation`
- **Cuerpo**: resumir las 4 secciones — qué se hizo, cómo verificar, qué falta (Fase 2 + Fase 3), qué NO toca este PR.

---

## Lo que NO está terminado (Fases 2 y 3, otra sesión)

Estas tareas quedan documentadas para futuro, NO son parte de este PR.

### Fase 2 — Separar Head/Body en Blender (manual, 15-30 min del director)

El director (Juan) abre el GLB en Blender 4.x, hace loop cut en el cuello, separa con `P > Selection`, renombra Head/Body en Outliner, exporta `robot.glb` reemplazando el actual. Sin guía paso a paso completa aquí — se entregará en la sesión específica de Fase 2.

### Fase 3 — Migrar HeroSplite.tsx → HeroR3F (6-10 h, sesión completa)

Migrar el Hero de producción de Spline a R3F. Incluye:
- Replicar la copy editorial (typewriter "Usted sabe el qué. Nosotros, el cómo."), pills toggleables Horas/Riesgo/Propuestas/Otro, banner reactivo.
- Cablear LookAt al mouse usando `useFrame` + slerp suave + `prefers-reduced-motion`.
- Re-calibrar luces del POC (alabaster) a setup onyx oscuro (exposure 1.15, Environment `studio`, bloom 0.4).
- Cambiar 1 línea de `app/diagnostico/page.tsx` para que use `<HeroR3F />` en vez de `<HeroSplite />`.
- Mantener `HeroSplite.tsx` en el repo durante 1-2 sprints como fallback de emergencia, luego borrar.

---

## Resultados verificables del POC actual

| Métrica | Valor |
|---|---|
| Peso GLB | 14.13 MB (vs 56.95 MB original) |
| Tiempo de carga GLB en localhost | ~0.07 s |
| Tiempo de carga GLB con Spline antes | n/a (sirvió desde CDN externo) |
| Render visible del robot tras navigate | ~10-20 s (incluye descarga del HDR Environment desde CDN drei) |
| Errores de consola | 0 |
| Warnings de consola | 3 cosméticos (THREE.Clock deprecation, PCFSoftShadowMap → PCFShadowMap, shader precision X4122) |
| TypeScript errores en archivos nuevos | 0 |
| Biome errores en archivos nuevos | 0 |

---

## Paths absolutos críticos

```
C:/TheoLab/frontend/                                       ← repo (Next.js 16.2)
  app/diagnostico/r3f-poc/page.tsx                         ← ruta POC nueva
  components/r3f/Robot.tsx                                 ← carga GLB con meshopt
  components/sections/HeroR3FPoc.tsx                       ← Canvas HD
  components/sections/HeroSplite.tsx                       ← NO TOCAR (Hero actual)
  app/diagnostico/page.tsx                                 ← NO TOCAR el slot Hero
  public/models/robot.glb                                  ← 14.13 MB optimizado
  public/models/robot-original.glb                         ← 56.95 MB backup, NO commitear
  package.json                                             ← deps R3F añadidas
  docs/SESSION-HANDOFF-2026-06-02-R3F.md                   ← este archivo
  docs/SESSION-HANDOFF-2026-06-02.md                       ← handoff hermano (PR1/PR2/PR6)

C:/Users/juanj/Downloads/922f8171beff441b.glb              ← GLB original fuente
```

---

## Si algo sale mal

| Síntoma | Causa probable | Fix |
|---|---|---|
| `pnpm typecheck` falla con errores en files R3F nuevos | Drei v10 instalada mal o React 19 mismatch | Verificar `pnpm-lock.yaml` tiene `@react-three/drei@^10.7.7` y `react@19.2.4` |
| `/diagnostico/r3f-poc` da 500 | Dynamic import roto | Verificar que `page.tsx` tiene `'use client'` y `dynamic(...,{ssr:false})` |
| Robot no renderiza en POC, canvas vacío | GLB no cargó, decoder meshopt no activo | Verificar que `Robot.tsx` llama `useGLTF(MODEL_URL, undefined, true)` con `true` en el tercer arg |
| Robot aparece sin reflejos, plano, plástico | Environment HDR no cargó (CDN drei lento) | Esperar más o cambiar preset a `studio` (más liviano) |
| `pnpm dev` cuelga al cargar /diagnostico/r3f-poc | Path del GLB roto | Verificar `Robot.tsx` apunta a `/models/robot.glb` (no `/models/robot-opt.glb`) |
| Robot rota raro al usar OrbitControls | Pivot del GLB | Confirmar que `HeroR3FPoc.tsx` envuelve `<Robot />` en `<group rotation={[0, -Math.PI / 2, 0]}>` |

---

## Memoria global del director ya actualizada

El director mantiene memoria persistente cross-session en `C:/Users/juanj/.claude/projects/C--/memory/theolab-rediseno-diagnostico-v3.md`. Ya se actualizó con el estado de R3F (POC validado, archivos creados, plan 3 fases). NO duplicar info ahí — solo verificar que esté sincronizada si el agente trabaja desde otra sesión.

---

## Última verificación antes de commit

Correr en este orden:

```powershell
Set-Location C:\TheoLab\frontend

# 1. Confirmar branch nueva
git checkout -b feat/diagnostico-r3f-poc

# 2. Stage solo archivos R3F en commits separados (NO `git add -A` — eso barre los de PR1/PR2/PR6)
git add package.json pnpm-lock.yaml
git commit -m "feat(deps): add R3F stack for hero 3D evaluation" # ...usar mensaje completo del proponente

git add .gitignore public/models/robot.glb
git commit -m "chore(assets): add optimized robot GLB (14 MB, meshopt + WebP 2K)"

git add components/r3f/Robot.tsx components/sections/HeroR3FPoc.tsx app/diagnostico/r3f-poc/page.tsx
git commit -m "feat(diagnostico): add R3F POC at /diagnostico/r3f-poc"

git add docs/SESSION-HANDOFF-2026-06-02-R3F.md
git commit -m "docs: handoff for R3F POC + GLB optimization session"

# 3. Push y PR
git push -u origin feat/diagnostico-r3f-poc
gh pr create --base main --title "feat(diagnostico): R3F POC + GLB optimization for hero evaluation" --body-file - <<< "..."
```

**Asegurarse que el `git status` final muestre que NO se commitearon archivos de PR1/PR2/PR6.** Esos van en su propio branch/PR (manejado por otro agente desde el handoff hermano).
