# MailerLite como motor de crecimiento de TheoLab — Arquitectura y estrategia

> **Rol:** Principal Solutions Architect (Email Marketing · Lifecycle Automation · Conversion Funnels · CRM · Next.js · RevOps)
> **Fecha:** 2026-06-03 · **Repo:** `TheoLab-AI/frontend` · **Rama:** `feat/checkout-consultoria`
> **Relación:** complementa [`2026-06-03-checkout-consultoria-design.md`](./2026-06-03-checkout-consultoria-design.md). El checkout es el primer punto de captura del journey aquí descrito.
> **Nota de ownership:** las secciones de estrategia comercial pura (journey, ROI) podrían migrar a `docs/` (dueño de estrategia) si se quiere; aquí viven junto a la arquitectura que las ejecuta.

---

## FASE 1 — Auditoría de capacidades de MailerLite

Datos verificados (jun-2026). Plan gratis = 500 subs / 12.000 emails-mes. "Free" = disponible en plan gratis; "Pago" = requiere Growing Business / Advanced.

### Gestión de contactos

| Capacidad | Qué hace | Complejidad | Valor TheoLab | Prioridad | Plan |
|---|---|---|---|---|---|
| Subscribers | Registro de cada contacto (name, email + campos) | Baja | Núcleo del CRM | 🔴 Alta | Free |
| Groups | Etiquetas permanentes; **disparan automations** | Baja | Spine de lifecycle y triggers | 🔴 Alta | Free |
| Segments | Listas dinámicas por condiciones (auto-actualizadas) | Media | Targeting "calientes/fríos/inactivos" | 🟠 Media | Free |
| Custom Fields | Campos propios (texto/número/fecha) | Baja | Enriquecimiento y reglas | 🔴 Alta | Free |
| Tags | **No existen como tal** → se usan Groups | — | (usar groups) | — | — |
| Import/Sync | CSV + API para sincronizar | Media | Migrar leads de LinkedIn/cold | 🟠 Media | Free/API |

### Automatizaciones

| Capacidad | Qué hace | Complejidad | Valor | Prioridad | Plan |
|---|---|---|---|---|---|
| Triggers | Joins group, Completes form, Clicks link, Updated field, Joins segment, Anniversary, Exact date, E-commerce | Baja-Media | Activan todo el journey | 🔴 Alta | Free |
| Delays | Esperas entre pasos (días/horas) | Baja | Cadencia de nurturing | 🔴 Alta | Free |
| Conditional logic | Branching (if/else por campo o comportamiento) | Media | Personalizar por plan/estado | 🟠 Media | Free |
| Multi-step flows | Workflows visuales encadenados | Media | Secuencias completas | 🔴 Alta | Free |
| **Multi-trigger** | Varios triggers en una automation | Media | Consolidar flujos | 🟡 Baja-ahora | **Pago** |
| Behavioral | Disparo por clicks/aperturas | Media | Lead scoring implícito | 🟠 Media | Free |

### Email Marketing

| Capacidad | Qué hace | Complejidad | Valor | Prioridad | Plan |
|---|---|---|---|---|---|
| Campaigns/Broadcasts | Envíos puntuales a grupos/segmentos | Baja | Newsletter técnica, anuncios | 🟠 Media | Free |
| Templates premium | Plantillas diseñadas | Baja | Estética de marca | 🟡 Baja | **Pago** |
| A/B Testing | Probar asunto/contenido | Baja | Optimizar conversión | 🟠 Media | Free |
| Personalización | Merge fields (nombre, empresa, plan…) | Baja | Relevancia 1-a-1 | 🔴 Alta | Free |
| Contenido dinámico | Bloques condicionales por campo | Media | Un email, varios segmentos | 🟠 Media | **Pago** |
| Logo MailerLite | Aparece en cada email en free | — | ⚠️ Choca con marca premium B2B | — | quitar = **Pago** |

### Lead Management

| Capacidad | Qué hace | Complejidad | Valor | Prioridad |
|---|---|---|---|---|
| Captura | Forms embebidos + API desde Next.js | Baja | Entrada del funnel | 🔴 Alta |
| Clasificación | Groups + custom field `estado_comercial` | Baja | Saber en qué etapa está cada lead | 🔴 Alta |
| Segmentación | Segments dinámicos por comportamiento | Media | Priorizar esfuerzo comercial | 🟠 Media |
| Enriquecimiento | Custom fields (empresa, cargo, valor) | Baja | Contexto para la venta | 🟠 Media |

### Reporting

