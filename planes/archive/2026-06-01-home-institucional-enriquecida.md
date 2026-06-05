# Home institucional enriquecida — Plan de implementación

> **Estado:** ✅ IMPLEMENTADO — integrado en `main` (2026-06-03). `lib/oferta.ts` (fuente única + helpers de checkout añadidos en PR #5), `lib/contact.ts`, `components/institucional/PropiedadCliente.tsx`, `components/institucional/HomeCTA.tsx`, `OfferLadder` en home, `ofertaJsonLd()` en `lib/seo.ts`. Todos los tests verdes. Los checkboxes `- [ ]` reflejan el plan original; la implementación está completa en `main`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enriquecer la home (`/`) a carta de presentación completa con los planes y precios visibles, sin romper el aislamiento de audiencias ni la coherencia de precios con `/consultoria`.

**Architecture:** Dirección C (híbrida + precios), encuadre de dos capas. Se extraen los datos del embudo a una **fuente única** (`lib/oferta.ts`) que la home y `/consultoria` consumen vía `OfferLadder` (reutilizado). Se añaden dos secciones institucionales nuevas (`PropiedadCliente` D-4, `HomeCTA`) y se monta el JSON-LD de oferta. `/consultoria` no cambia visualmente.

**Tech Stack:** Next.js 16 (App Router) · Tailwind v4 · Radix · Motion · Biome · pnpm. Tests: Vitest (`tests/unit`) + Playwright (`tests/e2e`).

**Spec fuente:** [`docs/superpowers/specs/2026-06-01-home-institucional-enriquecida-design.md`](../../docs/superpowers/specs/2026-06-01-home-institucional-enriquecida-design.md).

---

## Cómo leer este plan

- **Tareas de lógica/datos** (oferta, seo, refactor, ensamble, tests) traen **código completo**.
- **Tareas de UI presentacional** (`PropiedadCliente`, `HomeCTA`) fijan el **contenido textual exacto**, los **ids/roles** que los tests verifican y los **tokens del DS**; el JSX visual lo construye el agente imitando el estilo editorial de `components/sections/*` y `components/consultoria/*` existentes. No se considera completa hasta que su test pasa.
- **Reglas duras:** Biome + `tsc --noEmit` + Vitest + Playwright verdes. Pre-commit obligatorio, **nunca** `--no-verify`. Conventional commits, un concepto por commit.
- **Voz:** la home es **institucional/agnóstica** (puede nombrar la plataforma/harness — D-2). Zero-buzzword. La home **no** expone `$200.000` (fundador interno).

## Convenciones de APIs existentes (no reinventar)

- `cn` desde `@/lib/utils`. `Button` (`@/components/ui/Button`: `variant solid|outline|ghost|accent`, `size`, `asChild`). `Wordmark`, `SectionLabel`/`SectionHeading` (`@/components/ui/SectionLabel`).
- Variants Motion (`@/components/motion/variants`): `fadeUp`, `stagger(delay)`.
- `ContactCTA` (`@/components/ui/ContactCTA`): props `whatsappText?`, `emailSubject?`, `className?` — renderiza enlaces WhatsApp + correo.
- `contact`/`whatsappUrl`/`mailtoUrl` (`@/lib/contact`).
- Utilidades CSS: `container-brand`, `text-display|headline|title|body-lg|body|meta|mono`, `text-brand-gradient`; vars `--color-onyx|alabaster|crimson|gold|burgundy|fg|fg-muted|bg|bg-elevated|divider`.
- Tests unit: `@testing-library/react` + `vitest`, jsdom, alias `@`, setup en `tests/unit/setup.ts`. **Componentes con Motion `whileInView` requieren el polyfill de `IntersectionObserver`** (Task 1 lo hace global).
- Tests e2e: `@playwright/test`, `baseURL http://localhost:3000`.

---

## Mapa de archivos

**Crear:**
- `lib/oferta.ts` — fuente única de datos del embudo (tipos `Step`/`StepOption` + `STEPS`).
- `components/institucional/PropiedadCliente.tsx` — D-4, voz institucional.
- `components/institucional/HomeCTA.tsx` — CTA final (ContactCTA + puente a `/consultoria`).
- `tests/unit/oferta.test.ts`, `tests/unit/PropiedadCliente.test.tsx`, `tests/unit/HomeCTA.test.tsx`.

**Modificar:**
- `tests/unit/setup.ts` — polyfill global de `IntersectionObserver`.
- `components/consultoria/OfferLadder.tsx` — consumir `STEPS`/tipos desde `lib/oferta.ts` (sin cambio visual).
- `lib/seo.ts` — añadir `ofertaJsonLd()` derivado de `lib/oferta.ts`.
- `app/(institucional)/page.tsx` — insertar `OfferLadder`, `PropiedadCliente`, `HomeCTA`.
- `app/(institucional)/layout.tsx` — montar `ofertaJsonLd`.
- `tests/e2e/home.spec.ts` — planes/precios + CTA directo + puente.
- `tests/e2e/coherence.spec.ts` — la home no expone `$200.000`.

**Paralelización en el `/workflow`:** Fase 0 (Tasks 1-4) **secuencial** (fundaciones que el resto consume; el refactor de `OfferLadder` debe preceder a su reutilización). Tasks 5-6 (`PropiedadCliente`, `HomeCTA`) **paralelizables** (archivos disjuntos). Fase integración (Tasks 7-8) **después**.

---

## FASE 0 — Fundaciones (secuencial)

### Task 1: Polyfill global de `IntersectionObserver`

**Files:** Modify `tests/unit/setup.ts`

Motion `whileInView` usa `IntersectionObserver`, ausente en jsdom. Hoy `OfferLadder.test` lo poliyfilla localmente; lo hacemos global para que los componentes nuevos no lo repitan.

- [ ] **Step 1: Editar `tests/unit/setup.ts`** — añadir al final:

```ts
import { vi } from "vitest";

// jsdom no implementa IntersectionObserver; Motion lo necesita para `whileInView`.
if (!("IntersectionObserver" in globalThis)) {
	class MockIntersectionObserver implements IntersectionObserver {
		readonly root = null;
		readonly rootMargin = "";
		readonly thresholds: ReadonlyArray<number> = [];
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
		takeRecords = vi.fn(() => []);
	}
	vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
}
```

- [ ] **Step 2: Run** `pnpm vitest run` → los 15 tests actuales siguen verdes (el polyfill local de `OfferLadder.test` es idempotente, no choca).
- [ ] **Step 3: Commit** `test(setup): polyfill global de IntersectionObserver para Motion en jsdom`.

---

### Task 2: `lib/oferta.ts` — fuente única de datos del embudo

**Files:** Create `lib/oferta.ts`, Test `tests/unit/oferta.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/oferta.test.ts
import { describe, expect, it } from "vitest";
import { STEPS } from "@/lib/oferta";

describe("oferta", () => {
	it("expone los tres peldaños del embudo", () => {
		expect(STEPS.map((s) => s.name)).toEqual([
			"Reunión de introducción",
			"Consultoría",
			"Implementación",
		]);
	});
	it("Consultoría lleva los precios públicos regulares", () => {
		const consultoria = STEPS.find((s) => s.name === "Consultoría");
		const precios = consultoria?.options?.map((o) => o.price) ?? [];
		expect(precios).toContain("$500.000");
		expect(precios).toContain("$1.500.000");
	});
	it("NO incluye el precio fundador en ningún lado", () => {
		expect(JSON.stringify(STEPS)).not.toContain("$200.000");
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run tests/unit/oferta.test.ts` → FAIL (módulo no existe).
- [ ] **Step 3: Crear `lib/oferta.ts`** (mover los datos y tipos hoy en `OfferLadder.tsx`):

```ts
// lib/oferta.ts
export interface StepOption {
	label: string;
	price: string;
	detail: string;
}

export interface Step {
	name: string;
	price: string | null;
	detail?: string;
	options?: readonly StepOption[];
	note?: string;
}

/** Fuente única del embudo. La consumen OfferLadder (/consultoria + home) y ofertaJsonLd. */
export const STEPS: readonly Step[] = [
	{
		name: "Reunión de introducción",
		price: "Gratis",
		detail: "Remota, sin compromiso. Conocemos su caso y validamos el encaje.",
	},
	{
		name: "Consultoría",
		price: null,
		options: [
			{ label: "Inicial", price: "$500.000", detail: "1 sesión de 2 h + el Diagnóstico en una semana." },
			{ label: "Completa", price: "$1.500.000", detail: "Inicial + 4 sesiones en 3 semanas." },
		],
		note: "Entrega el Diagnóstico: dónde la IA recupera horas y baja riesgo, con métricas.",
	},
	{
		name: "Implementación",
		price: "A la medida",
		detail: "Construcción, operación y mantenimiento (6 o 12 meses). Precio definido tras la Consultoría.",
	},
] as const;
```

- [ ] **Step 4: Run** `pnpm vitest run tests/unit/oferta.test.ts` → PASS (3 tests).
- [ ] **Step 5: Commit** `feat(oferta): fuente única de datos del embudo (precios regulares)`.

---

### Task 3: Refactor `OfferLadder` para consumir `lib/oferta.ts`

**Files:** Modify `components/consultoria/OfferLadder.tsx`

El test `tests/unit/OfferLadder.test.tsx` es la red de seguridad (verifica precios). El render no cambia.

- [ ] **Step 1: Editar `OfferLadder.tsx`** — borrar la definición local de `StepOption`/`Step`/`STEPS` e importar de la fuente única:

```tsx
import type { Step } from "@/lib/oferta";
import { STEPS } from "@/lib/oferta";
```
Mantener el resto del componente igual (`OfferLadder`, `StepCard`). El tipo `Step` que usa `StepCard` ahora viene del import.

- [ ] **Step 2: Run** `pnpm vitest run tests/unit/OfferLadder.test.tsx` → PASS (3 tests, sin cambios).
- [ ] **Step 3: Run** `pnpm typecheck` → OK.
- [ ] **Step 4: Commit** `refactor(consultoria): OfferLadder consume la fuente única lib/oferta`.

---

### Task 4: `ofertaJsonLd()` en `lib/seo.ts`

**Files:** Modify `lib/seo.ts`, Test `tests/unit/oferta.test.ts` (extender)

- [ ] **Step 1: Extender el test** (añadir al `describe` de `oferta.test.ts`):

```ts
import { ofertaJsonLd } from "@/lib/seo";
// ...
it("ofertaJsonLd emite los Offer en COP desde la fuente única", () => {
	const ld = ofertaJsonLd();
	const precios = ld.offers.map((o) => o.price);
	expect(precios).toContain("500000");
	expect(precios).toContain("1500000");
	expect(JSON.stringify(ld)).not.toContain("200000");
});
```

- [ ] **Step 2: Run** → FAIL (`ofertaJsonLd` no existe).
- [ ] **Step 3: Añadir a `lib/seo.ts`** (deriva los precios de `lib/oferta` → sin números mágicos duplicados):

```ts
import { STEPS } from "@/lib/oferta";

export function ofertaJsonLd() {
	const consultoria = STEPS.find((s) => s.name === "Consultoría");
	const offers = (consultoria?.options ?? []).map((o) => ({
		"@type": "Offer",
		name: `Consultoría ${o.label.toLowerCase()}`,
		price: o.price.replace(/[^0-9]/g, ""),
		priceCurrency: "COP",
	}));
	return {
		"@context": "https://schema.org",
		"@type": "Service",
		serviceType: "Adopción de IA empresarial",
		provider: { "@type": "Organization", name: brand.name },
		areaServed: { "@type": "Country", name: "Colombia" },
		offers,
	};
}
```

- [ ] **Step 4: Run** `pnpm vitest run tests/unit/oferta.test.ts` → PASS (4 tests).
- [ ] **Step 5: Commit** `feat(seo): ofertaJsonLd derivado de la fuente única del embudo`.

---

## FASE 1 — Secciones institucionales nuevas (paralelizables tras Fase 0)

Presentacionales, `"use client"` con `fadeUp`/`stagger` (como `components/sections/*`). Cada una expone un `id` para los e2e.

### Task 5: `PropiedadCliente` (D-4, voz institucional)

**Files:** Create `components/institucional/PropiedadCliente.tsx`, Test `tests/unit/PropiedadCliente.test.tsx`

Contenido (`<section id="propiedad-cliente">`, `SectionLabel index="03" label="Propiedad del cliente"`):
- Titular: *"Usted es dueño de lo que construimos para usted."*
- Bajada: *"Su entorno, sus datos, la configuración de sus agentes y su Diagnóstico son suyos — desde el primer día y al terminar."*
- Modelo en capas (dos puntos):
  - **Lo suyo es suyo** — *"El entorno, los datos, la configuración y el Diagnóstico viven en su infraestructura. No los concentramos."*
  - **El motor es nuestro, operado por usted sin fricción** — *"La plataforma que lo hace posible es licencia de TheoLab, que operamos remotamente. Usted obtiene el resultado sin heredar complejidad técnica ni quedar atado a un proveedor."*

Voz institucional/agnóstica (no "socio"/"firma"/"secreto profesional"). Puede nombrar la plataforma.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/PropiedadCliente.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PropiedadCliente } from "@/components/institucional/PropiedadCliente";

