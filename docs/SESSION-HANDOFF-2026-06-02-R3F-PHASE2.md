# Handoff R3F Fase 2 — robot rigged cuerpo entero · sesión 2026-06-02 (tarde-noche)

> **Para el agente que va a hacer el siguiente commit al PR #2.**
> Esto es continuación del [handoff hermano `SESSION-HANDOFF-2026-06-02-R3F.md`](./SESSION-HANDOFF-2026-06-02-R3F.md) (Fase 1 R3F POC + GLB optimizado de 14 MB sin rig — ya commiteado en `0f29bad` + `d7e4685`).
> Esta sesión hizo **Fase 2**: regeneración del modelo con cuerpo entero + auto-rigging Mixamo + re-optimización del GLB resultante.

---

## Resumen 1 minuto

1. El director (Juan) regeneró el modelo en 3D AI Studio con **cuerpo entero T-pose** (vs el modelo anterior que tenía brazos cortados).
2. Aplicó **auto-rig de Prism v2.5** con convention **Mixamo** y formato **GLB** (20 créditos). Resultado: GLB de **52.56 MB** con Armature + JOINTS + WEIGHTS.
3. Se aplicó la misma pipeline de Fase 1 + **meshopt level=medium** (skinning-safe). Resultado: **5.16 MB final** (-90% vs el rigged raw, -91% vs el original sin rig).
4. Se hizo swap en `public/models/robot.glb` (5.16 MB rigged) reemplazando el anterior (14 MB sin rig, ahora backup local `robot-static.glb`).
5. Se actualizó `components/sections/HeroR3FPoc.tsx`:
   - Quitada la rotación `[0, -Math.PI / 2, 0]` del group (el GLB Prism viene mirando +Z natural).
   - Camera position ajustada a `[0, 1.05, 1.85]` + fov 32 para framing busto-arriba.
   - OrbitControls target movido a `[0, 1.0, 0]` (centro torso).
6. **POC validado visualmente con cuerpo entero antes del cambio de framing** (screenshot capturado en la sesión). El framing busto-arriba se aplicó al final pero la validación visual se vio interrumpida por memory leak conocido de Next.js Turbopack + R3F + GLB grande con hot reload.
7. **Nada commiteado todavía.** Branch `feat/consultoria-redesign-v3` con cambios locales pendientes.

---

## Decisiones tomadas (NO relitigar)

| Decisión | Valor | Razón |
|---|---|---|
| Modelo nuevo en 3D AI Studio | Cuerpo entero T-pose, casco línea dorada, manos cyborg detalladas, traje completo | El anterior tenía brazos cortados — no servía para Hero web con LookAt + idle |
| Auto-rig engine | Prism v2.5 (no Meshy) | Calidad superior de skinning, marcado "Top", +5 créditos justificados |
| Rig convention | Mixamo (no Default) | Compat con drei `useAnimations`, librería Mixamo gratis aplicable, naming estándar industria |
| Tipo de rig | Biped | Correcto para humanoide |
| Export format | GLB | Para R3F directo sin conversiones |
| Pipeline optimización | `prune + dedup + resize 2048 + webp q92 + meshopt level=medium` | Conservador, skinning-safe (sin `simplify`, sin `weld` con tolerance alta) |
| Modelo decision Prism alternativa | Descartado regenerar de cero | El look del casco con línea dorada es estética distinta pero elegante, alineada con TheoLab |
| Override de color del traje | NO aplicado | El render R3F (ACES + Environment + lighting) hace que el traje se vea oscuro elegante por sí solo — no necesita oscurecimiento extra |
| Cabeza/Body separados en Blender | NO necesario | LookAt sobre el bone `mixamorigHead` rota solo la cabeza vía rig; no requiere separación mesh |

---

## Archivos MODIFICADOS (parte de este handoff)

| Path | Cambio | Tamaño/Notas |
|---|---|---|
| `public/models/robot.glb` | **Swap completo**: era 14.13 MB sin rig → ahora 5.16 MB rigged con Armature + Skin + Mixamo bones | El blob es completamente distinto, no es un diff incremental |
| `components/sections/HeroR3FPoc.tsx` | 3 cambios: (1) `group rotation={[0, 0, 0]}` quitando el `-Math.PI/2`; (2) camera position `[0, 1.05, 1.85]` con fov 32; (3) OrbitControls target `[0, 1.0, 0]`, minDistance 1.4, maxDistance 5 | ~10 líneas modificadas |