| Capacidad | Qué hace | Valor | Prioridad |
|---|---|---|---|
| Open / Click rate | Métricas por campaña/automation | Medir interés | 🟠 Media |
| Conversion tracking | Objetivos en automations | Atribuir conversiones | 🟠 Media |
| Funnel analytics | Reportes de workflow | Ver dónde se cae el lead | 🟡 Baja (limitado; usar GA/eventos propios) |

### Integraciones

| Capacidad | Qué hace | Complejidad | Valor | Prioridad |
|---|---|---|---|---|
| REST API | `connect.mailerlite.com`, 120 req/min | Baja | Captura desde Next.js sin SDK | 🔴 Alta |
| Webhooks | Eventos (subscriber created/updated, etc.) hacia tu app | Media | Sync bidireccional futuro | 🟡 Baja-ahora |
| Forms | Embebidos o pop-ups | Baja | Lead magnets, newsletter | 🟠 Media |
| Landing pages | Hasta 10 en free | Baja | LPs de campaña sin tocar Next | 🟡 Baja (ya tenemos Next) |

**Conclusión Fase 1:** el plan gratis cubre el 80% de lo necesario para arrancar (captura, groups, custom fields, automations, segments, A/B, newsletter). Los límites que importan para TheoLab son: **logo en emails** y **contenido dinámico/multi-trigger** (marca premium B2B) → empujan a un plan pago barato cuando el volumen lo justifique. Lo que MailerLite **no** hace es transaccional real → Resend/MailerSend (Fase 9).

---

## FASE 2 — Mapeo al negocio de TheoLab

Embudo vigente: **Reunión intro (gratis) → Consultoría (Inicial/Completa) → Implementación (6/12m)**, con edición fundadora (10 cupos, quedan 3). Audiencia: firmas legales/contables en Colombia. Modelo contact-first.

| Etapa de negocio | Automatizaciones / valor con MailerLite |
|---|---|
| **Consultoría Inicial** | Al marcar `cliente-inicial`: secuencia de onboarding (qué esperar, cómo prepararse), recordatorio de sesión, **entrega de "El Diagnóstico"**, y a los X días **puente a Consultoría Completa o Implementación** |
| **Consultoría Completa** | Seguimiento por sesión (4 sesiones/3 semanas): recordatorios, recursos entre sesiones, recap, y cierre con **propuesta de Implementación** (upsell natural al ticket alto) |
| **Leads sin conversión** | Secuencia de recuperación: 3-4 correos de valor (casos, métricas EY/LegalTech) → reoferta de reunión gratis → última llamada con escasez fundadora |
| **Clientes activos** | Check-ins de valor, métricas del Diagnóstico, contenido técnico exclusivo, detección de nuevas necesidades → upsell Implementación |
| **Clientes antiguos / inactivos** | Reactivación: novedades del producto (harness/Orus), nuevos servicios, "lo que cambió desde su Diagnóstico" → reabrir oportunidad |

**Palanca clave:** el ticket es alto ($500K–$1.5M COP la Consultoría; Implementación a la medida). **Una sola conversión o reactivación recuperada paga años del plan.** El costo marginal de estas automations es ~0 → ROI desproporcionado.

---

## FASE 3 — Customer Journey completo

Spine del journey = custom field **`estado_comercial`** (enum) + groups por hito. Cada etapa actualiza el estado, que alimenta segments y triggers.

| Etapa | Info almacenada | Custom fields clave | Automatizaciones | Correos | Segmentación |
|---|---|---|---|---|---|
| **Descubrimiento** (anónimo) | Aún no en MailerLite | — | — | — | (eventos web / GA) |
| **Lead** (dio email) | Contacto + fuente | `estado=lead`, `fuente_lead`, `fecha_contacto` | Bienvenida + nurturing | Welcome, valor educativo | Por fuente (LinkedIn/cold/web) |
| **Prospecto** (pidió reunión / intención checkout) | Interés + plan | `estado=prospecto`, `servicio_interes`, `plan_seleccionado` | Confirmación reunión, recordatorios, instrucciones de pago | Confirmación, recordatorio | Leads calientes |
| **Cliente** (compró) | Compra + edición | `estado=cliente`, `edicion`, `valor_potencial` | Onboarding, entrega Diagnóstico, upsell | Onboarding, entregables, NPS | Clientes activos, fundadores |
| **Cliente recurrente** (Implementación / re-compra) | Contratos activos | `estado=cliente-recurrente` | Seguimiento mensual, valor continuo | Reportes, novedades | Activos high-value |
| **Cliente inactivo** | Última interacción | `estado=inactivo`, `fecha_ultima_interaccion` | Reactivación | Win-back, novedades | Inactivos >90d (segment dinámico) |

---

