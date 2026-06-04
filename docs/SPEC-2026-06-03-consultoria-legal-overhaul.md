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

## Resultado (2026-06-03) — qué aterrizó

Las 5 fases completas y verificadas. Rama `feat/consultoria-legal-overhaul`, 7 commits, todos los gates verdes (typecheck · biome · vitest 44 · build · e2e 37) + verificación visual en browser de ambas superficies.

| Fase | Resultado |
|---|---|
| A — Rename + integración | `/consultoria` → `/consultoria-legal` con redirect **301** (e2e); el nav del home enlaza activo; `r3f-poc` + componentes huérfanos eliminados; `SiteHeader` limpio (item `/diagnostico` roto removido). |
| B — Fundador público | El home muestra el split: regular tachado + fundador ("FUNDADOR · 10 cupos"); `FOUNDER_SPOTS_LEFT` = perilla manual única; TD-3 cerrada en los docs de negocio. **Retiro = quitar `founderPrice` en `lib/oferta.ts`** (revierte todo vía el helper). |
| C — Performance | Poster WebP móvil (~2.4 KB, sin three.js) + Canvas diferido a idle + hero en SSR + sin preload eager. **LCP 27.1s → 4.7s · peso 5.1 MB → 474 KB · FCP 1.2s (99) · SI 2.65s (97) · CLS 0.** |
| D — Animación | Head-tracking arreglado: el bone `tripo::Head_0` se sanitiza a `tripoHead_0` al cargar (GLTFLoader elimina `:`) → matcher normalizado. Verificado en browser. |
| E — Coherencia | Wordmark "TheoLab" visible en el header onyx; limpieza de residuo (ruta vieja, ruta Windows del prototipo, refs a PRs, código muerto, placeholder "(PR5)"). Sin fugas técnicas (D-2) ni residuo legacy. |

### ⚠️ Gate de performance: NO alcanzado (59) — es techo de página, no del hero

El objetivo Lighthouse mobile **≥95 no se cumplió** (score actual 59, local `next start`). La regresión de FONDO del hero R3F **sí** se resolvió (LCP 27s→4.7s, peso −91%). El residual son **LCP 4.7s (score 33) + TBT 1.2s (score 20)**, que vienen de la **hidratación de los componentes motion/client de toda la página** (Navbar Radix de 585 líneas + 8 secciones client vs 5 de la home @89) — no del hero. Llegar a ≥95 requiere un **pase de hidratación de todo el sitio** = proyecto separado. Levers diferidos por impacto:

1. Lazy-mount del Radix Dialog del menú móvil (montar solo al abrir).
2. Lazy-hydration de las secciones below-the-fold (Espejo, Diferenciadores, ParaQuien, CTAFinal, FAQ).
3. Desacoplar las animaciones de entrada (motion `initial` opacity 0) del contenido above-the-fold para bajar el LCP.
4. Re-medir en el **preview de Vercel** (CDN + compresión) — el 59 es de `next start` local.

### Observaciones (no tocadas — fuera de alcance / frontera de marca)
- Tagline del home "Tú sabes el qué" (informal) vs "Usted" en la landing legal → decisión de marca, para Juan.
- "Veinte minutos" en `CTAFinal`: coherente con el modelo ("reunión corta"), sin fuente única → para Juan.

## Cierre

Entrega como **PR para revisión** (no merge directo a `main`): hay colaboradores activos (Juan, Jose) y este cambio reestructura el hero + renombra ruta + borra archivos. El PR da preview de Vercel para revisar en infra real y re-medir performance. El usuario mantiene la autoridad de mergear cuando quiera. Commits verdes por fase para que los compañeros sigan el trabajo.
