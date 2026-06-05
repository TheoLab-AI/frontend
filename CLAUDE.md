# frontend — Web de TheoLab (theolab.tech)

> **Ownership.** Este repo es dueño de la **WEB de TheoLab** (theolab.tech): código, componentes, decisiones de diseño del front.
> **Relaciones.** Expone el producto (harness) al cliente. Consume la estrategia/voz de `docs/` (enlaza, no copia). Mapa del ecosistema: `docs/CLAUDE.md` (en el repo docs).
> **NO toca.** Estrategia de negocio (vive en `docs/`), planning (`docs/ops/`).

Stack, comandos y gates: ver `README.md`. Decisiones de diseño y arquitectura del front: ver `DESIGN-DECISIONS.md`.

## Trabajo en curso

- **Checkout Consultoría + MailerLite (Fase 1) — IMPLEMENTADO e integrado en `main` (PR #5, Jose Guerrero).**
  - **Estado:** código completo, gates verdes (typecheck · biome · vitest · e2e). El feature está **"dark" en producción** tras el flag `NEXT_PUBLIC_CHECKOUT_ENABLED` (`lib/flags.ts`, off por defecto): botón "Contratar" oculto en `OfferLadderV3` + rutas `/checkout` redirigen a `/consultoria-legal`. Prod no expone un flujo sin backend configurado.
  - **Activación (pendiente, ops — NO código):** en Vercel prod, configurar las env de `.env.example` (`MAILERLITE_*` con los grupos, `BANK_*`, `NOTIFICATION_EMAIL`) y poner `NEXT_PUBLIC_CHECKOUT_ENABLED=1` + redeploy. Solo entonces el embudo queda vivo. Requiere cuenta MailerLite con los grupos creados.
  - **Arquitectura y decisión del flag:** ver `DESIGN-DECISIONS.md` → **ADR-F3**. Puerto `EmailService` + adapter MailerLite (fetch REST, sin SDK) + precio derivado de `STEPS` + `FOUNDER_SPOTS_LEFT` (un-dato-un-dueño).
  - **Specs (fuente única, no duplicar aquí):**
    - [`docs/superpowers/specs/2026-06-03-checkout-consultoria-design.md`](docs/superpowers/specs/2026-06-03-checkout-consultoria-design.md) — ruta `/checkout` post-reunión, precio derivado de `STEPS`, transferencia bancaria, email MailerLite-only (Fase 1) detrás del puerto `EmailService`.
    - [`docs/superpowers/specs/2026-06-03-mailerlite-growth-architecture.md`](docs/superpowers/specs/2026-06-03-mailerlite-growth-architecture.md) — estrategia de crecimiento/lifecycle con MailerLite (10 fases, roadmap 30/60/90, journey, segmentación).
  - **Followup conocido (Fase 1, aceptado):** `/checkout/confirmacion` muestra datos bancarios a cualquier visitante directo cuando el flag está activo (sin gate de checkout completado). Pendiente: gate por token/cookie o mover los datos solo al correo.