## FASE 4 — Segmentación avanzada

Modelo de dos capas: **Groups** (hitos permanentes, disparan automations) + **Segments** (estados dinámicos, para targeting). Custom fields son el dato; groups/segments son las vistas.

### Groups (permanentes — etiquetan el hito y disparan flujos)

| Group | Cuándo se asigna | Cómo |
|---|---|---|
| `lead-web`, `lead-linkedin`, `lead-cold` | Al capturar (fuente) | API / form |
| `intencion-inicial`, `intencion-completa` | Submit del checkout | API (Server Action) |
| `cliente-inicial`, `cliente-completa` | Pago confirmado (manual) | API / manual |
| `cliente-implementacion` | Firma de Implementación | manual |
| `edicion-fundador` | Compra dentro de los 10 cupos | API si `FOUNDER_SPOTS_LEFT>0` |
| `newsletter-tecnica` | Opt-in newsletter | form |
| `firma-legal`, `firma-contable`, `firma-otro` | Vertical declarada | form field |

### Segments (dinámicos — condiciones sobre custom fields/comportamiento)

| Segment | Condición |
|---|---|
| Leads calientes | clic en últimos 14d **y** `estado` ∈ {lead, prospecto} |
| Leads fríos | sin apertura/clic 30d **y** `estado=lead` |
| Clientes activos | `estado` ∈ {cliente, cliente-recurrente} |
| Clientes inactivos | `fecha_ultima_interaccion` > 90d **y** `estado=cliente` |
| Fundadores | `edicion = fundador` |
| Por vertical | `firma_tipo = legal` (etc.) |

**Cómo se crean:** groups vía API en el momento del evento (Server Action) o manual; segments una sola vez en el dashboard (se auto-mantienen). **Cómo se actualizan:** los groups por API/automation (`Updated field` → assign group); los segments solos al cambiar el dato. **Cómo se usan:** groups = disparador de automation y filtro grueso; segments = a quién enviar un broadcast y para priorización comercial.

---

## FASE 5 — Automatizaciones recomendadas

⚠️ En plan gratis cada automation es **single-trigger**. Diseñadas para respetarlo (una entra por group, otra por field). Multi-trigger = motivo de upgrade.

| # | Automatización | Trigger | Pasos | Condiciones | Resultado esperado |
|---|---|---|---|---|---|
| 1 | **Bienvenida** | Joins `lead-*` / Completes form | Email valor inmediato → delay 2d → recurso (caso/métrica) | Por `fuente_lead` (branching) | Lead activado, marca presente |
| 2 | **Seguimiento de lead** | Joins `lead-*` | 3 correos educativos en 7-10d hacia reunión | Si no agenda | Lead → prospecto (reunión) |
| 3 | **Recuperación lead perdido** | Updated `estado=lead` + sin interacción (segment frío) | Win-back: valor → escasez fundadora → última llamada | Detiene si agenda/compra | Recuperar % de leads dormidos |
| 4 | **Confirmación de interés** (checkout) | Completes form checkout / Joins `intencion-*` | **Instrucciones de transferencia** + qué sigue | Por plan (Inicial/Completa) | Cliente sabe cómo pagar |
| 5 | **Solicitud de reunión** | Clicks link "agendar" | Confirmación + recordatorio + prep | — | Reunión efectiva, menos no-show |
| 6 | **Seguimiento post-consultoría** | Joins `cliente-*` | Onboarding → entrega Diagnóstico → delay → **puente a Implementación** | Por tier | Upsell al ticket alto |
| 7 | **Reactivación de clientes** | Updated `estado=inactivo` | Novedades → "qué cambió desde su Diagnóstico" → reoferta | Detiene si responde | Reabrir oportunidades muertas |
| 8 | **Newsletter técnica** | Broadcast manual a `newsletter-tecnica` | Contenido del harness/Orus, casos | — | Autoridad + top-of-mind |
| 9 | **Promoción nuevos servicios** | Broadcast / Joins segment activos | Anuncio + CTA | Por vertical | Cross-sell |
| 10 | **Encuesta de satisfacción (NPS)** | Anniversary / Exact date (X días post-cliente) | Pregunta NPS → branching detractor/promotor | — | Mejora + testimonios/referidos |

---

## FASE 6 — Arquitectura técnica (Next.js)

Construida sobre el puerto `EmailService` ya definido en el spec del checkout. MailerLite es un **adapter**, no el centro.

