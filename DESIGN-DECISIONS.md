# DESIGN DECISIONS — TheoLab Frontend v0.0.1

> **Sesión D · 2026-05-26** · Output del Bloque D1 del KICKOFF-D-FRONTEND.md (archivado en docs/ops/coordinacion/archive/ciclo-2026-05-26/).
> **Objetivo del documento**: registrar las decisiones de stack, arquitectura, copy y delivery acordadas con el usuario en el brainstorming D1, para que D2/D3/D4 ejecuten sin re-litigar.

## 1. Identidad del producto

| Campo | Valor |
|---|---|
| Nombre comercial | **TheoLab** (no PrometheusLab — descartado por dominio ocupado) |
| Tagline hero | **Tú sabes el qué — nosotros traemos el cómo.** |
| Subtítulo hero | Infraestructura, modelos y adopción de IA para empresas que ya saben dónde van. |
| Audiencia | Clientes y socios B2B (vendrán por reputación / referidos). Frontend = "carta profesional" que valida seriedad. |
| Geografía | Colombia primario, LatAm secundario. |
| Org GitHub | `TheoLab-AI` (privada). |
| Cuenta propietaria | `AlexisJ16` (personal) → migrar a corporativa post-validación. |

## 2. Servicios — 4 tiers en orden de prioridad

| # | Tier | Subtítulo / proof point | Estado actual |
|---|---|---|---|
| 01 | **Infraestructura IA** | Modelos, harnesses de evaluación y plataforma. | Harness v0.1.0 en producción (`TheoLab-AI/harness@5681603`, métricas cov 0.975 / strict 0.675 / FP 0.091). |
| 02 | **Adopción IA empresarial** | Identificación, incorporación y aprovechamiento medible. | Powered by harness — playbook en construcción. |
| 03 | **Automatización y agentes** | Implementaciones a medida y agentes para operaciones empresariales. | Caso vivo: Asesora de Gases de Occidente (Bot Gases, Fase C). |
| 04 | **Tecnología jurídica** | Desarrollo de tecnologías para el ámbito legal colombiano. | Vertical especializada — pipeline abierto. |

> **Nota sobre brand v0.3**: los servicios listados en el PDF (AI Intake Agents, Document Automation, Pipeline Agents, Diagnostic Reports) eran para **PrometheusLab** original (firmas legales/contables). **NO copiar literalmente al frontend** — los 4 tiers TheoLab arriba son la fuente de verdad.

## 3. Estructura de páginas — v0.0.1

- **One-pager** `/` con secciones scroll: Hero → Servicios (4 tiers) → Evidencia (harness v0.1.0) → Filosofía (IA construye IA) → Contacto/Footer.
- **`/blog`** preparado arquitectónicamente (route group + carpeta `content/`) — sin contenido en v0.0.1, se activa cuando aterrice primer post MDX.

## 4. Stack tecnológico v0.0.1

### Núcleo
| Capa | Elección | Justificación |
|---|---|---|
| Framework | **Next.js 16.2** (App Router + Turbopack default + Cache Components selectivo) | Dev 400% más rápido vs v15. RSC + Cache Components = bundle mínimo + invalidación granular. Vercel-native. Single source for routing + SSR + SEO. |
| Lenguaje | **TypeScript strict** (sin `any`, no `as` implícito) | Escalabilidad + DX premium. |
| Runtime local | **Node 24.14.1** (NVM) | Alineado con harness. |

### Estilo + tokens
| Capa | Elección | Justificación |
|---|---|---|
| CSS framework | **Tailwind CSS v4** (CSS-first, PostCSS plugin) | 56x más rápido en build vs v3. Variables CSS nativas. Sin JS config para casos típicos. |
| Color space | **OKLCH** (con HSL fallback automático Tailwind v4) | Perceptual uniformity — los gradientes Crimson→Gold del brand quedan más limpios que sRGB. |
| Primitivas UI | **Radix Primitives** + **CVA** (class-variance-authority) — **NO shadcn** | Decisión del usuario: máxima identidad. Headless, a11y WCAG AA, variants type-safe. Sin "shadcn look" — todo custom from brand tokens. |
| Iconos | **Lucide React** | Set masivo (~1500), tree-shakeable, peso óptimo. |

### Tipografía
| Item | Valor |
|---|---|
| Familia | **Inter Variable** (next/font, self-hosted) |
| Display | Inter Tight 700, tracking `-3%` |
| Headline | Inter 600, tracking `-2%` |
| Body | Inter 400, tracking `0%` |
| UI labels | Inter 500, tracking `+1%` |
| Optical sizing | Activo (axis `opsz` — Inter ajusta peso/spacing según tamaño) |
| Escala | Fluid typescale con `clamp()` + tokens semánticos |

