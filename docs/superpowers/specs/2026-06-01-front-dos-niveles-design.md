# Spec — Front de dos niveles (D-3): home institucional + landing legal-first

**Status:** DISEÑO APROBADO (Alexis + Juan José, 2026-06-01). Listo para plan de implementación.
**Repo:** `TheoLab-AI/frontend`.
**Stack:** Next.js 16 (App Router) · Tailwind v4 · Radix · Motion · Biome · pnpm.
**Alcance de la sesión origen:** *spec + plan*. La implementación en código es una sesión posterior (vía `/workflow`).
**Fuente estratégica:** [`docs/strategy/modelo-negocio.md`](https://github.com/TheoLab-AI/docs) + `plan-operativo.md`. Marca: Design System (`docs/brand/design-system`).

---

## 1. Objetivo

Reestructurar el front, hoy una landing v0.0.1 de página única, a la **web de dos niveles** que fija el modelo de negocio (decisión **D-3**):

1. **Home institucional** (`/`) — la empresa. Audiencia: técnica, inversión, partners, credibilidad general. Aquí el harness **es visible** (D-2).
2. **Landing legal-first de conversión** (`/consultoria`) — un solo destino de venta. Audiencia: **el socio de una firma legal SME colombiana**. Habla solo su lenguaje (horas, riesgo, clientes); **nunca** nombra harness, modelos ni jerga de IA.

Cada superficie le habla a su audiencia **sin contaminarse** (Enfoque A: dos superficies con shell compartido mínimo, sin navegación común).

---

## 2. Decisiones cerradas (entradas al diseño)

Del modelo de negocio (no re-litigar) + de la sesión de brainstorming 2026-06-01:

| # | Decisión |
|---|---|
| **Arquitectura** | **Enfoque A** — dos superficies, design system compartido, **sin nav común**. La landing de conversión no tiene fugas de atención. |
| **Ruta legal** | **`/consultoria`** (la home institucional vive en `/`). |
| **Precios en la landing** | **Regular público**: Consultoría inicial **$500.000** / completa **$1.500.000** (COP). El precio fundador **$200.000 es herramienta interna** — NO aparece en la web (TD-3). |
| **Caso "Gases de Occidente"** | **Eliminar** de `Services` — la tracción comercial declarada es cero; un caso no verificable contradice "evidencia antes que promesa". |
| **CTA legal** | **WhatsApp (Juan José `+57 318 2395252`) + `admin@theolab.tech`.** Infraestructura manual (G-4): sin pasarela ni agenda integrada. |
| **C-4 (encuadre de salida, D-4)** | **Propiedad fuerte en la web**: "usted es dueño de su entorno, datos, configuración y Diagnóstico". Los términos de **licencia del motor y transición de salida** se acuerdan en la Consultoría/contrato, **no** en la web. |
| **C-1 (promesa, voz)** | Promesa canónica **18–27 horas/mes** para todo el front. Se retira "15–30" del Design System. Voz validada por Juan José. |
| **Nombres de servicios** | **"Consultoría"** y **"Implementación"**. "El Diagnóstico" = el entregable de la Consultoría, no un producto. |
| **Dominio** | `theolab.tech` (apex) + `www`. `metadataBase = https://theolab.tech`. |
| **Harness en la web** | Visible en la home institucional (D-2, audiencia técnica/inversión). **Prohibido** nombrarlo en `/consultoria`. |

---

## 3. Arquitectura de rutas y layouts (App Router)

```
app/
├── layout.tsx              # root NEUTRO: <html>, fuentes, globals.css, metadata base. SIN nav ni footer.
├── (institucional)/
│   ├── layout.tsx          # nav institucional + Footer institucional
│   └── page.tsx            # /  → Hero · Services · Evidence · Philosophy
├── consultoria/
│   ├── layout.tsx          # header ligero (wordmark + 1 CTA) + footer mínimo
│   └── page.tsx            # /consultoria  → landing de conversión (7 secciones)
├── globals.css
├── sitemap.ts              # / y /consultoria
├── robots.ts
└── favicon.ico
```

**Decisión load-bearing:** el **root layout queda neutro** (solo `<html>`, fuentes, CSS, metadata base). Cada superficie aporta su propio layout con su nav/footer. Así `/consultoria` **no hereda** la navegación institucional → materializa el Enfoque A.

El route group `(institucional)` da layout propio a la home (y a futuras páginas institucionales: `/empresa`, `/blog`) **sin** añadir segmento a la URL: la home sigue siendo `/`.

---

## 4. Superficie 1 — Home institucional (`/`)

Refina lo existente; no se tira nada. Secciones:

- **Hero** — mantiene el tagline del DS ("Tú sabes el qué — nosotros traemos el cómo."). Subtitle ajustado a la narrativa de dos capas (empresa de adopción de IA, plataforma agnóstica, entrada legal). Añade un **puente al nivel legal**: CTA secundario "¿Dirige una firma legal? → Consultoría" hacia `/consultoria`. Mantiene el motivo editorial ya depurado (`TL · 01 / 04`).
- **Services** — se conservan las 4 líneas (Infraestructura IA, Adopción IA empresarial, Automatización y agentes, Tecnología jurídica). **Se elimina** el *proof* "Caso vivo · Asesora de Gases de Occidente"; cada *proof* restante debe ser verificable (harness, repos públicos) o neutro ("pipeline abierto").
- **Evidence** — métricas del harness (D-2). **Verificar que el sha y los números estén al día** con el harness actual antes de implementar.
- **Philosophy** — intacta (3 principios).
- **Footer institucional** — el ya corregido (`admin@theolab.tech`, sin `theolab.ai`).

---

## 5. Superficie 2 — Landing legal-first (`/consultoria`) — NUEVA

Audiencia: **solo el socio**. Voz: español colombiano **formal (usted)**, persona *The Archivist*, **zero-buzzword**. Traducir todo a horas/riesgo/clientes. **No** nombrar harness/modelos/IA-buzz. Siete secciones en orden de conversión (framework de mensajes — el copy final palabra-por-palabra se redacta en implementación y lo valida Juan, C-1):

1. **Header ligero + Hero**
   - Header: wordmark + un único CTA ("Agendar reunión de introducción"). Sin más navegación.
   - Headline (dirección): *"Recupere entre 18 y 27 horas profesionales al mes. Medidas, no prometidas."*
   - Subhead: inteligencia artificial aplicada a firmas legales colombianas, con criterio sobre **dónde** recupera horas y baja riesgo.
   - CTA primario → WhatsApp (Juan José) + email.

2. **El problema (trigger)** — reconocer el dolor del socio: la propuesta perdida porque el competidor respondió primero; el junior usando ChatGPT con información confidencial **sin control**; el equipo desbordado en tareas que no facturan. Mensaje: la IA mal adoptada es riesgo; bien adoptada, son horas recuperadas.

3. **Qué hacemos (traducido)** — el diferenciador, en su lenguaje: **(1)** vertical legal (hablamos el idioma del socio), **(2)** **usted es dueño de lo suyo**, **(3)** ROI **medido** (cifras reproducibles, no "transformación"). Sin jerga técnica.

4. **El embudo / cómo empezamos**
   - **Reunión de introducción** — gratis, remota (Meet). Conocer su caso, validar encaje mutuo. Sin compromiso.
   - **Consultoría** → entrega **el Diagnóstico** (informe/plan documentado de dónde la IA recupera horas y baja riesgo, con métricas):
     - *Inicial*: 1 sesión de 2 h + Diagnóstico en 1 semana — **$500.000**.
     - *Completa*: inicial + 4 sesiones en 3 semanas — **$1.500.000**.
   - **Implementación** — construcción a medida de los agentes que el Diagnóstico identificó, con operación y mantenimiento (planes de 6 o 12 meses). **Precio a la medida, definido tras la Consultoría** (sin cifra en la web — TD-2).

5. **Propiedad y confidencialidad (D-4 — encuadre C-4)** — *"Usted es dueño de su entorno, sus datos, la configuración de sus agentes y su Diagnóstico — desde el primer día y al terminar."* Resuelve la objeción de confidencialidad (secreto profesional + Ley 1581) y la de continuidad. Los términos de la licencia del motor y la transición de salida **no van en la web**: se tratan en la Consultoría/contrato.

6. **CTA final** — *"Conversemos. La reunión de introducción es gratuita y sin compromiso."* → WhatsApp (Juan José `+57 318 2395252`) + `admin@theolab.tech`.

7. **Footer mínimo** — wordmark, email, ©. **Sin** la navegación institucional.

---

## 6. Componentes

**Reutilizar sin cambios:** `lib/tokens.ts`, `app/globals.css` (design tokens), `components/ui/Button`, `Wordmark`, `SectionLabel`, `Badge`, `components/motion/variants`, `components/seo/JsonLd`, `components/ui/icons/*`.

**Refinar (institucional):** `Hero` (subtitle + puente legal), `Services` (quitar GdO), `Footer`.

**Crear (`components/consultoria/`):** `ConsultoriaHeader` (header ligero), `ConsultoriaHero`, `ProblemSection`, `ValueProp`, `OfferLadder` (embudo + precios), `OwnershipSection` (D-4), `ConsultoriaCTA`, `ConsultoriaFooter`.

**Crear (compartido):** `ContactCTA` — genera el link de WhatsApp (`https://wa.me/573182395252`) y el `mailto:admin@theolab.tech` desde una sola fuente, reutilizable por ambas superficies.

---

## 7. Voz, copy y promesa

- **Promesa canónica:** **18–27 horas/mes**, medidas. Único rango en todo el front. (Tarea derivada: retirar "15–30" del Design System.)
- **Voz:** formal colombiano (usted), 70% Sage / 30% Magician, *The Archivist*. Zero-buzzword (`AI-powered`, `disruptive`, `revolutionary`, `synergy`, `leverage`, etc. — prohibidos). Anti-promesa: nunca "revolucionar", "10×", "transformación".
- **Regla de aislamiento de audiencias:** la home institucional puede nombrar el harness y hablar en clave técnica; `/consultoria` **jamás** nombra harness/modelos — todo se traduce a beneficio.
- **Copy final:** se redacta en la fase de implementación y lo valida Juan antes de publicar (C-1). Este spec fija el **framework de mensajes**, no las frases definitivas.

---

## 8. SEO / metadata

- `metadataBase = https://theolab.tech`.
- **Home (`/`):** title/description institucionales; OG limpio (sin "CONFIDENTIAL" ni legacy); `JsonLd` `Organization`.
- **`/consultoria`:** title orientado a legal ("Consultoría de IA para firmas legales — TheoLab"); description con la promesa de horas; OG propio; **indexable**. `JsonLd` `Service`/`Offer` (precios regulares en COP, opcional).
- `sitemap.ts`: `/` + `/consultoria`. `robots.ts`: permitir ambas.

---

## 9. Testing + gate de coherencia

- **Vitest (render):** `ConsultoriaHero` (headline con "18" y "27"); `OfferLadder` (presentes `$500.000` y `$1.500.000`; **ausente** `$200.000`); `ContactCTA` (`wa.me/573182395252` + `mailto:admin@theolab.tech`).
- **Gate de coherencia automatizado (test que falla si):** `/consultoria` renderiza la palabra "harness", "theolab.ai", "PL ·", "15–30" o la nav institucional; la home renderiza "Gases de Occidente". **Institucionaliza la depuración de esta sesión** para que no reincida.
- **Playwright (e2e):** `/` y `/consultoria` cargan; el CTA existe y apunta al `href` correcto (WhatsApp + mailto).
- Se **extienden** los 3 tests Vitest + 4 Playwright actuales; ninguno se elimina.
- Gate del repo: lint Biome + typecheck deben pasar (sin `--no-verify`).

---

## 10. Fuera de alcance / diferido

- **Páginas de pauta (campañas):** bloqueadas por contenido (faltan campañas + mensajes). No entran en este spec.
- **Copy final palabra-por-palabra:** se redacta en implementación; aquí solo el framework.
- **TD-1** — contenido fino del Diagnóstico + estandarización del método de la Consultoría: la landing lo describe a **alto nivel**; el detalle no bloquea el front.
- **TD-2** — precio/alcance de la Implementación: sin cifra en la web por decisión del modelo.
- **Pasarela de pago / agenda integrada:** G-4 manual al inicio. No se construye.
- **Scaffold / código:** sesión de implementación posterior.

---

## 11. Tareas derivadas (para el plan / implementación)

1. **Unificar la promesa en el Design System:** retirar "15–30 horas" y dejar "18–27" (ratificado por Juan, 2026-06-01). Toca `docs/brand/design-system/README.md`, `preview/type-body.html` y donde aparezca. Es coherencia documental (repo `docs`).
2. **Verificar Evidence:** que el sha y las métricas del harness mostrados estén al día con el harness actual.
3. **Confirmar formato del link de WhatsApp** y mensaje pre-cargado opcional (`?text=`).

---

## 12. Procedencia

- Estrategia: `docs/strategy/modelo-negocio.md` (D-1..D-4, O-1..O-4, G-4, E-1/E-3, §11 TD-1..TD-3), `plan-operativo.md` (A-1..A-7, C-1/C-4, anexo §8 dominio).
- Marca: `docs/brand/design-system/README.md` (voz, promesa, zero-buzzword).
- Decisiones de la sesión de brainstorming Alexis + Juan José, 2026-06-01.