```
┌─────────────────────────── FRONTEND (Next.js App Router) ───────────────────────────┐
│  Forms (checkout, newsletter, lead-magnet)   ·   Landing pages   ·   CTAs            │
│        │ submit                                                                       │
└────────┼─────────────────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────── BACKEND (server-only) ───────────────────────────────────┐
│  Server Actions  /  Route Handler (webhooks MailerLite → app)                         │
│        │ depende de interfaces, no de MailerLite                                       │
│        ▼                                                                               │
│  DOMINIO (lib/)                                                                        │
│   ├─ EmailService (puerto)        ── registrarLead() · enviarTransaccional()          │
│   ├─ LeadService / LifecycleService (casos de uso: capturar, clasificar, marcar)      │
│   └─ tipos de dominio (LeadContact, EstadoComercial…) — sin tipos de MailerLite       │
│        │                                                                               │
│        ▼  adapter                                                                      │
│   lib/email/mailerlite.ts  ──fetch REST──►  MailerLite API (subscribers, groups, fields)
│   (futuro) lib/email/resend.ts  para transaccional real                               │
└───────────────────────────────────────────────────────────────────────────────────────┘
         ▲                                                   │
         │ webhooks (opcional, Fase 4)                       │ automations (dashboard)
         └────────────── MailerLite ◄───────────────────────┘  envían correos al cliente
```

- **Frontend:** solo captura + UX. No conoce MailerLite.
- **Backend:** Server Actions llaman casos de uso; un Route Handler `/api/webhooks/mailerlite` recibe eventos (Fase 4) para sincronizar estado de vuelta.
- **Dominio:** `LeadService`/`LifecycleService` orquestan; dependen del puerto. Tipos propios → MailerLite es reemplazable.
- **Infraestructura:** envs server-side, rate limit 120/min (batch + idempotencia si crece), validación a mano, secrets solo en Vercel.

---

## FASE 7 — Estrategia de datos (custom fields)

| Nivel | Campo | Tipo | Valor de negocio |
|---|---|---|---|
| **Obligatorio** | `name` (built-in) | texto | Personalización |
| | `email` (built-in) | email | Identidad/contacto |
| **Recomendado** | `empresa` | texto | B2B: a quién representamos |
| | `cargo` | texto | Socio vs analista → mensaje correcto |
| | `pais` / `ciudad` | texto | Segmentación geográfica (Colombia first) |
| | `telefono` | texto | Canal WhatsApp (Juan) |
| | `servicio_interes` | texto | Qué quiere (Consultoría/Implementación) |
| | `plan_seleccionado` | texto | Inicial/Completa → automation correcta |
| | `fecha_contacto` | fecha | Antigüedad del lead, anniversary triggers |
| **Avanzado** | `fuente_lead` | texto | Atribución (LinkedIn/cold/web) → ROI por canal |
| | `estado_comercial` | texto(enum) | **Spine del lifecycle**: lead/prospecto/cliente/recurrente/inactivo |
| | `edicion` | texto | fundador/regular → escasez y pricing |
| | `valor_potencial` | número | Priorizar comercialmente (ticket esperado) |
| | `fecha_ultima_interaccion` | fecha | Alimenta segment "inactivos" + reactivación |

`estado_comercial` y `fecha_ultima_interaccion` son los dos campos que más trabajo hacen: gobiernan segments dinámicos y triggers `Updated field`.

---

## FASE 8 — Roadmap de implementación

| Fase | Alcance | Esfuerzo | Riesgo | Beneficio | Dependencias |
|---|---|---|---|---|---|
| **1 — Quick wins (0-30d)** | Captura de lead en checkout + welcome + instrucciones de pago + notificación interna + form de newsletter. Custom fields base | Bajo | Bajo | Alto (cierra el loop de venta) | Spec checkout, envs, automation de pago |
| **2 — Automatización (30-60d)** | Secuencias: nurturing de lead, solicitud/recordatorio de reunión, seguimiento post-consultoría | Medio | Bajo | Alto (más reuniones, upsell) | Fase 1, groups definidos |
| **3 — Optimización (60-90d)** | Segments dinámicos (calientes/fríos/inactivos), `estado_comercial` lifecycle, recuperación de leads, A/B en asuntos | Medio | Medio (lógica en dashboard) | Medio-Alto (recupera leads dormidos) | Fase 2, custom fields avanzados |
| **4 — Escalamiento (90d+)** | NPS, reactivación de clientes, promo de nuevos servicios, **webhooks bidireccionales**, evaluar plan pago (logo/dinámico) y **Resend para transaccional** | Alto | Medio | Alto (LTV, referidos) | Fases 1-3, decisión de plan/proveedor |

---

## FASE 9 — Riesgos y limitaciones

