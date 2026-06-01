# Front de dos niveles (D-3) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestructurar el front de una landing de página única a una web de dos niveles: home institucional (`/`) + landing legal-first de conversión (`/consultoria`).

**Architecture:** Enfoque A — dos superficies con design system compartido y **sin navegación común**. El root layout queda neutro; un route group `(institucional)` da nav+footer a la home; `consultoria/` tiene header ligero y footer mínimo, sin fugas de atención. La landing nunca nombra el harness; la home sí (D-2).

**Tech Stack:** Next.js 16 (App Router) · Tailwind v4 · Radix · Motion · Biome · pnpm. Tests: Vitest (`tests/unit`) + Playwright (`tests/e2e`).

**Spec fuente:** [`docs/superpowers/specs/2026-06-01-front-dos-niveles-design.md`](../specs/2026-06-01-front-dos-niveles-design.md).

---

## Cómo leer este plan

- **Tareas de infraestructura/lógica** (contacto, layouts, SEO, sitemap, tests) traen **código completo**.
- **Tareas de UI presentacional** (secciones de la landing) fijan el **contenido textual exacto** (del spec, ya aprobado), las **props/ids/roles** que los tests verifican, y los **tokens del DS** a usar. El JSX visual fino lo construye el agente aplicando el Design System (`docs/brand/design-system`) y, si está disponible, el skill `frontend-design`. El test de cada tarea define el resultado observable: **no se considera completa hasta que su test pasa**.
- **Reglas duras del repo:** Biome lint + `tsc --noEmit` + Vitest deben pasar. Pre-commit hooks obligatorios, **nunca** `--no-verify`. Conventional commits, un concepto por commit.
- **Voz:** español colombiano formal; zero-buzzword; en `/consultoria` jamás aparecen "harness", "modelo", nombres de LLM.

## Convenciones de APIs existentes (no reinventar)

- `cn` desde `@/lib/utils`.
- `Button` (`@/components/ui/Button`): props `variant` (`solid|outline|ghost|accent`), `size` (`sm|md|lg`), `asChild`. Para envolver `<a>`/`<Link>`: `<Button asChild><Link …/></Button>`.
- `Wordmark` (`@/components/ui/Wordmark`): props `size` (`sm|md|lg|xl`), `as` (`h1|h2|div|span`).
- `SectionLabel` + `SectionHeading` desde `@/components/ui/SectionLabel`.
- Variants Motion (`@/components/motion/variants`): `fadeUp`, `fadeIn`, `slideInLeft`, `stagger(delay)`, `heroDisplayReveal`.
- Tokens de marca (`@/lib/tokens`): `brand.name/tagline/subtitle/domain/github/locale`, `colors`, `typography`, `motion`.
- Utilidades CSS (en `app/globals.css`): `container-brand`, `text-display|headline|title|body-lg|body|meta|mono`, `text-brand-gradient`, `divider-brand`; colores `var(--color-onyx|alabaster|crimson|gold|burgundy|fg|fg-muted|bg|bg-elevated|divider)`.
- Tests unit: `@testing-library/react` (`render`, `screen`) + `vitest` (`describe/it/expect`), alias `@`, entorno jsdom, setup en `tests/unit/setup.ts`.
- Tests e2e: `@playwright/test` (`test`, `expect`, `page`), `baseURL http://localhost:3000`, levanta `pnpm dev`.

---

## Mapa de archivos

**Crear:**
- `lib/contact.ts` — fuente única de datos de contacto (WhatsApp Juan José, email) + helpers de URL.
- `components/ui/ContactCTA.tsx` — botones de contacto (WhatsApp + email), reutilizable.
- `components/institucional/InstitutionalNav.tsx` — nav ligera de la home (wordmark + anclas + puente a `/consultoria`).
- `app/(institucional)/layout.tsx` — layout de la home: nav + footer + JSON-LD institucional.
- `app/(institucional)/page.tsx` — la home (mueve el contenido actual de `app/page.tsx`).
- `components/consultoria/ConsultoriaHeader.tsx`
- `components/consultoria/ConsultoriaHero.tsx`
- `components/consultoria/ProblemSection.tsx`
- `components/consultoria/ValueProp.tsx`
- `components/consultoria/OfferLadder.tsx`
- `components/consultoria/OwnershipSection.tsx`
- `components/consultoria/ConsultoriaCTA.tsx`
- `components/consultoria/ConsultoriaFooter.tsx`
- `app/consultoria/layout.tsx` — header ligero + footer mínimo + metadata propia + JSON-LD Service/Offer.
- `app/consultoria/page.tsx` — ensambla las 7 secciones.
- `tests/unit/contact.test.ts`, `tests/unit/ContactCTA.test.tsx`, `tests/unit/OfferLadder.test.tsx`, `tests/unit/ConsultoriaHero.test.tsx`
- `tests/e2e/consultoria.spec.ts`, `tests/e2e/coherence.spec.ts`