### Brand tokens (extraídos del Brand System v0.3)

**Obsidian Chrome (estructura):**
- `--color-onyx`: `#0A0A0A` — texto primario, dark grounds.
- `--color-slate`: `#536878` — secundario, dividers.
- `--color-alabaster`: `#E5E4E2` — paper, light grounds.

**Golden Hour (expresión):**
- `--color-burgundy`: `#800020` — brand primary, CTAs.
- `--color-crimson`: `#FF4500` — accent, energy, transitions.
- `--color-gold`: `#FFD700` — sparks, impact highlights.

**Material:**
- Editorial grain `0%` en UI digital (regla brand: NO aplicar grain en pantallas).
- Grain `18-22%` multiply solo en componentes editoriales impresos / futuras piezas brand.

**Voice:**
- Tagline: "Tú sabes el qué — nosotros traemos el cómo."
- Tono: sobrio, evidence-first, sin ornamento, no marketing fluff.
- "Hierarchy lives in weight and scale, not typeface variety" (regla brand v0.3).

### Animación
| Capa | Elección | Justificación |
|---|---|---|
| Primaria | **Motion** (React-native, declarative) | De-facto standard React 2026. State-driven. 2.5x faster que GSAP en valores desconocidos. Integración natural con RSC + Client Components. |
| Page transitions | **View Transitions API** nativa | Zero bundle, soporte evergreen 2026, baseline Chrome/Safari. |
| Scroll | CSS scroll-driven animations nativas + Lenis solo si se justifica una sección específica | Empezar con CSS native — Lenis añade peso. |