## Archivos NUEVOS (parte de este handoff, NO commitear el primero)

| Path | Descripción | Acción git |
|---|---|---|
| `public/models/robot-static.glb` | Backup local del GLB anterior (14 MB, sin rig) por si necesitamos rollback. **NO ES PRODUCCIÓN**. | **Agregar a `.gitignore`** (como ya está `robot-original.glb`). No commitear. |
| `docs/SESSION-HANDOFF-2026-06-02-R3F-PHASE2.md` | Este mismo archivo | Commit |

---

## Lo que el agente debe verificar antes de commitear

```powershell
Set-Location C:\TheoLab\frontend

# 1. Verificar que el GLB en producción tiene rig
Test-Path public\models\robot.glb
# Debe existir
(Get-Item public\models\robot.glb).Length / 1MB
# Debe ser ~5.16 MB

# 2. Verificar contenido del GLB (debe tener Skin/Armature)
npx --yes @gltf-transform/cli@latest inspect public\models\robot.glb 2>&1 | Select-String -Pattern "Armature|JOINTS|WEIGHTS|meshopt"
# Debe mostrar: Armature como scene root, JOINTS_0 + WEIGHTS_0 en attributes,
# EXT_meshopt_compression en extensions

# 3. Verificar typecheck de archivo modificado (sin tocar errores pre-existentes de page.tsx)
npx --yes pnpm@11.3.0 typecheck 2>&1 | Select-String -Pattern "HeroR3FPoc"
# Debe salir vacío. Si aparece error en HeroR3FPoc.tsx hay regresión.

# 4. Verificar biome
npx --yes pnpm@11.3.0 exec biome check components\sections\HeroR3FPoc.tsx
# Debe ser "No fixes applied" sin errores

# 5. Asegurarse que robot-static.glb NO está en stage (debe estar gitignored)
git check-ignore public/models/robot-static.glb
# Debe imprimir el path (confirmando que sí está ignorado)
```

---

## Lo que el agente NO debe tocar

| Archivo | Razón |
|---|---|
| `components/sections/HeroSplite.tsx` | Sigue siendo el Hero de producción con Spline. La migración a R3F es **Fase 3** (próxima sesión, 6-10 h). |
| `app/consultoria/page.tsx` (línea con `<HeroSplite />`) | Misma razón. |
| Cambios pendientes de PR3/PR4/PR5 si los hay en git status | Trabajo de otro agente. |
| Errores TS pre-existentes en `app/consultoria/page.tsx` | NO son de esta sesión. Pertenecen al handoff PR3. NO corregir aquí. |
| Backup local `robot-original.glb` y `robot-static.glb` | NO commitear. Son backups locales. |

---

## Git y commits propuestos

### Estado actual