**Modificar:**
- `app/layout.tsx` — quitar el JSON-LD global (se mueve a la home); mantener html/body/fuentes/metadata base.
- `app/page.tsx` — eliminar (su contenido se mueve al route group). *O* convertir en redirect interno si App Router lo exige; ver Task 4.
- `components/sections/Hero.tsx` — subtitle de dos capas + puente a `/consultoria`.
- `components/sections/Services.tsx` — eliminar el proof "Asesora de Gases de Occidente".
- `lib/seo.ts` — añadir `consultoriaServiceJsonLd()`.
- `app/sitemap.ts`, `app/robots.ts` — añadir `/consultoria`.

**Paralelización en el `/workflow`:** Fase 0 (Tasks 1-3) es secuencial — fundaciones que todo lo demás importa. Fase 1 (home) y Fase 2 (componentes de `/consultoria`, Tasks 6-11) son **paralelizables** (un archivo por agente, sin solापamiento). El ensamblaje (`page.tsx`, Task 12) y la Fase 3 (SEO/gate, Tasks 13-16) van **después** de sus componentes.

---

## FASE 0 — Fundaciones (secuencial)

### Task 1: Datos de contacto (`lib/contact.ts`)

**Files:**
- Create: `lib/contact.ts`
- Test: `tests/unit/contact.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/contact.test.ts
import { describe, expect, it } from "vitest";
import { contact, mailtoUrl, whatsappUrl } from "@/lib/contact";

describe("contact", () => {
  it("expone el WhatsApp de Juan José sin separadores", () => {
    expect(contact.whatsapp.number).toBe("573182395252");
  });

  it("usa el correo operativo real", () => {
    expect(contact.email).toBe("admin@theolab.tech");
  });

  it("whatsappUrl arma el enlace wa.me y codifica el texto", () => {
    expect(whatsappUrl()).toBe("https://wa.me/573182395252");
    expect(whatsappUrl("Hola TheoLab")).toBe("https://wa.me/573182395252?text=Hola%20TheoLab");
  });

  it("mailtoUrl arma el mailto y codifica el asunto", () => {
    expect(mailtoUrl()).toBe("mailto:admin@theolab.tech");
    expect(mailtoUrl("Reunión")).toBe("mailto:admin@theolab.tech?subject=Reuni%C3%B3n");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/contact.test.ts`
