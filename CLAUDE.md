# frontend — Web de TheoLab (theolab.tech)

> **Ownership.** Este repo es dueño de la **WEB de TheoLab** (theolab.tech): código, componentes, decisiones de diseño del front.
> **Relaciones.** Expone el producto (harness) al cliente. Consume la estrategia/voz de `docs/` (enlaza, no copia). Mapa del ecosistema: `docs/CLAUDE.md` (en el repo docs).
> **NO toca.** Estrategia de negocio (vive en `docs/`), planning (`docs/ops/`).

Stack, comandos y gates: ver `README.md`. Decisiones de diseño y arquitectura del front: ver `DESIGN-DECISIONS.md`.

## Trabajo en curso

- **Checkout Consultoría + MailerLite (diseño aprobado — pendiente plan de implementación).**
  - **Próximo paso:** escribir el plan de implementación (Fase 1) desde el spec del checkout.
  - **Specs (fuente única, no duplicar aquí):**
    - [`docs/superpowers/specs/2026-06-03-checkout-consultoria-design.md`](docs/superpowers/specs/2026-06-03-checkout-consultoria-design.md) — ruta `/checkout` post-reunión, precio derivado de `STEPS`, transferencia bancaria, email MailerLite-only (Fase 1) detrás del puerto `EmailService`.
    - [`docs/superpowers/specs/2026-06-03-mailerlite-growth-architecture.md`](docs/superpowers/specs/2026-06-03-mailerlite-growth-architecture.md) — estrategia de crecimiento/lifecycle con MailerLite (10 fases, roadmap 30/60/90, journey, segmentación).
  - **Decisiones clave:** modelo post-reunión secundario · entrada link directo `/checkout?plan=` + botón discreto en `OfferLadderV3` · precio fundador atado a `FOUNDER_SPOTS_LEFT` · MailerLite-only Fase 1, Resend para transaccional en Fase 2 vía swap de adapter · validación a mano (sin `zod`) · `registrarLead()` escribe ya los custom fields del journey.