| Tema | Detalle | Acción |
|---|---|---|
| **No usar para transaccional real** | Recibos, password reset, confirmaciones por-orden con payload dinámico | → **Resend** (Next.js-native, React Email versionado) o **MailerSend** |
| **Cuándo entra Resend/MailerSend** | Cuando: (a) el correo de pago deba ser fiable/deliverable como transaccional, (b) haya recibos/credenciales, (c) la notificación interna deba ser instantánea y robusta | Fase 4 (o antes si la fiabilidad del cobro lo exige) |
| **Cap de 500 subs (free)** | Sept-2025 bajó de 1.000→500. El marketing puede toparlo | Podar inactivos o **upgrade** (barato) cuando se acerque |
| **Multi-trigger no en free** | Cada automation = 1 trigger | Diseñar single-trigger (Fase 5) o upgrade |
| **Logo + sin contenido dinámico (free)** | Choca con posicionamiento premium B2B | Evaluar Growing Business temprano (costo bajo) por marca |
| **Lógica en dashboard, no en git** | Automations/plantillas no versionadas → cambios sin rastro | Documentar cada flow en este repo; revisar antes de editar |
| **Deliverability mezclada** | Transaccional con reputación de marketing | Separar con Resend cuando importe |
| **Dependencia de un proveedor** | Lock-in | Mitigado por el puerto `EmailService` (swap = 1 adapter) |

**Qué NO debería hacerse con MailerLite:** transaccional crítico, almacenar PII sensible más allá de lo comercial, ni meter lógica de negocio dura en automations imposibles de testear.

---

## FASE 10 — Recomendación ejecutiva

### Resumen ejecutivo
MailerLite puede ser el **CRM + motor de lifecycle** de TheoLab, no un "enviador de correos". Con el plan gratis se cubre captura, clasificación, nurturing, segmentación y newsletter. El diferencial está en modelar el **journey con `estado_comercial` + groups + segments** y automatizar las transiciones. Dado el ticket alto, el ROI es desproporcionado: el costo es ~0 y una sola conversión/reactivación lo justifica. MailerLite **no** hace transaccional real → se reserva Resend para esa capa, desacoplada vía el puerto `EmailService`.

### Quick wins inmediatos (0-30d)
1. Captura de lead en el checkout (groups `intencion-*` + custom fields).
2. Automation de **instrucciones de pago** + **notificación interna**.
3. Welcome sequence + form de **newsletter técnica**.
4. Definir los custom fields base (`estado_comercial`, `fuente_lead`, `plan_seleccionado`, `edicion`).

### Funcionalidades de alto impacto
Groups como spine de triggers · `estado_comercial` como columna del lifecycle · segments dinámicos (calientes/fríos/inactivos) · automation post-consultoría (upsell a Implementación) · recuperación de leads dormidos.

### Arquitectura recomendada
Puerto `EmailService` + adapter MailerLite (`fetch`, sin SDK) + `LifecycleService` de dominio. MailerLite reemplazable; Resend se añade para transaccional sin tocar negocio.

### Roadmap priorizado
Fase 1 quick wins → Fase 2 automatización → Fase 3 segmentación/lifecycle → Fase 4 NPS/reactivación/webhooks + evaluar plan pago y Resend. (Detalle en Fase 8.)

### ROI esperado (cualitativo, ticket alto B2B)
| Implementación | Palanca de valor |
|---|---|
| Instrucciones de pago automatizadas | Cierra ventas sin fricción manual (Juan deja de hacerlo a mano) |
| Nurturing de lead | + reuniones agendadas desde el mismo tráfico |
| Recuperación de leads | Ingresos de leads que hoy se pierden (~0 costo) |
| Upsell post-consultoría | Mueve clientes al ticket alto (Implementación) |
| Reactivación | Reabre LTV de clientes dormidos |
| NPS | Testimonios/referidos → reduce CAC |

### Plan 30 / 60 / 90 días
- **30:** custom fields base + captura en checkout + automations de pago/notificación + welcome + newsletter. (Fase 1)
- **60:** nurturing de lead + flujo de reunión + seguimiento post-consultoría. (Fase 2)
- **90:** segments dinámicos + lifecycle `estado_comercial` + recuperación de leads + A/B. Evaluar plan pago (marca) y necesidad de Resend. (Fase 3 → puerta a Fase 4)

---

## Decisión que esto deja abierta para el spec del checkout
El checkout (Fase 1) debe escribir desde ya los custom fields del journey (`estado_comercial=prospecto`, `fuente_lead`, `plan_seleccionado`, `edicion`) y asignar group `intencion-*`, para no rehacer la captura cuando lleguen las Fases 2-4. Es ampliar el `registrarLead()` del spec, no cambiar su arquitectura.