Expected: FAIL — `Cannot find module '@/lib/contact'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/contact.ts
export const contact = {
  whatsapp: {
    number: "573182395252",
    display: "+57 318 2395252",
    owner: "Juan José",
  },
  email: "admin@theolab.tech",
} as const;

export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${contact.whatsapp.number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function mailtoUrl(subject?: string): string {
  const base = `mailto:${contact.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/contact.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/contact.ts tests/unit/contact.test.ts
git commit -m "feat(contact): fuente única de datos de contacto (WhatsApp + email)"
```

---

### Task 2: Componente `ContactCTA`

**Files:**
- Create: `components/ui/ContactCTA.tsx`
- Test: `tests/unit/ContactCTA.test.tsx`

Contrato: renderiza dos enlaces — WhatsApp (primario, `Button variant="accent"`) y email (`Button variant="outline"`). Props: `whatsappText?: string`, `emailSubject?: string`, `className?: string`. Los `<a>` usan `whatsappUrl()`/`mailtoUrl()` de Task 1, abren en pestaña nueva con `rel="noreferrer noopener"`, y exponen `aria-label`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/ContactCTA.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactCTA } from "@/components/ui/ContactCTA";

describe("ContactCTA", () => {
  it("enlaza al WhatsApp de Juan José", () => {
    render(<ContactCTA />);
    const wa = screen.getByRole("link", { name: /whatsapp/i });
    expect(wa).toHaveAttribute("href", "https://wa.me/573182395252");
  });

  it("enlaza al correo operativo", () => {
    render(<ContactCTA />);
    const mail = screen.getByRole("link", { name: /correo|email/i });
    expect(mail).toHaveAttribute("href", "mailto:admin@theolab.tech");
  });

  it("codifica el texto del WhatsApp cuando se pasa", () => {
    render(<ContactCTA whatsappText="Quiero la reunión de introducción" />);
    const wa = screen.getByRole("link", { name: /whatsapp/i });
    expect(wa.getAttribute("href")).toContain("?text=");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/ContactCTA.test.tsx`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Write minimal implementation**

```tsx
// components/ui/ContactCTA.tsx
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mailtoUrl, whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/utils";

interface ContactCTAProps {
  whatsappText?: string;
  emailSubject?: string;
  className?: string;
}

export function ContactCTA({ whatsappText, emailSubject, className }: ContactCTAProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <Button size="lg" variant="accent" asChild>
        <a
          href={whatsappUrl(whatsappText)}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Escribir por WhatsApp"
        >
          <MessageCircle aria-hidden="true" />
          Agendar reunión de introducción
        </a>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <a href={mailtoUrl(emailSubject)} aria-label="Escribir por correo">
          <Mail aria-hidden="true" />
          Escribir por correo
        </a>
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/ContactCTA.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/ContactCTA.tsx tests/unit/ContactCTA.test.tsx
git commit -m "feat(ui): ContactCTA reutilizable (WhatsApp + correo)"
```

---

### Task 3: Refactor de layouts a Enfoque A

**Files:**
- Modify: `app/layout.tsx` (quitar JSON-LD global; queda html/body/fuentes/metadata base)
- Create: `app/(institucional)/layout.tsx`, `app/(institucional)/page.tsx`
- Delete: `app/page.tsx` (su contenido pasa al route group)
- Create: `components/institucional/InstitutionalNav.tsx`

Objetivo: el root deja de imponer nav/footer/JSON-LD; la home vive en el route group `(institucional)` (URL sigue siendo `/`) con su propio layout (nav + footer + JSON-LD `Organization`/`Service`). Así `/consultoria` no hereda nada institucional.

- [ ] **Step 1: Mover la home al route group.** Crear `app/(institucional)/page.tsx` con el contenido actual de `app/page.tsx` (imports de `@/components/sections/*`). Borrar `app/page.tsx`.

```tsx
// app/(institucional)/page.tsx
import { Evidence } from "@/components/sections/Evidence";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Services } from "@/components/sections/Services";

export default function HomePage() {
  return (
    <>
      <InstitutionalNavSlot />
      <main id="main" className="flex-1">
        <Hero />
        <Services />
        <Evidence />
        <Philosophy />
      </main>
      <Footer />
    </>
  );
}
```
> Nota: `InstitutionalNavSlot` se resuelve en el layout (Step 3), no en la page. Si se prefiere la nav en el layout, omitir esta línea de la page. Mantener una sola fuente.

- [ ] **Step 2: Crear `InstitutionalNav`.** Wordmark (`size="sm"`, `as="span"`) + anclas a `#services`/`#evidence`/`#philosophy` + un `Button variant="ghost" asChild` con `<Link href="/consultoria">` rotulado "Para firmas legales". Sticky opcional. Usar `container-brand`, `text-meta`.

```tsx
// components/institucional/InstitutionalNav.tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";

const LINKS = [
  { href: "#services", label: "Servicios" },
  { href: "#evidence", label: "Evidencia" },
  { href: "#philosophy", label: "Filosofía" },
] as const;

export function InstitutionalNav() {
  return (
    <header className="border-b border-[var(--color-divider)]">
      <nav aria-label="Principal" className="container-brand flex items-center justify-between py-4">
        <Link href="/" aria-label="Inicio">
          <Wordmark size="sm" />
        </Link>
        <div className="flex items-center gap-6">
          <ul className="hidden md:flex items-center gap-6">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-meta text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/consultoria">Para firmas legales</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Crear `app/(institucional)/layout.tsx`.** Renderiza `InstitutionalNav` + `children` + JSON-LD `Organization` y `Service` (movidos del root). Exporta `metadata` institucional propia.

```tsx
// app/(institucional)/layout.tsx
import type { Metadata } from "next";
import { InstitutionalNav } from "@/components/institucional/InstitutionalNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, servicesJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function InstitucionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd id="ld-organization" data={organizationJsonLd()} />
      <JsonLd id="ld-services" data={servicesJsonLd()} />
      <InstitutionalNav />
      {children}
    </>
  );
}
```
> Si el Step 1 dejó `<InstitutionalNavSlot/>` en la page, eliminarlo: la nav vive aquí en el layout. Una sola fuente.

- [ ] **Step 4: Limpiar `app/layout.tsx`.** Quitar `<JsonLd …/>` del body y los imports de `@/lib/seo`. Mantener fuentes, `metadata` base (title template, OG, robots, icons) y `<body className="flex min-h-dvh flex-col …">{children}</body>`.

- [ ] **Step 5: Verificar build + tests + e2e home.**

Run: `pnpm typecheck && pnpm build`
Expected: build OK, `/` se genera.
Run: `pnpm test:e2e tests/e2e/home.spec.ts`
Expected: PASS — la home sigue mostrando hero, 5 secciones y JSON-LD `Organization` (ahora desde el layout institucional). Si el test de "5 sections" falla por la nueva nav, ajustar selectores en Task 4.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx "app/(institucional)" components/institucional tests
git rm app/page.tsx
git commit -m "refactor(layout): web de dos niveles — root neutro + route group institucional"
```

