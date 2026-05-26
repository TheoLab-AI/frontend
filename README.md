# TheoLab Frontend

> **Tú sabes el qué — nosotros traemos el cómo.**
>
> Frontend oficial de TheoLab AI — landing v0.0.1 + base arquitectónica para futuros dashboards, blog técnico y demos del harness.

Fuente de verdad del frontend de TheoLab. Este repositorio es el showcase técnico y la carta profesional digital de la organización.

## Stack v0.0.1

| Capa | Elección |
|---|---|
| Framework | Next.js 16.2 (App Router + Turbopack + Cache Components selectivo) |
| Lenguaje | TypeScript strict (`noUncheckedIndexedAccess` + `noImplicitOverride`) |
| Estilo | Tailwind CSS v4 (CSS-first) + tokens en CSS variables (OKLCH-ready) |
| Primitivas UI | Radix Primitives + CVA — sin shadcn/ui (custom from brand tokens para máxima identidad) |
| Tipografía | Inter Variable + Inter Tight (next/font, self-hosted, axis opsz activo) |
| Animación | Motion 12 (declarative) + View Transitions API nativa |
| Iconos | Lucide React + iconos custom donde el brand lo exige |
| Linter + Formatter | Biome 2 (Rust, type-aware, reemplaza ESLint + Prettier) |
| Package manager | pnpm 11 (via corepack) |
| Pre-commit | Husky + lint-staged + Biome check unsafe |
| Tests unit | Vitest 4 + Testing Library |
| Tests E2E + Visual | Playwright + snapshots versionados |
| SEO | Metadata API + JSON-LD (Organization, Service) + sitemap.ts + robots.ts |
| Deploy | Vercel hobby tier (Vercel Analytics + Speed Insights incluidos) |

## Brand System v0.3

El sistema de diseño es el **Brand System v0.3 de TheoLab** — disponible como PDF en `public/brand/`.

**Paleta dual:**
- **Obsidian Chrome** (estructura): Onyx `#0A0A0A` · Slate `#536878` · Alabaster `#E5E4E2`
- **Golden Hour** (expresión): Burgundy `#800020` · Crimson Carrot `#FF4500` · Gold `#FFD700`

**Tipografía:** Inter como única familia. La jerarquía vive en peso y escala, no en tipo. Display Inter Tight 700 / -3% tracking, headline Inter 600 / -2%, body Inter 400, UI Inter 500 / +1%.

**Wordmark:** "TheoLab" — "Theo" en onyx, "Lab" con gradient pintado crimson → gold.

**Regla material:** Editorial grain solo en superficies no-digitales. En UI: 0% grain.

> Los assets brand fueron concebidos para "PrometheusLab" (nombre descartado por dominio ocupado). El sistema visual se preserva íntegramente; solo cambia el wordmark a TheoLab.

## Estructura

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root: fonts, metadata, JSON-LD
│   ├── page.tsx                # One-pager v0.0.1
│   ├── globals.css             # Tailwind v4 + brand tokens + @utility custom
│   ├── sitemap.ts              # Dynamic sitemap
│   └── robots.ts               # robots.txt
├── components/
│   ├── ui/                     # Primitivas custom (Wordmark, Button, Badge, SectionLabel)
│   ├── ui/icons/               # Iconos brand (GitHub SVG inline)
│   ├── sections/               # Hero, Services, Evidence, Philosophy, Footer
│   ├── motion/                 # Variants Motion reutilizables
│   └── seo/                    # JsonLd component
├── lib/
│   ├── tokens.ts               # Brand tokens en TypeScript
│   ├── seo.ts                  # JSON-LD helpers (Organization, Service)
│   └── utils.ts                # cn() helper
├── tests/
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Playwright smoke + screenshot tests
├── screenshots/                # Snapshots versionados v0.0.1+
├── public/
│   └── brand/                  # PDFs Brand System + PNGs logos (confidential)
├── DESIGN-DECISIONS.md         # Decisiones de stack/arquitectura (D1 output)
├── biome.json                  # Biome config (linter + formatter unificado)
├── playwright.config.ts        # Playwright config (desktop + mobile chromium)
└── vitest.config.ts            # Vitest config
```

## Comandos

```bash
# Desarrollo
pnpm dev                  # Dev server con Turbopack
pnpm build                # Production build
pnpm start                # Servir production

# Calidad
pnpm typecheck            # TypeScript strict check
pnpm check                # Biome check (lint + format)
pnpm lint:fix             # Biome auto-fix incluido unsafe
pnpm format               # Biome formatter

# Tests
pnpm test                 # Vitest unit tests (run once)
pnpm test:watch           # Vitest watch mode
pnpm test:e2e             # Playwright E2E + screenshots
pnpm test:e2e:ui          # Playwright UI mode
```

## Performance targets v0.0.1

Gates no negociables (Lighthouse mobile):

| Métrica | Target |
|---|---|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

## v0.1 Expansion path

Items definidos en `DESIGN-DECISIONS.md` sección 6 — activar bajo demanda:

- GSAP + ScrollTrigger (narrativa scroll compleja)
- React Three Fiber + WebGPU (hero 3D opcional)
- Feature-Sliced Design (cuando llegue dashboard ≥10 features)
- Storybook 9 (cuando ≥10 componentes propios)
- Sentry + PostHog (cuando haya tráfico real)
- Contentlayer / Velite (cuando aterrice primer post MDX)
- Vercel AI Gateway + AI SDK (demos del harness en frontend)
- Dominio custom `theolab.ai`

## License

Privado — propiedad de TheoLab AI © 2026. Todos los derechos reservados.