### Calidad + DX
| Capa | Elección | Justificación |
|---|---|---|
| Linter + Formatter | **Biome** (Rust, type-aware) | 25-56x más rápido que ESLint+Prettier. Una herramienta. En producción en Coinbase, Discord, Vercel, Astro. |
| Package manager | **pnpm** | Disk-efficient, monorepo-ready para futuro share types con harness. Mejor DX. |
| Pre-commit hooks | **Husky** + **lint-staged** + **biome check --apply-unsafe** | Bloquea commit con lint/format issues. |
| Tipos | TypeScript strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax` |
| Imports | Aliased `@/*` (estándar Next.js) |

### Testing
| Capa | Elección | Cobertura inicial v0.0.1 |
|---|---|---|
| Unit/integration | **Vitest 9** | Smoke tests de utils + componentes puros. |
| E2E + visual regression | **Playwright** | 1-2 snapshots iniciales (`/` desktop + mobile) — escala después. |
| Component dev (defer) | Storybook 9 | Activar cuando ≥10 componentes propios. |

### Performance + SEO
- **Targets no negociables**:
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1
  - **Lighthouse mobile ≥ 95** (todas las categorías)
- `next/image` (AVIF/WebP automático, sizes responsive)
- `next/font` (zero CLS, self-hosted Inter Variable)
- `next/script` para third-party (Vercel Analytics, etc.)
- **Metadata API** + dynamic `opengraph-image.tsx` + `twitter-image.tsx`
- **JSON-LD** `Organization` + `Service` schemas (helpers en `lib/seo.ts`)
- `next-sitemap` para `sitemap.xml` + `robots.txt`
- Streaming SSR + RSC default + Client Components solo donde haya interactividad

### Deploy + Observabilidad v0.0.1
| Item | Elección |
|---|---|
| Hosting | **Vercel hobby tier** (zero-cost) en team `alexis-projects-2b7b8f2f` (cuenta `alexisj4a-8856`) |
| Domain | Vercel `*.vercel.app` por ahora — dominio custom TheoLab cuando se compre. |
| Analytics | **Vercel Analytics** (free, incluido) |
| Performance | **Vercel Speed Insights** (free, incluido) |
| Error tracking | Diferido (Sentry/PostHog cuando haya tráfico real y revisión zero-cost) |

## 5. Arquitectura inicial

```
frontend/
├── app/                        # Routes (App Router)
│   ├── layout.tsx              # Root layout + fonts + metadata global
│   ├── page.tsx                # One-pager `/`
│   ├── opengraph-image.tsx     # Dynamic OG image
│   ├── twitter-image.tsx       # Dynamic Twitter card
│   ├── sitemap.ts              # next-sitemap config
│   ├── robots.ts               # next-sitemap config
│   └── (blog)/                 # Route group preparado (vacío v0.0.1)
├── components/
│   ├── ui/                     # Primitivas custom (Button, Separator, Badge) — Radix + CVA + brand tokens
│   ├── sections/               # Hero, Services, Evidence, Philosophy, Footer
│   └── motion/                 # Motion variants reutilizables (fadeUp, stagger, etc.)
├── lib/
│   ├── tokens.ts               # Brand tokens en TypeScript (color, type, spacing, motion)
│   ├── seo.ts                  # JSON-LD helpers (Organization, Service)
│   └── utils.ts                # cn(), formatters
├── styles/
│   └── globals.css             # Tailwind v4 directives + CSS variables (OKLCH) + base layer
├── content/                    # Preparado para MDX (vacío en v0.0.1)
├── public/
│   ├── brand/                  # PDFs Brand System + PNGs logos
│   ├── favicon.ico
│   └── icon.png                # TL_icon_short.png como app icon
└── tests/
    ├── unit/                   # Vitest
    └── e2e/                    # Playwright + visual snapshots
```

**Convenciones:**
- Server Components default; Client Components solo donde haya interactividad (`'use client'` explícito).
- Co-location por componente cuando crezca: `Hero.tsx` + `Hero.test.tsx` + `Hero.motion.ts` en mismo dir.
- **NO Feature-Sliced Design todavía** — App Router idiomático basta para one-pager. FSD entra en v0.2+ cuando exista dashboard.
- **NO Atomic Design rígido** — taxonomía simple: `ui/` (primitivas) + `sections/` (composiciones).

## 6. v0.1 expansion path (no instalar en v0.0.1)

| Item | Trigger para activar |
|---|---|
| GSAP + ScrollTrigger | Cuando una secuencia narrativa específica lo justifique (hero 3D, scroll story compleja). |
| React Three Fiber + WebGPU | Si decidimos hero 3D — validar primero con prototipo aislado (LCP risk). |
| Feature-Sliced Design | Cuando llegue dashboard/demos (v0.2+) con ≥10 features. |
| Storybook 9 + Vitest browser mode | Cuando tengamos ≥10 componentes propios para aislar. |
| Sentry + PostHog | Cuando haya tráfico real medible (evaluar zero-cost antes — free tier ≠ zero-cost en espíritu). |
| Contentlayer / Velite | Cuando aterricemos el primer post MDX. |
| Vercel AI Gateway + AI SDK | Si añadimos chat/agente IA en frontend (demos del harness). |
| Lenis smooth scroll | Solo si CSS scroll-driven nativo no basta. |
| Vercel Marketplace (Clerk, etc.) | Cuando auth/multitenancy entre en scope. |
| Dominio custom theolab.tech | Adquirido (Hostinger). Conectar a Vercel vía A/CNAME — no romper los MX de Google Workspace. |

## 7. Delivery v0.0.1 — alcance de sesión D

- [x] D1: Brainstorming + DESIGN-DECISIONS.md (este documento).
- [ ] D2: Bootstrap Next.js 16 + Tailwind v4 + Radix + Biome + pnpm con stack arriba.
- [ ] D3: Brand tokens en CSS + sections (Hero, Services, Evidence, Philosophy, Footer) con copy aprobado.
- [ ] D4: Smoke test + Playwright snapshot + screenshot inicial.
- [ ] D5: Repo `TheoLab-AI/frontend` **PRIVADO** + push.
- [ ] D6: Vercel link + preview deploy.
- [ ] REPORT-D-frontend.md (histórico, archivado en docs/ops/coordinacion/archive/ciclo-2026-05-26/).

## 8. Decisiones cerradas (referencia rápida)

| Decisión | Valor |
|---|---|
| Audiencia | B2B serio — frontend como "carta profesional" |
| Estructura | One-pager + blog ready |
| Tagline | "Tú sabes el qué — nosotros traemos el cómo." |
| Stack | Next.js 16 + Tailwind v4 + Radix + Biome + pnpm + Motion |
| Componentes | Custom from tokens (NO shadcn) |
| Animación | Motion primaria + View Transitions API |
| Repo | `TheoLab-AI/frontend` privado |
| Deploy | Vercel team `alexis-projects-2b7b8f2f` hobby tier |
| Brand wordmark | "TheoLab" (NO PrometheusLab) |

---

**Aprobación:** este documento queda como fuente de verdad para D2-D6. Cualquier desviación se anota como ADR en línea o en este mismo doc.