---

## FASE 1 — Home institucional (paralelizable tras Fase 0)

### Task 4: Refinar `Hero` (dos capas + puente legal)

**Files:**
- Modify: `components/sections/Hero.tsx`
- Test: `tests/e2e/home.spec.ts` (extender)

Cambios de contenido (sin tocar la animación ni el motivo editorial ya depurado `TL · 01 / 04`):
- Subtitle: narrativa de dos capas. Texto: *"Empresa de adopción de IA empresarial. Plataforma agnóstica por diseño; entrada legal-first. Construimos infraestructura, modelos y agentes medibles."* (puede salir de `brand.subtitle` si se actualiza el token; si se actualiza el token, ajustar también `lib/seo.ts`/metadata que lo consumen).
- Añadir CTA secundario que sea **puente**: `Button variant="outline" asChild` con `<Link href="/consultoria">` rotulado *"¿Dirige una firma legal?"*.

- [ ] **Step 1: Extender el test e2e de la home** (en `tests/e2e/home.spec.ts`, dentro del `describe`):

```ts
test("ofrece puente a la landing legal", async ({ page }) => {
  await page.goto("/");
  const bridge = page.getByRole("link", { name: /firma legal/i });
  await expect(bridge.first()).toBeVisible();
  await expect(bridge.first()).toHaveAttribute("href", "/consultoria");
});
```

- [ ] **Step 2: Run** `pnpm test:e2e tests/e2e/home.spec.ts` → FAIL (no existe el link).
- [ ] **Step 3:** Implementar el cambio en `Hero.tsx`: añadir, junto al CTA actual, `<Button size="lg" variant="outline" asChild><Link href="/consultoria">¿Dirige una firma legal?<ArrowRight aria-hidden="true" /></Link></Button>` (importar `Link` de `next/link`). Ajustar el subtitle.
- [ ] **Step 4: Run** el test → PASS.
- [ ] **Step 5: Commit** `feat(home): hero de dos capas + puente a /consultoria`.

---

### Task 5: Refinar `Services` (eliminar caso no verificable)

**Files:**
- Modify: `components/sections/Services.tsx`
- Test: `tests/e2e/coherence.spec.ts` (se crea en Task 15; aquí solo se elimina el dato)

- [ ] **Step 1:** En `SERVICES`, en el item `index: "03"` (Automatización y agentes), reemplazar `proof: "Caso vivo · Asesora de Gases de Occidente"` por `proof: "Implementaciones a medida · pipeline abierto"`.
- [ ] **Step 2: Run** `pnpm typecheck && pnpm vitest run` → PASS (sin regresiones).
- [ ] **Step 3: Run** búsqueda de coherencia:

```bash
grep -rn "Gases de Occidente" components app && echo "RESIDUO" || echo "LIMPIO"
```
Expected: `LIMPIO`.

- [ ] **Step 4: Commit** `fix(home): retirar caso no verificable de Services (tracción cero declarada)`.

---

## FASE 2 — Landing legal `/consultoria` (componentes paralelizables tras Fase 0)

Voz formal (usted), zero-buzzword, **sin** "harness"/modelos. Cada componente expone un `id` o `data-section` para los e2e. Contenido textual = framework del spec §5.

### Task 6: `ConsultoriaHeader` + `ConsultoriaHero`

**Files:**
- Create: `components/consultoria/ConsultoriaHeader.tsx`, `components/consultoria/ConsultoriaHero.tsx`
- Test: `tests/unit/ConsultoriaHero.test.tsx`

Contenido:
- **Header ligero:** `Wordmark size="sm"` enlazado a `/consultoria` + un único `ContactCTA` compacto (o un `Button accent` "Agendar reunión"). **Sin** anclas de navegación.
- **Hero (`<section id="consultoria-hero">`):** headline *"Recupere entre 18 y 27 horas profesionales al mes. Medidas, no prometidas."* · subhead *"Inteligencia artificial aplicada a firmas legales colombianas: criterio sobre dónde recupera horas y baja riesgo."* · `<ContactCTA whatsappText="Hola, quiero agendar la reunión de introducción para mi firma." emailSubject="Reunión de introducción — TheoLab" />`.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/ConsultoriaHero.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConsultoriaHero } from "@/components/consultoria/ConsultoriaHero";

describe("ConsultoriaHero", () => {
  it("muestra la promesa canónica 18–27", () => {
    render(<ConsultoriaHero />);
    expect(screen.getByText(/18/)).toBeInTheDocument();
    expect(screen.getByText(/27/)).toBeInTheDocument();
  });
  it("no nombra el harness ni modelos", () => {
    const { container } = render(<ConsultoriaHero />);
    expect(container.textContent?.toLowerCase()).not.toContain("harness");
  });
});
```

- [ ] **Step 2: Run** `pnpm vitest run tests/unit/ConsultoriaHero.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar `ConsultoriaHero` (cliente, usa `fadeUp`/`stagger`, `text-headline`/`text-display`, `container-brand`, `text-brand-gradient` en "18–27" si se desea) y `ConsultoriaHeader`. Aplicar el Design System / `frontend-design`.
- [ ] **Step 4: Run** el test → PASS.
- [ ] **Step 5: Commit** `feat(consultoria): header ligero + hero de conversión`.

---

### Task 7: `ProblemSection`

**Files:** Create `components/consultoria/ProblemSection.tsx`.

Contenido (`<section id="problema">`, `SectionLabel index="01" label="El problema"`): tres dolores del socio, en su lenguaje:
1. *"Una propuesta perdida porque el competidor respondió primero."*
2. *"Un junior usando ChatGPT con información confidencial de sus clientes, sin control."*
3. *"El equipo desbordado en tareas que no facturan."*
Cierre: *"La IA mal adoptada es riesgo. Bien adoptada, son horas recuperadas."*

- [ ] **Step 1:** Implementar la sección (presentacional; `fadeUp`/`stagger`, grid de 3, tokens del DS). Exponer `id="problema"`.
- [ ] **Step 2: Run** `pnpm typecheck` → OK.
- [ ] **Step 3: Commit** `feat(consultoria): sección de problema (trigger del socio)`.

---

### Task 8: `ValueProp`

**Files:** Create `components/consultoria/ValueProp.tsx`.

Contenido (`<section id="valor">`, `SectionLabel index="02" label="Qué hacemos"`): los tres diferenciadores, traducidos:
1. **Vertical legal** — *"Hablamos el lenguaje del socio, no el del consultor de tecnología."*
2. **Usted es dueño de lo suyo** — *"Su entorno, sus datos y su Diagnóstico son suyos."*
3. **ROI medido** — *"Cifras reproducibles, no promesas de transformación."*