- Branch: `feat/consultoria-redesign-v3` (la del PR #2 abierto, 9 commits previos)
- Working tree:
  ```
  M components/sections/HeroR3FPoc.tsx
  M public/models/robot.glb
  ?? public/models/robot-static.glb       ← no commitear, gitignored
  ```

### Update al .gitignore

Agregar (después de la línea existente de `robot-original.glb`):

```gitignore
# Backup local del GLB anterior sin rig (14 MB, no producción)
public/models/robot-static.glb
```

### Commits sugeridos (en orden)

**Commit 1** — `.gitignore` update. Archivo: `.gitignore`.

```
chore: gitignore robot-static.glb (backup local del GLB sin rig)
```

**Commit 2** — GLB rigged optimizado. Archivos: `public/models/robot.glb`.

```
chore(assets): swap robot.glb to rigged + meshopt optimized (5.16 MB)

Replaces the 14 MB static GLB with the Prism Auto-Rig output of the
full-body model (T-pose, Mixamo convention, biped, v2.5):
- Full body: head, neck, spine, shoulders, arms, hands (cyborg-detailed),
  hips, legs, feet (vs previous torso-only with truncated arms)
- Armature with Mixamo bone naming (mixamorigHead, mixamorigSpine, etc.)
- 295k vertices (retopologized from 1M) + JOINTS_0/u8 + WEIGHTS_0/u8_norm
- Pipeline: prune → dedup → resize 2048 → WebP q92 → meshopt level=medium
- Visual quality identical to source preview (validated in POC)
- Drei's useGLTF + useMeshOpt loads it without extra deps
- 52.56 MB raw → 5.16 MB (-90%) preserving rig and skinning weights

The static 14 MB backup is gitignored as robot-static.glb for rollback.
```

**Commit 3** — POC adapta al GLB rigged. Archivo: `components/sections/HeroR3FPoc.tsx`.

```
feat(r3f-poc): adapt HeroR3FPoc to rigged GLB + adjust framing

- Remove [0, -PI/2, 0] group rotation (Prism rig comes facing +Z natively)
- Camera position [0, 1.05, 1.85] with fov 32 for bust-up framing
- OrbitControls target [0, 1.0, 0] (center of torso) with minDistance 1.4

POC kept aisladamente in /consultoria/r3f-poc — does NOT touch production
hero (HeroSplite.tsx). Final framing for production hero will be
re-evaluated in Phase 3 in-context with editorial copy.
```

**Commit 4** — handoff doc. Archivo: `docs/SESSION-HANDOFF-2026-06-02-R3F-PHASE2.md`.

```
docs: handoff R3F Fase 2 (robot rigged cuerpo entero)
```

### Comandos exactos

```powershell
Set-Location C:\TheoLab\frontend

# Verificar que estamos en la branch correcta
git branch --show-current
# Debe imprimir: feat/consultoria-redesign-v3

# Commit 1 — gitignore
# (Editar .gitignore añadiendo robot-static.glb antes de commitear)
git add .gitignore
git commit -m "chore: gitignore robot-static.glb (backup local del GLB sin rig)"

# Commit 2 — GLB rigged
git add public/models/robot.glb
git commit -m "$(cat <<'EOF'
chore(assets): swap robot.glb to rigged + meshopt optimized (5.16 MB)

[cuerpo del commit como arriba]
EOF
)"

# Commit 3 — POC
git add components/sections/HeroR3FPoc.tsx
git commit -m "$(cat <<'EOF'
feat(r3f-poc): adapt HeroR3FPoc to rigged GLB + adjust framing

[cuerpo del commit como arriba]
EOF
)"

# Commit 4 — docs
git add docs/SESSION-HANDOFF-2026-06-02-R3F-PHASE2.md
git commit -m "docs: handoff R3F Fase 2 (robot rigged cuerpo entero)"

# Push (la branch ya existe en remoto del PR #2)
git push

# El PR #2 se actualiza solo. NO crear PR nuevo.
```

---

## Limitación conocida descubierta en esta sesión

**Memory leak en Next.js Turbopack con R3F + GLB grande + hard reload.**

Después de la primera carga del POC, hacer hard reload (Ctrl+Shift+R) varias veces hace que el dev server suba a 951+ MB de RAM y empiece a colgar requests. El render process del browser puede llegar a congelarse (CDP timeout).

**Workaround durante desarrollo**:
1. Trabajar con UNA carga por sesión (sin hacer hard reload).
2. Si se cuelga: `taskkill /F /T /PID <pid_3000>` y reiniciar `pnpm dev`.
3. O hacer `pnpm build && pnpm start` para servir build estática sin Turbopack — más lento de iterar pero estable.

**Implicación en producción**: NINGUNA. El build de producción NO tiene Turbopack y NO sufre este memory leak. Es exclusivo del dev server.

**Documentar como TODO**: investigar si Next.js 16.3+ o webpack mode (sin Turbopack) lo resuelve.

---

## Lo que NO está terminado (Fase 3, otra sesión)

**Fase 3 — Migrar HeroSplite.tsx → HeroR3F (6-10 h, sesión completa)**

Migrar el Hero de producción de Spline a R3F. Con el GLB rigged ya integrado, los pasos son:

1. Crear `components/sections/HeroR3F.tsx` con la estructura visual de `HeroSplite.tsx` (Card variant=dark, Spotlight gold, copy column con typewriter + pills + banner reactivo) pero reemplazando el `<SpliteScene>` por `<Canvas>` R3F.
2. Re-calibrar setup HD del POC (alabaster) → setup producción (onyx oscuro): exposure 1.15, Environment `studio`, bloom 0.4.
3. Cablear **LookAt al mouse sobre `mixamorigHead`** usando `useFrame` + slerp suave + `prefers-reduced-motion`. Drei expone `nodes` desde `useGLTF`.
4. **Opcional**: aplicar Mixamo animation "Idle Breathing" (gratis en mixamo.com) baked al rig para idle natural.
5. Decidir framing final (busto-arriba vs cuerpo entero) — probablemente busto-arriba con cabeza y brazos hasta los codos visibles.
6. Cambiar 1 línea de `app/consultoria/page.tsx`: `<HeroSplite />` → `<HeroR3F />`.
7. Mantener `HeroSplite.tsx` en el repo durante 1-2 sprints como fallback de emergencia, luego borrar.
8. Mantener `/consultoria/r3f-poc` aislado durante 1-2 sprints; borrarlo al confirmar Fase 3 producción.

**Reglas de coordinación**: PR3/PR4/PR5 son independientes y NO bloquean Fase 3. Mientras Fase 3 no toque las secciones F02-F09, los dos flujos pueden correr paralelos.

---

## Paths críticos

```
C:/TheoLab/frontend/                                              ← repo
  public/models/robot.glb                                         ← 5.16 MB rigged optimizado (NUEVO, este PR)
  public/models/robot-static.glb                                  ← 14 MB backup (gitignored)
  public/models/robot-original.glb                                ← 57 MB backup original (gitignored)
  components/r3f/Robot.tsx                                        ← useGLTF + meshopt + primitive (sin cambios esta fase)
  components/sections/HeroR3FPoc.tsx                              ← MODIFICADO esta fase (framing + group rotation)
  components/sections/HeroSplite.tsx                              ← NO TOCAR (Hero producción Spline actual)
  app/consultoria/r3f-poc/page.tsx                                ← ruta POC (sin cambios esta fase)
  app/consultoria/page.tsx                                        ← NO TOCAR el slot Hero
  docs/SESSION-HANDOFF-2026-06-02-R3F-PHASE2.md                   ← este archivo
  docs/SESSION-HANDOFF-2026-06-02-R3F.md                          ← handoff Fase 1 R3F
  docs/SESSION-HANDOFF-2026-06-02.md                              ← handoff sesión 1 (PR1/PR2/PR6)
  docs/SESSION-HANDOFF-2026-06-02-PR3-consultoria-migration.md    ← handoff sesión 3 (migración a /consultoria)

C:/Users/juanj/Downloads/
  Robot_in_a_formal_suit_with_outstretched_arms_Rigged_Prism_bef7e74f.glb  ← GLB rigged raw del Auto-Rig de 3D AI Studio
```

---

## Memoria global del director — actualización sugerida

El director mantiene memoria persistente en `C:/Users/juanj/.claude/projects/C--/memory/theolab-rediseno-diagnostico-v3.md`. Agregar la siguiente entrada (al final, no reemplazar lo existente):

```markdown
## Fase 2 R3F completada (sesion 2026-06-02 tarde-noche)

- Modelo regenerado en 3D AI Studio con cuerpo entero T-pose (vs torso truncado anterior).
- Auto-rig Prism v2.5 + Mixamo convention + Biped + GLB. 20 creditos. Resultado: 52.56 MB raw.
- Pipeline gltf-transform: prune+dedup+resize2048+webpq92+meshopt level=medium. Final: 5.16 MB con rig intacto (Armature + JOINTS + WEIGHTS).
- public/models/robot.glb actualizado (M en git, branch feat/consultoria-redesign-v3). 14 MB anterior queda como robot-static.glb gitignored.
- HeroR3FPoc.tsx adaptado: sin rotacion forzada (Prism rig viene mirando +Z), camera [0,1.05,1.85] fov 32 para framing busto-arriba.
- POC en /consultoria/r3f-poc valida calidad visual cuerpo entero.
- Limitacion descubierta: Next Turbopack + R3F + GLB rigged tiene memory leak en hard reload (no afecta produccion).
- Pendiente Fase 3: migrar HeroSplite.tsx -> HeroR3F (6-10 h), LookAt sobre mixamorigHead, posible Mixamo idle animation gratis.
```

---

## Última verificación antes de cerrar PR

Después de los 4 commits:

```powershell
# Verificar que el PR #2 se actualizó automáticamente
gh pr view 2 --repo TheoLab-AI/frontend

# El PR debe mostrar:
# - Branch source: feat/consultoria-redesign-v3
# - 13 commits totales (9 previos + 4 nuevos de Fase 2)
# - Sin conflicts con main

# Vercel preview debería redeployar automáticamente al detectar el push.
# Validar en el preview que /consultoria/r3f-poc carga sin errores.
# Nota: el memory leak del dev server NO afecta el preview Vercel (build de producción).
```