describe("PropiedadCliente", () => {
	it("afirma la propiedad del cliente (D-4)", () => {
		render(<PropiedadCliente />);
		expect(screen.getByText(/dueño/i)).toBeInTheDocument();
		expect(screen.getByText(/Diagnóstico/i)).toBeInTheDocument();
	});
	it("explica el modelo en capas (motor licenciado)", () => {
		const { container } = render(<PropiedadCliente />);
		expect(container.textContent?.toLowerCase()).toContain("licencia");
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run tests/unit/PropiedadCliente.test.tsx` → FAIL.
- [ ] **Step 3: Implementar** `PropiedadCliente` (presentacional; `container-brand`, `text-headline`/`text-body-lg`, `SectionLabel`, `fadeUp`/`stagger`). Imitar el layout de `OwnershipSection` pero con la voz institucional de arriba.
- [ ] **Step 4: Run** → PASS (2 tests).
- [ ] **Step 5: Commit** `feat(home): sección de propiedad del cliente (D-4, voz institucional)`.

---

### Task 6: `HomeCTA` (CTA final)

**Files:** Create `components/institucional/HomeCTA.tsx`, Test `tests/unit/HomeCTA.test.tsx`

Contenido (`<section id="home-cta">`):
- Titular: *"Demos el primer paso."*
- Bajada: *"La reunión de introducción es gratuita y sin compromiso."*
- `<ContactCTA whatsappText="Hola, quiero agendar una reunión de introducción con TheoLab." emailSubject="Reunión de introducción — TheoLab" />`
- Puente legal: un `<Link href="/consultoria">` rotulado *"¿Dirige una firma legal? Vea la propuesta para su firma →"* (estilo `text-meta`, `--color-fg-muted`, hover `--color-crimson`).

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/HomeCTA.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeCTA } from "@/components/institucional/HomeCTA";

describe("HomeCTA", () => {
	it("ofrece el CTA directo de WhatsApp", () => {
		render(<HomeCTA />);
		const wa = screen.getByRole("link", { name: /whatsapp/i });
		expect(wa).toHaveAttribute("href", "https://wa.me/573182395252");
	});
	it("ofrece el puente a /consultoria", () => {
		render(<HomeCTA />);
		const bridge = screen.getByRole("link", { name: /firma legal/i });
		expect(bridge).toHaveAttribute("href", "/consultoria");
	});
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implementar** `HomeCTA` (usa `ContactCTA` + `next/link`; tokens del DS).
- [ ] **Step 4: Run** → PASS (2 tests).
- [ ] **Step 5: Commit** `feat(home): CTA final (reunión directa + puente a /consultoria)`.

---

## FASE 2 — Integración (secuencial)

### Task 7: Ensamblar la home + JSON-LD de oferta

**Files:** Modify `app/(institucional)/page.tsx`, `app/(institucional)/layout.tsx`

- [ ] **Step 1: `app/(institucional)/page.tsx`** — insertar las secciones en orden:

```tsx
import { Evidence } from "@/components/sections/Evidence";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Services } from "@/components/sections/Services";
import { OfferLadder } from "@/components/consultoria/OfferLadder";
import { PropiedadCliente } from "@/components/institucional/PropiedadCliente";
import { HomeCTA } from "@/components/institucional/HomeCTA";

export default function HomePage() {
	return (
		<>
			<main id="main" className="flex-1">
				<Hero />
				<Services />
				<OfferLadder />
				<PropiedadCliente />
				<Evidence />
				<Philosophy />
				<HomeCTA />
			</main>
			<Footer />
		</>
	);
}
```

- [ ] **Step 2: `app/(institucional)/layout.tsx`** — montar el JSON-LD de oferta junto a los existentes:

```tsx
import { organizationJsonLd, servicesJsonLd, ofertaJsonLd } from "@/lib/seo";
// ...dentro del fragmento, tras ld-services:
<JsonLd id="ld-oferta" data={ofertaJsonLd()} />
```

- [ ] **Step 3: Run** `pnpm typecheck && pnpm build` → OK, `/` se genera estática.
- [ ] **Step 4: Commit** `feat(home): ensamblar planes + propiedad + CTA en la home institucional`.

---

### Task 8: e2e de la home + gate de coherencia

**Files:** Modify `tests/e2e/home.spec.ts`, `tests/e2e/coherence.spec.ts`

- [ ] **Step 1: Extender `home.spec.ts`** (dentro del `describe`):

```ts
test("muestra los planes con precios públicos", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("#oferta")).toBeVisible();
	const body = (await page.locator("body").textContent()) ?? "";
	expect(body).toContain("$500.000");
	expect(body).toContain("$1.500.000");
});

test("ofrece el CTA directo y la propiedad del cliente", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("#propiedad-cliente")).toBeVisible();
	await expect(page.locator("#home-cta")).toBeVisible();
	const wa = page.getByRole("link", { name: /whatsapp/i }).first();
	await expect(wa).toHaveAttribute("href", /wa\.me\/573182395252/);
});
```

- [ ] **Step 2: Extender `coherence.spec.ts`** — añadir al test de la home (o uno nuevo) que la home **no** expone el precio fundador:

```ts
test("la home no expone el precio fundador (interno)", async ({ page }) => {
	await page.goto("/");
	const body = (await page.locator("body").textContent()) ?? "";
	expect(body).not.toContain("$200.000");
});
```

- [ ] **Step 3: Run** `pnpm test:e2e tests/e2e/home.spec.ts tests/e2e/coherence.spec.ts` → PASS.
- [ ] **Step 4: Run el suite completo** `pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` → todo verde.
- [ ] **Step 5: Commit** `test(home): planes/precios, CTA y gate de coherencia del precio fundador`.

---

## Self-review (cobertura del spec)

| Requisito del spec | Task(s) |
|---|---|
| Fuente única de datos de oferta (coherencia de precios) | Task 2 + Task 3 |
| Sección "Cómo trabajamos" en la home (reutiliza OfferLadder) | Task 7 |
| Sección "Propiedad del cliente" (D-4, voz institucional) | Task 5 |
| CTA final opción C (directo + puente) | Task 6 |
| Precio regular only, sin $200.000 en la home | Task 2, Task 4, Task 8 |
| JSON-LD de oferta en la home | Task 4 + Task 7 |
| Orden de secciones del spec §3 | Task 7 |
| `/consultoria` sin cambio visual | Task 3 (refactor interno) |
| Gate de coherencia extendido | Task 8 |
| Polyfill para tests de componentes Motion | Task 1 |

**Pendientes del spec que NO entran (por diseño):** copy final palabra-por-palabra (lo valida Juan, C-1), sección "dos capas" dedicada (el encuadre vive en Hero + Servicios + Evidencia + planes), edición fundadora pública (interna, TD-3), precio Implementación (TD-2), páginas de pauta.

**Consistencia de tipos:** `Step`/`StepOption`/`STEPS` (Task 2) consumidos por `OfferLadder` (Task 3) y `ofertaJsonLd` (Task 4); ids `#oferta` (OfferLadder), `#propiedad-cliente` (Task 5), `#home-cta` (Task 6) usados en los e2e (Task 8).