- [ ] **Step 1:** Implementar (presentacional). **No** mencionar harness/modelos.
- [ ] **Step 2: Run** `pnpm typecheck` → OK.
- [ ] **Step 3: Commit** `feat(consultoria): propuesta de valor (vertical · propiedad · ROI)`.

---

### Task 9: `OfferLadder` (embudo + precios)

**Files:**
- Create: `components/consultoria/OfferLadder.tsx`
- Test: `tests/unit/OfferLadder.test.tsx`

Contenido (`<section id="oferta">`): escalera de 3 peldaños con datos exactos:

```ts
const STEPS = [
  {
    name: "Reunión de introducción",
    price: "Gratis",
    detail: "Remota, sin compromiso. Conocemos su caso y validamos el encaje.",
  },
  {
    name: "Consultoría",
    price: null, // se muestran las dos opciones
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
**Reglas duras:** se muestran `$500.000` y `$1.500.000`; **nunca** `$200.000` (fundador = interno).

- [ ] **Step 1: Write the failing test**

```tsx
// tests/unit/OfferLadder.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OfferLadder } from "@/components/consultoria/OfferLadder";

describe("OfferLadder", () => {
  it("muestra los precios públicos de la Consultoría", () => {
    const { container } = render(<OfferLadder />);
    expect(container.textContent).toContain("$500.000");
    expect(container.textContent).toContain("$1.500.000");
  });
  it("NO expone el precio fundador (interno)", () => {
    const { container } = render(<OfferLadder />);
    expect(container.textContent).not.toContain("$200.000");
  });
  it("presenta los tres peldaños", () => {
    const { container } = render(<OfferLadder />);
    expect(container.textContent).toContain("Reunión de introducción");
    expect(container.textContent).toContain("Consultoría");
    expect(container.textContent).toContain("Implementación");
  });
});
```

- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3:** Implementar `OfferLadder` con `STEPS` (presentacional; tokens del DS).
- [ ] **Step 4: Run** `pnpm vitest run tests/unit/OfferLadder.test.tsx` → PASS (3 tests).
- [ ] **Step 5: Commit** `feat(consultoria): escalera de oferta con precios públicos`.

---

### Task 10: `OwnershipSection` (D-4)

**Files:** Create `components/consultoria/OwnershipSection.tsx`.

Contenido (`<section id="propiedad">`, `SectionLabel index="03" label="Propiedad y confidencialidad"`): mensaje C-4 (encuadre aprobado): *"Usted es dueño de su entorno, sus datos, la configuración de sus agentes y su Diagnóstico — desde el primer día y al terminar."* Subtexto: resuelve confidencialidad (secreto profesional) y continuidad. **No** mencionar licencia del motor ni términos de salida (van en el contrato, no en la web).

- [ ] **Step 1:** Implementar (presentacional, tono sobrio, tokens del DS).
- [ ] **Step 2: Run** `pnpm typecheck` → OK.
- [ ] **Step 3: Commit** `feat(consultoria): sección de propiedad del cliente (D-4)`.

---

### Task 11: `ConsultoriaCTA` + `ConsultoriaFooter`

**Files:** Create `components/consultoria/ConsultoriaCTA.tsx`, `components/consultoria/ConsultoriaFooter.tsx`.

- **`ConsultoriaCTA`** (`<section id="cta-final">`): *"Conversemos. La reunión de introducción es gratuita y sin compromiso."* + `<ContactCTA whatsappText="Hola, quiero agendar la reunión de introducción para mi firma." />`.
- **`ConsultoriaFooter`** (`<footer>`): wordmark + correo (`admin@theolab.tech`) + `© {año} TheoLab AI · Hecho en Colombia`. **Sin** la navegación institucional ni links a `#services`/GitHub.

- [ ] **Step 1:** Implementar ambos.
- [ ] **Step 2: Run** `pnpm typecheck` → OK.
- [ ] **Step 3: Commit** `feat(consultoria): CTA final + footer mínimo`.

---

### Task 12: Ensamblar `/consultoria` (page + layout)

**Files:**
- Create: `app/consultoria/layout.tsx`, `app/consultoria/page.tsx`

Depende de Tasks 6-11.

- [ ] **Step 1: `app/consultoria/page.tsx`** ensambla en orden: Hero, Problem, ValueProp, OfferLadder, Ownership, CTA. (El Header y Footer van en el layout.)

