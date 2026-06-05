# Checkout Consultoría (post-reunión) + MailerLite — Diseño

> **Estado:** ✅ implementado e integrado en `main` (PR #5, 2026-06-04) · **Fecha:** 2026-06-03 · **Rama:** `feat/checkout-consultoria` (desde `main`)
> **Tipo:** feature de frontend (nueva ruta + integración de email)
> **Hogar:** `frontend/docs/superpowers/specs/`
>
> **Nota de integración (2026-06-04):** se añadió el flag `NEXT_PUBLIC_CHECKOUT_ENABLED` (`lib/flags.ts`, off por defecto) no contemplado en este spec: el feature queda "dark" en prod (botón oculto + rutas redirigen) hasta configurar las env de backend. Ver `DESIGN-DECISIONS.md` → ADR-F3. El canal secundario (botón "Contratar" en `OfferLadderV3`, §2) solo aparece con el flag activo.

## 1. Objetivo y boundary de scope

Permitir que un cliente **ya convencido** (que pasó por la reunión de introducción o llega decidido) contrate la Consultoría de forma self-service: llena un formulario, recibe instrucciones de transferencia bancaria por correo, y TheoLab recibe una notificación interna de la compra.

**Boundary.** Este spec cubre la ruta `/checkout`, su confirmación, el enganche desde el embudo, y la integración de email vía MailerLite detrás de un puerto desacoplado. **NO** cubre: pasarela de pago con tarjeta (se usa transferencia manual), dashboard de cliente, ni campañas de marketing (MailerLite las habilita, pero su configuración es ops, no código).

## 2. Modelo de venta (decisión de negocio)

La web nueva es **contact-first**: el siguiente paso primario es la reunión de introducción gratuita. El checkout es **secundario y post-reunión**: existe para quien ya decidió, sin romper la narrativa editorial de "agende primero".

- **Canal principal de entrada:** link directo `/checkout?plan=inicial|completa` que Juan comparte tras la reunión.
- **Canal secundario:** botón discreto "Contratar" en `OfferLadderV3` (landing `/consultoria-legal`).

## 3. Decisiones cerradas

| Decisión | Valor |
|---|---|
| Modelo de checkout | Self-service, post-reunión, secundario |
| Producto cobrable | Solo Consultoría: Inicial / Completa |
| Precio | Derivado de `lib/oferta.ts` (`STEPS` + `FOUNDER_SPOTS_LEFT`): fundador si quedan cupos, si no regular |
| Pasarela | Transferencia bancaria directa (0% comisión), confirmación manual por TheoLab |
| Email — Fase 1 | **MailerLite-only** (Ruta A) detrás del puerto `EmailService` |
| Email — Fase 2 | Swap a Resend para transaccional cambiando 1 adapter + env (no se implementa ahora) |
| Datos del formulario | Nombre, email, empresa, teléfono, plan (capturados) |
| Datos del journey | `estado_comercial=prospecto`, `fuente_lead`, `servicio_interes=consultoria`, `plan_seleccionado`, `edicion`, `fecha_contacto` (derivados server-side) — alimentan las Fases 2-4 de la [estrategia MailerLite](./2026-06-03-mailerlite-growth-architecture.md) sin rehacer la captura |
| Validación | A mano en `lib/checkout.ts` (sin añadir `zod` ni librería de forms) |
| Integración MailerLite | REST API con `fetch` nativo en un adapter (sin SDK `@mailerlite/mailerlite-nodejs`) |
| Rutas | `app/checkout/` (fuera del route group `(institucional)`, layout propio) + `/checkout/confirmacion` |

## 4. Principio rector: un-dato-un-dueño

El precio y los planes viven **una sola vez** en `lib/oferta.ts` (`STEPS[1].options`). El checkout **deriva** de ahí vía helpers; **no** se crea `PLAN_OPTIONS` paralelo. Cuando se baja `FOUNDER_SPOTS_LEFT` a mano, el embudo y el checkout se mueven juntos, sin tocar componentes.

## 5. Arquitectura — archivos

| Archivo | Responsabilidad | Nuevo/Mod |
|---|---|---|
| `lib/oferta.ts` | + `getConsultoriaPlans()` y `getEffectivePrice(option)` que derivan de `STEPS` y `FOUNDER_SPOTS_LEFT` | Mod |
| `lib/checkout.ts` | Tipos `CheckoutForm` + validación a mano + resolución plan→precio | Nuevo |
| `lib/email/types.ts` | Puerto `EmailService` + `LeadContact` + `TransactionalMessage` (tipos de dominio propios) | Nuevo |
| `lib/email/mailerlite.ts` | Adapter: `registrarLead` (API subscriber + grupo) y `enviarTransaccional` (notificación interna). `fetch` nativo | Nuevo |
| `lib/email/index.ts` | Factory: elige adapter por `EMAIL_PROVIDER` | Nuevo |
| `app/checkout/layout.tsx` | Layout mínimo propio (no el institucional) | Nuevo |
| `app/checkout/page.tsx` | Server Component: lee `searchParams.plan`, resuelve plan+precio, renderiza resumen + form | Nuevo |
| `app/checkout/CheckoutForm.tsx` | Client Component: estado, validación inline, submit | Nuevo |
| `app/checkout/actions.ts` | Server Action: valida → `EmailService` → redirect confirmación | Nuevo |
| `app/checkout/confirmacion/page.tsx` | Instrucciones de transferencia (`BANK_DETAILS`, SSR) | Nuevo |
| `components/consultoria/OfferLadderV3.tsx` | Botón discreto "Contratar" en `TierBlock` → `/checkout?plan=...` | Mod |

## 6. Puerto de email (desacople de proveedor)

```ts
// lib/email/types.ts
export interface LeadContact {
  // Capturados en el formulario
  nombre: string; email: string; empresa: string; telefono: string;
  plan: "inicial" | "completa"; precio: string; edicion: "fundador" | "regular";
  // Journey / lifecycle — derivados server-side (alimentan Fases 2-4 de la estrategia)
  estadoComercial: "prospecto";   // el checkout entra como prospecto
  fuenteLead: string;             // de ?fuente= (web/linkedin/cold); default "web"
  servicioInteres: "consultoria";
  fechaContacto: string;          // ISO date, generado en el servidor
}
export interface TransactionalMessage {
  to: string; template: "notificacion-interna"; data: Record<string, string>;
}
export interface EmailService {
  registrarLead(c: LeadContact): Promise<void>;
  enviarTransaccional(m: TransactionalMessage): Promise<void>;
}
```

El adapter MailerLite mapea `LeadContact` a: subscriber con custom fields (`empresa`, `telefono`, `plan_seleccionado`, `edicion`, `estado_comercial`, `fuente_lead`, `servicio_interes`, `fecha_contacto`) + asignación al group `intencion-inicial|intencion-completa` y, si `edicion="fundador"`, también `edicion-fundador`. Estos custom fields y groups son los mismos que define la [estrategia de crecimiento](./2026-06-03-mailerlite-growth-architecture.md) (Fases 4 y 7): escribirlos desde el día 1 evita rehacer la captura.

La Server Action depende **solo** de `EmailService` (vía la factory). No conoce MailerLite. Swap a Resend (Fase 2) = nuevo `lib/email/resend.ts` + cambiar `EMAIL_PROVIDER`; cero cambios en checkout, componentes ni tests de negocio.

**Por qué MailerLite-only en Fase 1:** prioriza simplicidad operativa (#1) y bajo costo (#5) al volumen actual (unidades/mes). Limitaciones aceptadas conscientemente: el correo de instrucciones de pago es una **automation con plantilla fija** (vive en el dashboard de MailerLite, no en git); la notificación interna usa la API directa. Si la fiabilidad/deliverability del cobro lo exige, Fase 2 mueve el transaccional a Resend sin reescritura.

## 7. Variables de entorno (Vercel, server-side)

| Var | Uso |
|---|---|
| `EMAIL_PROVIDER` | `mailerlite` (Fase 1). La factory lo lee |
| `MAILERLITE_API_KEY` | Secret. Nunca en código |
| `MAILERLITE_GROUP_INICIAL` / `MAILERLITE_GROUP_COMPLETA` | IDs de los groups `intencion-*` que disparan la automation de instrucciones de pago (uno por plan) |
| `MAILERLITE_GROUP_FUNDADOR` | ID del group `edicion-fundador` (se asigna si `edicion="fundador"`) |
| `NOTIFICATION_EMAIL` | Correo interno de TheoLab para el aviso de compra |
| `BANK_DETAILS` | Datos de transferencia, server-side (render SSR en confirmación) — **no** `NEXT_PUBLIC` |

## 8. Flujo de datos (intención de compra → pago)

1. Usuario llega a `/checkout?plan=inicial` (link de Juan o botón discreto). `plan` inválido → redirect a `/consultoria-legal`.
2. `page.tsx` resuelve plan desde `STEPS` y calcula precio efectivo (fundador si `FOUNDER_SPOTS_LEFT > 0`). Renderiza resumen + `CheckoutForm`.
3. Submit → **Server Action** valida (`lib/checkout.ts`).
4. `emailService.registrarLead(...)` → MailerLite crea suscriptor con custom fields del journey (empresa, teléfono, `plan_seleccionado`, `edicion`, `estado_comercial=prospecto`, `fuente_lead`, `servicio_interes`, `fecha_contacto`) + lo asigna al group `intencion-*` (y `edicion-fundador` si aplica) → la **automation** dispara instrucciones de pago al cliente.
5. `emailService.enviarTransaccional({template:"notificacion-interna", to: NOTIFICATION_EMAIL, ...})` → aviso a TheoLab.
6. Éxito → redirect `/checkout/confirmacion` con datos de transferencia (SSR).

## 9. Manejo de errores (sin fallos silenciosos)

| Caso | Manejo |
|---|---|
| Validación form | Errores inline, no se envía |
| MailerLite API falla | **No silenciar**: log server-side + mensaje al usuario + fallback de contacto (`lib/contact.ts`: WhatsApp/email). La venta nunca se pierde en silencio |
| Notificación interna falla | Log + no bloquea la confirmación del cliente, pero se registra el fallo |
| `plan` inválido | Redirect a `/consultoria-legal` |

## 10. Testing

- **Unit:** validación de `lib/checkout`; resolución plan+precio desde `STEPS` (incl. `FOUNDER_SPOTS_LEFT = 0` → regular); helpers de `oferta`.
- **Adapter:** `lib/email/mailerlite.ts` con `fetch` mockeado (éxito + fallo).
- **Puerto:** checkout testeado con un `EmailService` fake.
- **Gate de coherencia:** precio del checkout == precio del embudo (mismo patrón que el test de coherencia del precio fundador ya existente en la home).
- **Estilo:** todo pasa `biome check` y `tsc --noEmit`.

## 11. Prerrequisitos de ops (no código, los hace TheoLab)

- MailerLite: crear custom fields del journey (`empresa`, `telefono`, `plan_seleccionado`, `edicion`, `estado_comercial`, `fuente_lead`, `servicio_interes`, `fecha_contacto`), groups `intencion-inicial` / `intencion-completa` / `edicion-fundador`, automation de instrucciones de pago. Alineado con la [estrategia MailerLite](./2026-06-03-mailerlite-growth-architecture.md) Fases 4 y 7.
- Vercel: cargar las env vars de §7.

## 12. Fuera de scope (decisiones explícitas)

- Pasarela con tarjeta (Stripe/PayU): no; transferencia manual.
- Resend / transaccional real: diferido a Fase 2 (el puerto lo habilita).
- Campañas de marketing en MailerLite: ops, no código.
- Dashboard de cliente / seguimiento de pago automatizado: fuera.

## 13. Riesgos

| Riesgo | Mitigación |
|---|---|
| Precio del checkout diverge del embudo | Derivar de `STEPS` (§4) + gate de coherencia (§10) |
| Plantilla de pago vive en dashboard, no en git | Aceptado en Fase 1; documentado; Fase 2 (Resend + React Email) la versiona |
| Fallo silencioso pierde una venta | §9: log + fallback de contacto, nunca silencioso |
| Secret de MailerLite expuesto | Solo server-side, env de Vercel, nunca en código (regla de seguridad) |
| Tomar cupo fundador sin filtro | Aceptado: el precio fundador es público en el embudo; el checkout refleja la misma fuente |
