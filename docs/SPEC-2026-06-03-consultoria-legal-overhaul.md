# Spec — Overhaul de `/consultoria` → `/consultoria-legal` + coherencia, performance y animación

> **Fecha:** 2026-06-03 · **Rama:** `feat/consultoria-legal-overhaul` · **Autor:** Alexis (CTO) con Claude.
> **Status:** en ejecución. Handoff para Juan/Jose — base sólida para sincronizar y continuar.
> **Fuente de verdad de negocio:** [`docs/strategy/modelo-negocio.md`](https://github.com/TheoLab-AI/docs) (O-2, D-2, D-3, TD-3).

## Contexto

Tras integrar los 3 PRs (rediseño v3 + Hero R3F + fix SEO), la landing legal quedó en producción pero con cuatro frentes a resolver, mandato de Alexis con autoridad plena:

1. **Precio fundador — coherencia total.** Se decide mostrarlo público (home + landing legal), sostenerlo con los 10 clientes, y volver al precio regular **de forma manual** cuando estén los 10 fidelizados. Cierra TD-3.
2. **Renombrar `/consultoria` → `/consultoria-legal`** e incorporarla de forma activa y estable al home.
3. **Performance de fondo:** el gate no negociable (Lighthouse ≥95 / LCP <2.5s) está incumplido en la landing (perf 50 / LCP 27.1s / 5.1 MB por el hero R3F). Resolver de raíz + revisión exhaustiva de coherencia y pulcritud de ambas páginas vs el modelo de negocio.
4. **Arreglar la animación del robot** (la cabeza no sigue el cursor).

## Decisiones de diseño (tomadas con autoridad)

- **TD-3 = CERRADA (público).** El precio fundador ($200.000 / $1.200.000) se exhibe anclado contra el regular ($500.000 / $1.500.000), enmarcado como *edición fundadora · 10 cupos* (no "promoción/descuento" — coherente con el posicionamiento "el diferenciador no es el precio"). **Retiro = un solo switch:** quitar `founderPrice` de las opciones en `lib/oferta.ts` → revierte en toda la web vía el helper compartido. El conteo de cupos (`spotsLeft`) es una perilla manual.
- **Fundador en el HOME también:** el embudo del home (`OfferLadder`) pasa a mostrar el split fundador igual que la landing. La home institucional mantiene su narrativa (dos capas, evidencia); el fundador se muestra en el peldaño de Consultoría.
- **Rename:** `git mv app/consultoria app/consultoria-legal`. La subruta experimental `r3f-poc` se **elimina** (no se renombra) — limpieza. Redirect **301** `/consultoria` → `/consultoria-legal` (SEO + enlaces existentes). El nav del home (`SiteHeader`) incorpora el item a `/consultoria-legal` (hoy apunta a `/diagnostico`, ruta inexistente = link roto).
- **Performance (de raíz):** **móvil = poster estático del robot (imagen optimizada), sin three.js**; **desktop (lg+) = canvas R3F** con el GLB cargado **post-LCP** (poster primero, fade-in del canvas) y sin `useGLTF.preload()` eager. Objetivo verificado: Lighthouse mobile ≥95 / LCP <2.5s. *(Cambia la experiencia móvil — sin 3D en teléfonos — a favor de optimización pura.)*
- **Animación:** el bone `tripo::Head_0` existe en el GLB (verificado parseando el contenedor). El fallo es de timing/traverse, no de naming. Fix robusto + verificación en browser de que la cabeza sigue el cursor.

## Plan de fases

| Fase | Qué | Verificación |
|---|---|---|
| **A** | Rename + integración home + borrar `r3f-poc` + redirect 301 + tests de rutas | typecheck/biome/vitest/build/e2e verdes |
| **B** | Home muestra fundador + voltear gates de la vieja premisa + cerrar TD-3 en docs negocio | vitest/e2e verdes; smoke |
| **C** | Poster móvil + canvas diferido desktop + sin preload eager | **Lighthouse mobile ≥95 / LCP <2.5s medido** |
| **D** | Fix head-tracking del robot | **head-follow confirmado en browser** + consola sin error |
| **E** | Auditoría de coherencia/pulcritud vs modelo de negocio (voz, D-2, residuo legacy, escasez en home) | hallazgos documentados + corregidos |

## Reglas de coherencia (de `modelo-negocio.md` / `plan-operativo.md`)

- `/consultoria-legal` habla **solo al socio**: horas recuperadas, riesgo, clientes. **NUNCA** nombra "harness", modelos ni buzzwords (D-2). Voz: español colombiano formal, Sage/Magician (The Archivist).
- El **home institucional** sí muestra las dos capas + evidencia técnica (audiencia técnica/inversión, D-3).
- Matar residuo legacy: `PL ·`, `CONFIDENTIAL`, datos muertos, el item `/diagnostico` roto del nav.
- Precios coherentes desde la fuente única `lib/oferta.ts`; gate de consistencia en `seo.test.ts`.

## Cierre

Al completar y verificar todas las fases: merge a `main` (va a producción) con reporte final, o PR si se prefiere revisión previa. El trabajo queda en commits verdes por fase para que los compañeros lo sigan.