```tsx
// app/consultoria/page.tsx
import { ConsultoriaCTA } from "@/components/consultoria/ConsultoriaCTA";
import { ConsultoriaHero } from "@/components/consultoria/ConsultoriaHero";
import { OfferLadder } from "@/components/consultoria/OfferLadder";
import { OwnershipSection } from "@/components/consultoria/OwnershipSection";
import { ProblemSection } from "@/components/consultoria/ProblemSection";
import { ValueProp } from "@/components/consultoria/ValueProp";

export default function ConsultoriaPage() {
  return (
    <main id="main" className="flex-1">
      <ConsultoriaHero />
      <ProblemSection />
      <ValueProp />
      <OfferLadder />
      <OwnershipSection />
      <ConsultoriaCTA />
    </main>
  );
}
```

- [ ] **Step 2: `app/consultoria/layout.tsx`** con `ConsultoriaHeader` + `children` + `ConsultoriaFooter` + `metadata` propia + JSON-LD Service/Offer (Task 13).

```tsx
// app/consultoria/layout.tsx
import type { Metadata } from "next";
import { ConsultoriaFooter } from "@/components/consultoria/ConsultoriaFooter";
import { ConsultoriaHeader } from "@/components/consultoria/ConsultoriaHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { consultoriaServiceJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Consultoría de IA para firmas legales",
  description:
    "Recupere entre 18 y 27 horas profesionales al mes, medidas. Consultoría de IA para firmas legales colombianas.",
  alternates: { canonical: "/consultoria" },
};

export default function ConsultoriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd id="ld-consultoria" data={consultoriaServiceJsonLd()} />
      <ConsultoriaHeader />
      {children}
      <ConsultoriaFooter />
    </>
  );
}
```

- [ ] **Step 3: Run** `pnpm build` → genera `/consultoria`.
- [ ] **Step 4: Commit** `feat(consultoria): ensamblar la landing legal-first`.

---

## FASE 3 — SEO + gate de coherencia

### Task 13: JSON-LD de la Consultoría

**Files:** Modify `lib/seo.ts`.

- [ ] **Step 1:** Añadir:

```ts
// lib/seo.ts — añadir
export function consultoriaServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Consultoría de adopción de IA para firmas legales",
    provider: { "@type": "Organization", name: brand.name },
    areaServed: { "@type": "Country", name: "Colombia" },
    offers: [
      { "@type": "Offer", name: "Consultoría inicial", price: "500000", priceCurrency: "COP" },
      { "@type": "Offer", name: "Consultoría completa", price: "1500000", priceCurrency: "COP" },
    ],
  } as const;
}
```

- [ ] **Step 2: Run** `pnpm typecheck` → OK. **Commit** `feat(seo): JSON-LD Service/Offer para /consultoria`.

---

### Task 14: `sitemap` + `robots`

**Files:** Modify `app/sitemap.ts`, `app/robots.ts`.

- [ ] **Step 1:** En `sitemap.ts`, añadir al array:

```ts
{ url: `${base}/consultoria`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
```
`robots.ts` ya permite `/` (cubre todo); no requiere cambio salvo querer listar explícitamente.

- [ ] **Step 2: Run** `pnpm build && pnpm typecheck` → OK. **Commit** `feat(seo): /consultoria en el sitemap`.

---

### Task 15: Gate de coherencia (e2e)

**Files:** Create `tests/e2e/coherence.spec.ts`.

- [ ] **Step 1: Write the test**

```ts
// tests/e2e/coherence.spec.ts
import { expect, test } from "@playwright/test";

const FORBIDDEN_IN_CONSULTORIA = ["harness", "theolab.ai", "PL ·", "15–30", "15-30", "$200.000"];

test.describe("Coherencia del front", () => {
  test("/consultoria no filtra lenguaje técnico ni datos muertos", async ({ page }) => {
    await page.goto("/consultoria");
    const body = (await page.locator("body").textContent())?.toLowerCase() ?? "";
    for (const term of FORBIDDEN_IN_CONSULTORIA) {
      expect(body, `término prohibido en /consultoria: ${term}`).not.toContain(term.toLowerCase());
    }
  });

  test("/consultoria no muestra la navegación institucional", async ({ page }) => {
    await page.goto("/consultoria");
    await expect(page.getByRole("link", { name: "Servicios" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Filosofía" })).toHaveCount(0);
  });

  test("la home no muestra el caso no verificable", async ({ page }) => {
    await page.goto("/");
    const body = (await page.locator("body").textContent()) ?? "";
    expect(body).not.toContain("Gases de Occidente");
  });

  test("/consultoria expone el CTA de WhatsApp correcto", async ({ page }) => {
    await page.goto("/consultoria");
    const wa = page.getByRole("link", { name: /whatsapp/i }).first();
    await expect(wa).toHaveAttribute("href", /wa\.me\/573182395252/);
  });
});
```

