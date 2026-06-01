# Spec — Home institucional enriquecida: carta de presentación con planes

**Status:** DISEÑO APROBADO (Alexis, 2026-06-01, vía brainstorming con companion visual). Listo para plan de implementación.
**Repo:** `TheoLab-AI/frontend` (sobre `main@6e29dfa`, ya en producción).
**Stack:** Next.js 16 (App Router) · Tailwind v4 · Radix · Motion · Biome · pnpm.
**Fuente estratégica:** [`docs/strategy/modelo-negocio.md`](https://github.com/TheoLab-AI/docs) (§1 posicionamiento, §2 dos capas, §4 oferta, §5 D-4). Marca: Design System.

---

## 1. Objetivo

La home (`/`) hoy es correcta pero **mínima** como carta de presentación: Hero · Servicios · Evidencia · Filosofía. El objetivo es convertirla en una **explicación completa de la empresa** que **muestre los planes con sus precios**, sin romper el aislamiento de audiencias (Enfoque A) ni el posicionamiento agnóstico.

**Dirección elegida (C — híbrida + precios):** la home presenta el modelo de servicio y los planes **con precios visibles**, encuadrado como las **dos capas explícitas** — la plataforma agnóstica (qué somos, evidencia técnica, para partners/inversión) **y** el go-to-market actual legal-first con su oferta concreta (prueba de modelo de negocio tangible). La landing `/consultoria` se conserva intacta como destino de conversión legal-first.

> **Tensión resuelta (consciente):** mostrar precios acerca la home a la dirección B y la vuelve menos "agnóstica de precio". Se acepta deliberadamente porque, encuadrado como las dos capas, **suma** (modelo de negocio tangible para inversión) en vez de contaminar. Decisión del fundador, 2026-06-01.

---

## 2. Decisiones cerradas (entradas al diseño)

| # | Decisión |
|---|---|
| **Dirección** | **C — híbrida + precios.** La home muestra los planes; el encuadre es de dos capas (plataforma agnóstica + go-to-market legal con precios). |
| **Precios** | **Solo tarifa regular**: Consultoría inicial **$500.000** / completa **$1.500.000**; Implementación **"A la medida"**. La **edición fundadora ($200.000) NO aparece** (interna, herramienta de cierre — TD-3 ratificado). |
| **Precios en ambas superficies** | La home **y** `/consultoria` muestran los mismos precios → **fuente única de datos** (`lib/oferta.ts`) para que no diverjan. |
| **Fusión** | "Cómo trabajamos" y "Los planes" son **una sola sección** (el embudo *es* el método). Reutiliza el componente `OfferLadder` ya existente. |
| **Propiedad (D-4)** | Sección nueva en la home con **voz institucional** (modelo en capas + IP), distinta de la `OwnershipSection` legal-first de `/consultoria`. |
| **CTA final** | **Opción C — ambos**: CTA directo (`ContactCTA`: WhatsApp + correo, "Agendar reunión de introducción") **+** el puente "¿Dirige una firma legal? → Consultoría" (ya presente en el Hero topline). |
| **Aislamiento** | La home puede nombrar el harness (D-2); `/consultoria` no cambia y sigue sin nombrarlo. La home **no** expone `$200.000`. |

---

## 3. Arquitectura — orden de secciones (App Router)

La home vive en `app/(institucional)/page.tsx`. Orden final (gris = se conserva, ★ = nueva/cambia):

```
Hero            (conserva — dos capas + puente legal en topline)
Servicios       (conserva — 4 líneas)
Cómo trabajamos ★ reutiliza OfferLadder (escalera de 3 peldaños + precios)
Propiedad       ★ nueva — PropiedadCliente (D-4, voz institucional)
Evidencia       (conserva — métricas del harness)
Filosofía       (conserva — 3 principios)
CTA final       ★ nueva — HomeCTA (ContactCTA directo + puente a /consultoria)
Footer          (conserva — en el layout institucional)
```

**Decisión load-bearing — fuente única de datos de la oferta.** Los datos del embudo (peldaños, precios, notas) se extraen de `OfferLadder` a `lib/oferta.ts`. `OfferLadder` (en `/consultoria`) y la home consumen ese módulo. Cambiar un precio en un solo lugar lo cambia en ambas superficies → coherencia por construcción.

---

## 4. Secciones nuevas / cambios (framework de contenido)

El copy final lo valida Juan (C-1); aquí el framework.

### 4.1 "Cómo trabajamos" — reutiliza `OfferLadder`
La escalera de 3 peldaños con precios, tal como existe en `/consultoria`:
- **Reunión de introducción** — *Gratis*. Remota, sin compromiso.
- **Consultoría** — *$500.000* (inicial) / *$1.500.000* (completa). Entrega el Diagnóstico con métricas.
- **Implementación** — *A la medida*. Construcción + operación (6/12 meses).

Se inserta tal cual en la home (mismo componente, datos desde `lib/oferta.ts`). Coherencia de precios garantizada con `/consultoria`.

### 4.2 "Propiedad del cliente" (D-4) — `PropiedadCliente` (nueva, voz institucional)
Mensaje: *"Usted es dueño de su entorno, sus datos, la configuración de sus agentes y su Diagnóstico — desde el primer día y al terminar."* Encuadre **institucional** (no el legal de `/consultoria`): el **modelo en capas** — el *foreground* (entorno, datos, config, Diagnóstico) es del cliente; el **motor/harness es licencia de TheoLab**, operado remotamente. Para inversión/partners esto explica el modelo de IP; para clientes, confidencialidad + sin lock-in. **No** entra en términos de licencia/salida (contrato).

### 4.3 "CTA final" — `HomeCTA` (nueva)
- CTA directo: `<ContactCTA>` (WhatsApp Juan José + correo) — "Agendar reunión de introducción". Reutiliza el componente existente.
- Puente: "¿Dirige una firma legal? → Consultoría" hacia `/consultoria` (refuerza el que ya está en el Hero).

### 4.4 Hero — sin cambios de estructura
El subtitle de dos capas y el puente legal en la topline ya cumplen el encuadre. No se toca salvo que el copy de Juan lo pida.

---

## 5. Componentes

**Crear:**
- `lib/oferta.ts` — fuente única de datos del embudo (los 3 peldaños + precios + notas). Tipos `Step`/`StepOption` (hoy en `OfferLadder`) se mueven aquí.
- `components/institucional/PropiedadCliente.tsx` — D-4 con voz institucional.
- `components/institucional/HomeCTA.tsx` — CTA final (ContactCTA + puente).

**Refactor (sin cambio visual):**
- `components/consultoria/OfferLadder.tsx` — consumir `STEPS` desde `lib/oferta.ts` en vez de hardcodearlos. El render no cambia; `/consultoria` queda idéntica.

**Modificar:**
- `app/(institucional)/page.tsx` — insertar `OfferLadder`, `PropiedadCliente`, `HomeCTA` en el orden de §3.
- `lib/seo.ts` — añadir `ofertaJsonLd()` que emite los `Offer` (500000/1500000 COP) desde `lib/oferta.ts`; la home lo monta junto a `organizationJsonLd`/`servicesJsonLd`.

**Reutilizar sin cambios:** `ContactCTA`, `lib/contact`, `SectionLabel`/`SectionHeading`, variants, tokens, `Hero`, `Services`, `Evidence`, `Philosophy`, `Footer`.

---

## 6. Coherencia home ↔ `/consultoria`

- **Precios:** única fuente `lib/oferta.ts`. Test que verifica `$500.000`/`$1.500.000` presentes y `$200.000` ausente se aplica a **ambas** superficies.
- **Voz:** `OfferLadder` es neutral (no nombra harness) → seguro en ambas. `PropiedadCliente` (home, institucional) ≠ `OwnershipSection` (`/consultoria`, legal) por diseño.
- **`/consultoria` no cambia** salvo el refactor interno de datos (idéntica a la vista).

---

## 7. Voz, copy y promesa

- Home: registro **institucional**, puede nombrar la plataforma/harness (D-2). Promesa canónica **18–27 h/mes** se mantiene.
- Zero-buzzword sigue vigente (prohibidos: AI-powered, disruptive, revolutionary, synergy, leverage, "transformación", "10×", "revolucionar").
- El copy final palabra-por-palabra lo valida Juan (C-1) antes de considerarse definitivo. Este spec fija el framework.

---

## 8. SEO / metadata

- Home (`/`) emite JSON-LD de oferta (`Offer` en COP, desde `ofertaJsonLd()`) además de Organization/Services. Mantener el `<script>` server-side (fix ya aplicado, no `next/script beforeInteractive`).
- `sitemap`/`robots` sin cambios (la home ya está). Title/description institucionales se conservan.

---

## 9. Testing + gate de coherencia

- **Vitest:** `lib/oferta.ts` (datos: precios correctos, sin `$200.000`); `PropiedadCliente` (render + mensaje D-4); `HomeCTA` (links WhatsApp + puente a `/consultoria`). `OfferLadder.test` sigue verde tras el refactor (mismos precios).
- **e2e (extender `home.spec.ts`):** la sección de planes renderiza `$500.000` y `$1.500.000`; el CTA directo (WhatsApp) y el puente a `/consultoria` existen y apuntan bien.
- **Gate de coherencia (`coherence.spec.ts`, extender):** la home **no** contiene `$200.000` (fundador interno) ni `Gases de Occidente` ni `5681603` (ya cubierto). `/consultoria` sin cambios en su gate.
- **Reglas duras:** Biome + `tsc --noEmit` + Vitest + Playwright verdes. Pre-commit obligatorio, nunca `--no-verify`.

---

## 10. Fuera de alcance / diferido

- Copy final palabra-por-palabra (lo valida Juan, C-1).
- Sección "dos capas" dedicada: **no** se crea — el encuadre vive en Hero + Servicios + Evidencia + la sección de planes.
- Edición fundadora pública (TD-3): se mantiene interna.
- Precio de Implementación (TD-2): "A la medida", sin cifra.
- Páginas de pauta, assets HTML legacy del DS: fuera.

---

## 11. Procedencia

- Estrategia: `docs/strategy/modelo-negocio.md` (§1 posicionamiento, §2 dos capas, §4 oferta, §5 D-4, §7 D-2/D-3, §11 TD-2/TD-3).
- Spec previo: `docs/superpowers/specs/2026-06-01-front-dos-niveles-design.md` (Enfoque A, `/consultoria`).
- Decisiones de la sesión de brainstorming Alexis, 2026-06-01 (companion visual): dirección C + precios, precio regular only, fusión cómo-trabajamos+planes, CTA opción C.