- [ ] **Step 2: Run** `pnpm test:e2e tests/e2e/coherence.spec.ts` → PASS (tras Tasks 6-12).
- [ ] **Step 3: Commit** `test(coherence): gate de aislamiento de audiencias y datos vivos`.

---

### Task 16: Smoke e2e de `/consultoria`

**Files:** Create `tests/e2e/consultoria.spec.ts`.

- [ ] **Step 1: Write the test**

```ts
// tests/e2e/consultoria.spec.ts
import { expect, test } from "@playwright/test";

test.describe("Landing /consultoria — smoke", () => {
  test("carga con hero + promesa + CTA", async ({ page }) => {
    await page.goto("/consultoria");
    await expect(page.locator("#consultoria-hero")).toBeVisible();
    await expect(page.getByText(/18 y 27|18–27/)).toBeVisible();
    await expect(page.getByRole("link", { name: /reunión de introducción|whatsapp/i }).first()).toBeVisible();
  });

  test("presenta las secciones del embudo", async ({ page }) => {
    await page.goto("/consultoria");
    await expect(page.locator("#problema")).toBeVisible();
    await expect(page.locator("#valor")).toBeVisible();
    await expect(page.locator("#oferta")).toBeVisible();
    await expect(page.locator("#propiedad")).toBeVisible();
  });

  test("sin errores de consola", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    await page.goto("/consultoria");
    await page.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run** `pnpm test:e2e tests/e2e/consultoria.spec.ts` → PASS.
- [ ] **Step 3: Run el suite completo** `pnpm typecheck && pnpm test && pnpm test:e2e` → todo verde.
- [ ] **Step 4: Commit** `test(consultoria): smoke e2e de la landing legal`.

---

## Self-review (cobertura del spec)

| Requisito del spec | Task(s) |
|---|---|
| Enfoque A: root neutro + route group sin nav común | Task 3 |
| Home institucional refinada (dos capas, puente legal) | Task 4 |
| Eliminar "Gases de Occidente" | Task 5 + gate Task 15 |
| `/consultoria`: 7 secciones (header, hero, problema, valor, oferta, propiedad, CTA, footer) | Tasks 6-12 |
| Voz formal + sin "harness" en `/consultoria` | Tasks 6-11 + gate Task 15 |
| Precios públicos $500k/$1.5M, fundador interno | Task 9 (+ test) |
| CTA WhatsApp Juan José + email | Tasks 1, 2, 6, 11 (+ tests) |
| Propiedad D-4 (encuadre fuerte, sin licencia/salida) | Task 10 |
| Promesa 18–27 | Tasks 6, 16 |
| SEO/metadata/sitemap/JSON-LD | Tasks 12, 13, 14 |
| Gate de coherencia automatizado | Task 15 |
| Tests extendidos (no se borra ninguno) | Tasks 4, 15, 16 |

**Pendientes del spec que NO entran (por diseño):** páginas de pauta (bloqueadas por contenido), copy final palabra-por-palabra (lo pule frontend-design + valida Juan, C-1), TD-2 (precio Implementación), assets HTML legacy del DS (revisión dedicada aparte).

**Placeholders:** ninguno — el contenido textual es del spec aprobado; el JSX visual es trabajo de diseño delegado, acotado por tests.

**Consistencia de tipos:** `contact`/`whatsappUrl`/`mailtoUrl` (Task 1) usados igual en Tasks 2/6/11; `consultoriaServiceJsonLd` (Task 13) consumido en Task 12; ids (`#consultoria-hero`, `#problema`, `#valor`, `#oferta`, `#propiedad`) consistentes entre componentes y tests e2e.
