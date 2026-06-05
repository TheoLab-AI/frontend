# Checkout Consultoría (Fase 1) Implementation Plan

> **Estado:** ✅ completado e integrado en `main` (PR #5, 2026-06-04). Todas las tareas implementadas con gates verdes (typecheck · biome · vitest 76/76 · e2e). Los checkboxes `- [ ]` de abajo son el plan original; no se re-marcan uno a uno. **Adaptación de integración:** se añadió el flag `NEXT_PUBLIC_CHECKOUT_ENABLED` (`lib/flags.ts`) para dejar el feature "dark" en prod hasta configurar las env — ver `DESIGN-DECISIONS.md` → ADR-F3.
>
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la ruta `/checkout` self-service post-reunión que captura el lead en MailerLite (con custom fields del journey) y muestra instrucciones de transferencia bancaria.

**Architecture:** El checkout depende de un puerto `EmailService`; MailerLite es un adapter (`fetch` REST, sin SDK). El precio se deriva de `lib/oferta.ts` (`STEPS` + `FOUNDER_SPOTS_LEFT`) — un-dato-un-dueño. La lógica de negocio vive en funciones puras testeables (`procesarCheckout`); la Server Action es una cáscara delgada.

**Tech Stack:** Next 16 (App Router, Server Actions, React 19 `useActionState`), TypeScript, vitest + @testing-library/react, Biome (tabs).

**Specs:** [`docs/superpowers/specs/2026-06-03-checkout-consultoria-design.md`](../../docs/superpowers/specs/2026-06-03-checkout-consultoria-design.md) · [`docs/superpowers/specs/2026-06-03-mailerlite-growth-architecture.md`](../../docs/superpowers/specs/2026-06-03-mailerlite-growth-architecture.md)

**Convenciones del repo:**
- Comandos: `pnpm test` (vitest), `pnpm typecheck` (tsc), `pnpm check` (Biome lint+format).
- Estilo: **tabs**, imports con alias `@/`, comillas dobles. Correr `pnpm check` antes de cada commit.
- Tests co-ubicados en `tests/unit/`. Commits conventional: `feat(checkout): ...`.

---

### Task 1: Helpers de plan/precio en `lib/oferta.ts`

**Files:**
- Modify: `lib/oferta.ts` (añadir al final, sin tocar `STEPS`)
- Test: `tests/unit/oferta-checkout.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// tests/unit/oferta-checkout.test.ts
import { describe, expect, it } from "vitest";
import {
	getConsultoriaPlan,
	getConsultoriaPlans,
	getEffectivePrice,
} from "@/lib/oferta";

describe("getConsultoriaPlans", () => {
	it("deriva los dos tiers desde STEPS con sus ids", () => {
		const plans = getConsultoriaPlans();
		expect(plans.map((p) => p.id)).toEqual(["inicial", "completa"]);
		expect(plans[0].precioRegular).toBe("$500.000");
		expect(plans[0].precioFundador).toBe("$200.000");
	});
});

describe("getConsultoriaPlan", () => {
	it("devuelve el plan por id", () => {
		expect(getConsultoriaPlan("completa")?.precioRegular).toBe("$1.500.000");
	});
	it("devuelve undefined para id desconocido", () => {
		// @ts-expect-error id inválido a propósito
		expect(getConsultoriaPlan("xyz")).toBeUndefined();
	});
});

describe("getEffectivePrice", () => {
	it("usa precio fundador cuando hay cupos (FOUNDER_SPOTS_LEFT > 0)", () => {
		const plan = getConsultoriaPlan("inicial")!;
		const eff = getEffectivePrice(plan);
		// Con FOUNDER_SPOTS_LEFT=3 en el código actual:
		expect(eff).toEqual({ precio: "$200.000", edicion: "fundador", note: "Fundador · 10 cupos" });
	});
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm test tests/unit/oferta-checkout.test.ts`
Expected: FAIL — `getConsultoriaPlans is not a function`.

- [ ] **Step 3: Implementar los helpers**

Añadir al final de `lib/oferta.ts`:

```ts
export type ConsultoriaPlanId = "inicial" | "completa";

export interface ResolvedPlan {
	id: ConsultoriaPlanId;
	label: string;
	detail: string;
	precioRegular: string;
	precioFundador?: string;
	founderNote?: string;
}

const CONSULTORIA_STEP_INDEX = 1;
const PLAN_ID_BY_LABEL: Record<string, ConsultoriaPlanId> = {
	Inicial: "inicial",
	Completa: "completa",
};

/** Deriva los tiers de Consultoría desde STEPS (fuente única). */
export function getConsultoriaPlans(): ResolvedPlan[] {
	const options = STEPS[CONSULTORIA_STEP_INDEX].options ?? [];
	return options.map((o) => ({
		id: PLAN_ID_BY_LABEL[o.label],
		label: o.label,
		detail: o.detail,
		precioRegular: o.price,
		precioFundador: o.founderPrice,
		founderNote: o.founderNote,
	}));
}

export function getConsultoriaPlan(id: ConsultoriaPlanId): ResolvedPlan | undefined {
	return getConsultoriaPlans().find((p) => p.id === id);
}

/** Type guard único para el id de plan (lo reusa lib/checkout y la página). */
export function isConsultoriaPlanId(value: string | undefined): value is ConsultoriaPlanId {
	return value === "inicial" || value === "completa";
}

export interface EffectivePrice {
	precio: string;
	edicion: "fundador" | "regular";
	note?: string;
}

/** Precio fundador si quedan cupos y el plan lo ofrece; si no, regular. */
export function getEffectivePrice(plan: ResolvedPlan): EffectivePrice {
	if (FOUNDER_SPOTS_LEFT > 0 && plan.precioFundador) {
		return { precio: plan.precioFundador, edicion: "fundador", note: plan.founderNote };
	}
	return { precio: plan.precioRegular, edicion: "regular" };
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm test tests/unit/oferta-checkout.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
pnpm check
git add lib/oferta.ts tests/unit/oferta-checkout.test.ts
git commit -m "feat(checkout): helpers de plan/precio derivados de STEPS"
```

---

### Task 2: Puerto `EmailService` y tipos de dominio

**Files:**
- Create: `lib/email/types.ts`

*(Archivo solo de tipos; se testea vía el adapter en la Task 3. No requiere test propio.)*

- [ ] **Step 1: Crear el puerto y los tipos**

```ts
// lib/email/types.ts
export type EstadoComercial =
	| "lead"
	| "prospecto"
	| "cliente"
	| "cliente-recurrente"
	| "inactivo";

/** Lead capturado por el checkout + campos del journey (Fases 2-4 de la estrategia). */
export interface LeadContact {
	nombre: string;
	email: string;
	empresa: string;
	telefono: string;
	plan: "inicial" | "completa";
	precio: string;
	edicion: "fundador" | "regular";
	estadoComercial: Extract<EstadoComercial, "prospecto">;
	fuenteLead: string;
	servicioInteres: "consultoria";
	fechaContacto: string; // YYYY-MM-DD
}

export interface TransactionalMessage {
	to: string;
	template: "notificacion-interna";
	data: Record<string, string>;
}

/** Puerto: el checkout depende de esto, nunca de MailerLite directamente. */
export interface EmailService {
	registrarLead(contact: LeadContact): Promise<void>;
	enviarTransaccional(message: TransactionalMessage): Promise<void>;
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS (sin errores).

- [ ] **Step 3: Commit**

```bash
git add lib/email/types.ts
git commit -m "feat(checkout): puerto EmailService y tipos de dominio"
```

---

### Task 3: Adapter MailerLite (`fetch` REST)

**Files:**
- Create: `lib/email/mailerlite.ts`
- Test: `tests/unit/email-mailerlite.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// tests/unit/email-mailerlite.test.ts
import { describe, expect, it, vi } from "vitest";
import { createMailerLiteService } from "@/lib/email/mailerlite";
import type { LeadContact } from "@/lib/email/types";

const config = {
	apiKey: "k",
	groupInicial: "g-ini",
	groupCompleta: "g-com",
	groupFundador: "g-fun",
	groupNotify: "g-not",
};

const lead: LeadContact = {
	nombre: "Ana", email: "ana@firma.co", empresa: "Firma SAS", telefono: "3000000000",
	plan: "inicial", precio: "$200.000", edicion: "fundador",
	estadoComercial: "prospecto", fuenteLead: "web", servicioInteres: "consultoria",
	fechaContacto: "2026-06-03",
};

function okFetch() {
	return vi.fn(async () => new Response("{}", { status: 200 }));
}

describe("createMailerLiteService.registrarLead", () => {
	it("postea suscriptor con custom fields y groups intencion + fundador", async () => {
		const fetchImpl = okFetch();
		await createMailerLiteService(fetchImpl, config).registrarLead(lead);
		const [url, init] = fetchImpl.mock.calls[0];
		expect(url).toBe("https://connect.mailerlite.com/api/subscribers");
		const body = JSON.parse((init as RequestInit).body as string);
		expect(body.email).toBe("ana@firma.co");
		expect(body.fields.estado_comercial).toBe("prospecto");
		expect(body.fields.plan_seleccionado).toBe("inicial");
		expect(body.groups).toEqual(["g-ini", "g-fun"]);
		expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer k" });
	});

	it("plan completa sin fundador → solo group completa", async () => {
		const fetchImpl = okFetch();
		await createMailerLiteService(fetchImpl, config).registrarLead({
			...lead, plan: "completa", edicion: "regular",
		});
		const body = JSON.parse((fetchImpl.mock.calls[0][1] as RequestInit).body as string);
		expect(body.groups).toEqual(["g-com"]);
	});

	it("lanza error si MailerLite responde no-2xx (no silencia)", async () => {
		const fetchImpl = vi.fn(async () => new Response("nope", { status: 422 }));
		await expect(
			createMailerLiteService(fetchImpl, config).registrarLead(lead),
		).rejects.toThrow(/MailerLite 422/);
	});
});

describe("createMailerLiteService.enviarTransaccional", () => {
	it("registra la notificación interna en el group notify", async () => {
		const fetchImpl = okFetch();
		await createMailerLiteService(fetchImpl, config).enviarTransaccional({
			to: "admin@theolab.tech", template: "notificacion-interna",
			data: { nombre: "Ana", plan: "inicial" },
		});
		const body = JSON.parse((fetchImpl.mock.calls[0][1] as RequestInit).body as string);
		expect(body.email).toBe("admin@theolab.tech");
		expect(body.groups).toEqual(["g-not"]);
		expect(body.fields.nombre).toBe("Ana");
	});
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm test tests/unit/email-mailerlite.test.ts`
Expected: FAIL — `createMailerLiteService is not a function`.

- [ ] **Step 3: Implementar el adapter**

```ts
// lib/email/mailerlite.ts
import type { EmailService, LeadContact, TransactionalMessage } from "@/lib/email/types";

const API = "https://connect.mailerlite.com/api";

export interface MailerLiteConfig {
	apiKey: string;
	groupInicial: string;
	groupCompleta: string;
	groupFundador: string;
	groupNotify: string;
}

function readConfig(): MailerLiteConfig {
	const apiKey = process.env.MAILERLITE_API_KEY;
	const groupInicial = process.env.MAILERLITE_GROUP_INICIAL;
	const groupCompleta = process.env.MAILERLITE_GROUP_COMPLETA;
	const groupFundador = process.env.MAILERLITE_GROUP_FUNDADOR;
	const groupNotify = process.env.MAILERLITE_GROUP_NOTIFY;
	if (!apiKey || !groupInicial || !groupCompleta || !groupFundador || !groupNotify) {
		throw new Error("MailerLite: faltan variables de entorno");
	}
	return { apiKey, groupInicial, groupCompleta, groupFundador, groupNotify };
}

export function createMailerLiteService(
	fetchImpl: typeof fetch = fetch,
	config: MailerLiteConfig = readConfig(),
): EmailService {
	async function postSubscriber(body: unknown): Promise<void> {
		const res = await fetchImpl(`${API}/subscribers`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${config.apiKey}`,
			},
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`MailerLite ${res.status}: ${text}`);
		}
	}

	return {
		async registrarLead(c: LeadContact): Promise<void> {
			const groups = [c.plan === "inicial" ? config.groupInicial : config.groupCompleta];
			if (c.edicion === "fundador") groups.push(config.groupFundador);
			await postSubscriber({
				email: c.email,
				fields: {
					name: c.nombre,
					empresa: c.empresa,
					telefono: c.telefono,
					plan_seleccionado: c.plan,
					edicion: c.edicion,
					estado_comercial: c.estadoComercial,
					fuente_lead: c.fuenteLead,
					servicio_interes: c.servicioInteres,
					fecha_contacto: c.fechaContacto,
				},
				groups,
			});
		},
		async enviarTransaccional(m: TransactionalMessage): Promise<void> {
			await postSubscriber({
				email: m.to,
				fields: { ...m.data },
				groups: [config.groupNotify],
			});
		},
	};
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm test tests/unit/email-mailerlite.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
pnpm check
git add lib/email/mailerlite.ts tests/unit/email-mailerlite.test.ts
git commit -m "feat(checkout): adapter MailerLite via fetch REST"
```

---

### Task 4: Factory `getEmailService()`

**Files:**
- Create: `lib/email/index.ts`
- Test: `tests/unit/email-factory.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// tests/unit/email-factory.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { getEmailService } from "@/lib/email";

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("getEmailService", () => {
	it("devuelve el adapter MailerLite cuando EMAIL_PROVIDER=mailerlite", () => {
		vi.stubEnv("EMAIL_PROVIDER", "mailerlite");
		vi.stubEnv("MAILERLITE_API_KEY", "k");
		vi.stubEnv("MAILERLITE_GROUP_INICIAL", "a");
		vi.stubEnv("MAILERLITE_GROUP_COMPLETA", "b");
		vi.stubEnv("MAILERLITE_GROUP_FUNDADOR", "c");
		vi.stubEnv("MAILERLITE_GROUP_NOTIFY", "d");
		const svc = getEmailService();
		expect(typeof svc.registrarLead).toBe("function");
	});

	it("lanza error para un proveedor no soportado", () => {
		vi.stubEnv("EMAIL_PROVIDER", "carrierpigeon");
		expect(() => getEmailService()).toThrow(/no soportado/);
	});
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm test tests/unit/email-factory.test.ts`
Expected: FAIL — `getEmailService is not a function`.

- [ ] **Step 3: Implementar la factory**

```ts
// lib/email/index.ts
import { createMailerLiteService } from "@/lib/email/mailerlite";
import type { EmailService } from "@/lib/email/types";

/** Selecciona el proveedor por EMAIL_PROVIDER. Fase 2: añadir "resend". */
export function getEmailService(): EmailService {
	const provider = process.env.EMAIL_PROVIDER ?? "mailerlite";
	switch (provider) {
		case "mailerlite":
			return createMailerLiteService();
		default:
			throw new Error(`EMAIL_PROVIDER no soportado: ${provider}`);
	}
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm test tests/unit/email-factory.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
pnpm check
git add lib/email/index.ts tests/unit/email-factory.test.ts
git commit -m "feat(checkout): factory getEmailService por env"
```

---

### Task 5: Validación + núcleo `procesarCheckout` en `lib/checkout.ts`

**Files:**
- Create: `lib/checkout.ts`
- Test: `tests/unit/checkout.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// tests/unit/checkout.test.ts
import { describe, expect, it, vi } from "vitest";
import { isValidPlan, procesarCheckout, validateCheckout } from "@/lib/checkout";
import type { EmailService } from "@/lib/email/types";

function fakeEmail(overrides: Partial<EmailService> = {}): EmailService {
	return {
		registrarLead: vi.fn(async () => {}),
		enviarTransaccional: vi.fn(async () => {}),
		...overrides,
	};
}

const validInput = {
	nombre: "Ana", email: "ana@firma.co", empresa: "Firma SAS",
	telefono: "3000000000", plan: "inicial", fuente: "linkedin",
};

describe("validateCheckout", () => {
	it("sin errores con datos válidos", () => {
		expect(validateCheckout({ ...validInput, plan: "inicial" })).toEqual({});
	});
	it("marca email inválido y campos vacíos", () => {
		const e = validateCheckout({ nombre: "", email: "x", empresa: "", telefono: "", plan: "inicial" });
		expect(e.nombre).toBeDefined();
		expect(e.email).toBeDefined();
		expect(e.empresa).toBeDefined();
		expect(e.telefono).toBeDefined();
	});
});

describe("isValidPlan", () => {
	it("acepta inicial/completa y rechaza el resto", () => {
		expect(isValidPlan("inicial")).toBe(true);
		expect(isValidPlan("gratis")).toBe(false);
		expect(isValidPlan(undefined)).toBe(false);
	});
});

describe("procesarCheckout", () => {
	it("registra el lead con precio derivado y devuelve ok", async () => {
		const email = fakeEmail();
		const res = await procesarCheckout(validInput, email);
		expect(res.ok).toBe(true);
		const arg = (email.registrarLead as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(arg.plan).toBe("inicial");
		expect(arg.estadoComercial).toBe("prospecto");
		expect(arg.fuenteLead).toBe("linkedin");
		expect(arg.precio).toBe("$200.000"); // fundador, cupos disponibles
	});

	it("devuelve errores de validación sin llamar al email", async () => {
		const email = fakeEmail();
		const res = await procesarCheckout({ ...validInput, email: "malo" }, email);
		expect(res.ok).toBe(false);
		expect(email.registrarLead).not.toHaveBeenCalled();
	});

	it("plan inválido → ok:false sin llamar al email", async () => {
		const email = fakeEmail();
		const res = await procesarCheckout({ ...validInput, plan: "zzz" }, email);
		expect(res.ok).toBe(false);
		expect(email.registrarLead).not.toHaveBeenCalled();
	});

	it("si el email falla, no silencia: ok:false con mensaje de fallback", async () => {
		const email = fakeEmail({
			registrarLead: vi.fn(async () => {
				throw new Error("boom");
			}),
		});
		const res = await procesarCheckout(validInput, email);
		expect(res.ok).toBe(false);
		expect(res).toMatchObject({ message: expect.stringContaining("WhatsApp") });
	});

	it("usa fuente 'web' por defecto si no viene", async () => {
		const email = fakeEmail();
		await procesarCheckout({ ...validInput, fuente: "" }, email);
		const arg = (email.registrarLead as ReturnType<typeof vi.fn>).mock.calls[0][0];
		expect(arg.fuenteLead).toBe("web");
	});
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm test tests/unit/checkout.test.ts`
Expected: FAIL — `procesarCheckout is not a function`.

- [ ] **Step 3: Implementar `lib/checkout.ts`**

```ts
// lib/checkout.ts
import type { EmailService } from "@/lib/email/types";
import {
	type ConsultoriaPlanId,
	getConsultoriaPlan,
	getEffectivePrice,
	isConsultoriaPlanId,
} from "@/lib/oferta";

export interface CheckoutInput {
	nombre: string;
	email: string;
	empresa: string;
	telefono: string;
	plan: string;
	fuente: string;
}

export type CheckoutErrors = Partial<Record<"nombre" | "email" | "empresa" | "telefono" | "plan", string>>;

export type CheckoutResult =
	| { ok: true }
	| { ok: false; errors?: CheckoutErrors; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_MSG =
	"No pudimos registrar tu solicitud. Escríbenos por WhatsApp o a admin@theolab.tech y la cerramos contigo.";

/** Reusa el guard único de oferta.ts (un-dato-un-dueño). */
export const isValidPlan = isConsultoriaPlanId;

export function validateCheckout(input: Partial<CheckoutInput>): CheckoutErrors {
	const errors: CheckoutErrors = {};
	if (!input.nombre?.trim()) errors.nombre = "Ingrese su nombre.";
	if (!input.email?.trim()) errors.email = "Ingrese su correo.";
	else if (!EMAIL_RE.test(input.email)) errors.email = "Correo no válido.";
	if (!input.empresa?.trim()) errors.empresa = "Ingrese su empresa.";
	if (!input.telefono?.trim()) errors.telefono = "Ingrese su teléfono.";
	if (!isValidPlan(input.plan)) errors.plan = "Plan no válido.";
	return errors;
}

export async function procesarCheckout(
	input: CheckoutInput,
	email: EmailService,
): Promise<CheckoutResult> {
	const errors = validateCheckout(input);
	if (Object.keys(errors).length > 0) return { ok: false, errors };

	const plan = input.plan as ConsultoriaPlanId;
	const resolved = getConsultoriaPlan(plan);
	if (!resolved) return { ok: false, message: FALLBACK_MSG };
	const { precio, edicion } = getEffectivePrice(resolved);

	try {
		await email.registrarLead({
			nombre: input.nombre.trim(),
			email: input.email.trim(),
			empresa: input.empresa.trim(),
			telefono: input.telefono.trim(),
			plan,
			precio,
			edicion,
			estadoComercial: "prospecto",
			fuenteLead: input.fuente.trim() || "web",
			servicioInteres: "consultoria",
			fechaContacto: new Date().toISOString().slice(0, 10),
		});
		await email.enviarTransaccional({
			to: process.env.NOTIFICATION_EMAIL ?? "admin@theolab.tech",
			template: "notificacion-interna",
			data: { nombre: input.nombre.trim(), empresa: input.empresa.trim(), plan, precio, edicion },
		});
	} catch {
		return { ok: false, message: FALLBACK_MSG };
	}
	return { ok: true };
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm test tests/unit/checkout.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
pnpm check
git add lib/checkout.ts tests/unit/checkout.test.ts
git commit -m "feat(checkout): validacion y nucleo procesarCheckout"
```

---

### Task 6: Datos bancarios desde env (`lib/bank.ts`)

**Files:**
- Create: `lib/bank.ts`
- Test: `tests/unit/bank.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// tests/unit/bank.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { getBankDetails } from "@/lib/bank";

afterEach(() => vi.unstubAllEnvs());

describe("getBankDetails", () => {
	it("lee los datos de transferencia desde env", () => {
		vi.stubEnv("BANK_BANCO", "Bancolombia");
		vi.stubEnv("BANK_TITULAR", "TheoLab SAS");
		vi.stubEnv("BANK_TIPO_CUENTA", "Ahorros");
		vi.stubEnv("BANK_NUMERO_CUENTA", "000-000000-00");
		vi.stubEnv("BANK_NIT", "900.000.000-0");
		expect(getBankDetails()).toEqual({
			banco: "Bancolombia",
			titular: "TheoLab SAS",
			tipoCuenta: "Ahorros",
			numeroCuenta: "000-000000-00",
			nit: "900.000.000-0",
		});
	});

	it("lanza si falta una variable", () => {
		vi.stubEnv("BANK_BANCO", "Bancolombia");
		expect(() => getBankDetails()).toThrow(/datos bancarios/i);
	});
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm test tests/unit/bank.test.ts`
Expected: FAIL — `getBankDetails is not a function`.

- [ ] **Step 3: Implementar `lib/bank.ts`**

```ts
// lib/bank.ts
export interface BankDetails {
	banco: string;
	titular: string;
	tipoCuenta: string;
	numeroCuenta: string;
	nit: string;
}

/** Datos de transferencia, server-side (nunca NEXT_PUBLIC). */
export function getBankDetails(): BankDetails {
	const banco = process.env.BANK_BANCO;
	const titular = process.env.BANK_TITULAR;
	const tipoCuenta = process.env.BANK_TIPO_CUENTA;
	const numeroCuenta = process.env.BANK_NUMERO_CUENTA;
	const nit = process.env.BANK_NIT;
	if (!banco || !titular || !tipoCuenta || !numeroCuenta || !nit) {
		throw new Error("Faltan datos bancarios en variables de entorno");
	}
	return { banco, titular, tipoCuenta, numeroCuenta, nit };
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm test tests/unit/bank.test.ts`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
pnpm check
git add lib/bank.ts tests/unit/bank.test.ts
git commit -m "feat(checkout): datos bancarios server-side desde env"
```

---

### Task 7: Server Action `checkoutAction`

**Files:**
- Create: `app/checkout/actions.ts`

*(Cáscara delgada sobre `procesarCheckout`, ya testeado. La lógica testeable vive en `lib/checkout.ts`; esta capa solo parsea FormData, inyecta el `EmailService` real y redirige.)*

- [ ] **Step 1: Crear la Server Action**

```ts
// app/checkout/actions.ts
"use server";

import { redirect } from "next/navigation";
import { type CheckoutResult, procesarCheckout } from "@/lib/checkout";
import { getEmailService } from "@/lib/email";

export async function checkoutAction(
	_prev: CheckoutResult | null,
	formData: FormData,
): Promise<CheckoutResult> {
	const input = {
		nombre: String(formData.get("nombre") ?? ""),
		email: String(formData.get("email") ?? ""),
		empresa: String(formData.get("empresa") ?? ""),
		telefono: String(formData.get("telefono") ?? ""),
		plan: String(formData.get("plan") ?? ""),
		fuente: String(formData.get("fuente") ?? ""),
	};
	const result = await procesarCheckout(input, getEmailService());
	if (result.ok) redirect("/checkout/confirmacion");
	return result;
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Lint + commit**

```bash
pnpm check
git add app/checkout/actions.ts
git commit -m "feat(checkout): server action checkoutAction"
```

---

### Task 8: Formulario cliente `CheckoutForm`

**Files:**
- Create: `app/checkout/CheckoutForm.tsx`
- Test: `tests/unit/CheckoutForm.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// tests/unit/CheckoutForm.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckoutForm } from "@/app/checkout/CheckoutForm";

describe("CheckoutForm", () => {
	it("renderiza los campos B2B y el plan oculto", () => {
		const { container } = render(<CheckoutForm plan="inicial" fuente="web" />);
		expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
		expect(container.querySelector('input[name="plan"]')).toHaveValue("inicial");
		expect(container.querySelector('input[name="fuente"]')).toHaveValue("web");
	});

	it("tiene un botón de envío", () => {
		render(<CheckoutForm plan="completa" fuente="linkedin" />);
		expect(screen.getByRole("button", { name: /contratar|enviar|confirmar/i })).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm test tests/unit/CheckoutForm.test.tsx`
Expected: FAIL — no se puede importar `CheckoutForm`.

- [ ] **Step 3: Implementar `CheckoutForm.tsx`**

```tsx
// app/checkout/CheckoutForm.tsx
"use client";

import { useActionState } from "react";
import { checkoutAction } from "./actions";
import type { ConsultoriaPlanId } from "@/lib/oferta";

interface CheckoutFormProps {
	plan: ConsultoriaPlanId;
	fuente: string;
}

const FIELDS = [
	{ name: "nombre", label: "Nombre", type: "text", autoComplete: "name" },
	{ name: "email", label: "Correo", type: "email", autoComplete: "email" },
	{ name: "empresa", label: "Empresa", type: "text", autoComplete: "organization" },
	{ name: "telefono", label: "Teléfono", type: "tel", autoComplete: "tel" },
] as const;

export function CheckoutForm({ plan, fuente }: CheckoutFormProps) {
	const [state, formAction, pending] = useActionState(checkoutAction, null);
	const errors = state && !state.ok ? (state.errors ?? {}) : {};
	const message = state && !state.ok ? state.message : undefined;

	return (
		<form action={formAction} className="flex flex-col gap-6">
			<input type="hidden" name="plan" value={plan} />
			<input type="hidden" name="fuente" value={fuente} />

			{FIELDS.map((f) => (
				<label key={f.name} className="flex flex-col gap-2">
					<span className="text-meta uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
						{f.label}
					</span>
					<input
						name={f.name}
						type={f.type}
						autoComplete={f.autoComplete}
						required
						className="border border-[var(--color-divider)] bg-transparent px-4 py-3 text-body"
					/>
					{errors[f.name as keyof typeof errors] ? (
						<span role="alert" className="text-meta text-[var(--color-crimson)]">
							{errors[f.name as keyof typeof errors]}
						</span>
					) : null}
				</label>
			))}

			{message ? (
				<p role="alert" className="text-body text-[var(--color-crimson)]">
					{message}
				</p>
			) : null}

			<button
				type="submit"
				disabled={pending}
				className="bg-[var(--color-onyx)] text-[var(--color-alabaster)] px-6 py-4 text-meta uppercase tracking-[0.18em] disabled:opacity-60"
			>
				{pending ? "Enviando…" : "Contratar"}
			</button>
		</form>
	);
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm test tests/unit/CheckoutForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
pnpm check
git add app/checkout/CheckoutForm.tsx tests/unit/CheckoutForm.test.tsx
git commit -m "feat(checkout): formulario cliente con useActionState"
```

---

### Task 9: Layout + página `/checkout`

**Files:**
- Create: `app/checkout/layout.tsx`
- Create: `app/checkout/page.tsx`

*(El layout es mínimo y propio, fuera del route group `(institucional)`. La página resuelve el plan con helpers ya testeados (Task 1) y redirige si el plan es inválido — lógica delgada, sin test unitario propio; se cubre por los helpers + el e2e opcional de la Task 12.)*

- [ ] **Step 1: Crear el layout mínimo**

```tsx
// app/checkout/layout.tsx
import type { ReactNode } from "react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
			<header className="container-brand py-8">
				<a href="/" className="text-meta uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
					TheoLab
				</a>
			</header>
			{children}
		</div>
	);
}
```

- [ ] **Step 2: Crear la página**

```tsx
// app/checkout/page.tsx
import { redirect } from "next/navigation";
import { CheckoutForm } from "./CheckoutForm";
import { getConsultoriaPlan, getEffectivePrice, isConsultoriaPlanId } from "@/lib/oferta";

export default async function CheckoutPage({
	searchParams,
}: {
	searchParams: Promise<{ plan?: string; fuente?: string }>;
}) {
	const { plan: planParam, fuente } = await searchParams;
	if (!isConsultoriaPlanId(planParam)) redirect("/consultoria-legal");

	const plan = getConsultoriaPlan(planParam)!;
	const { precio, edicion, note } = getEffectivePrice(plan);

	return (
		<main id="main" className="container-brand py-16 md:py-24">
			<div className="flex flex-col gap-12 max-w-xl">
				<header className="flex flex-col gap-4">
					<p className="text-meta uppercase tracking-[0.22em] text-[var(--color-fg-muted)]">
						Contratar · Consultoría {plan.label}
					</p>
					<h1 className="text-headline">{plan.label}</h1>
					<p className="text-body text-[var(--color-fg-muted)]">{plan.detail}</p>
					<p className="text-title">
						{precio}{" "}
						{note ? (
							<span className="text-meta uppercase tracking-[0.18em] text-[var(--color-gold)]">
								{note}
							</span>
						) : null}
					</p>
				</header>
				<CheckoutForm plan={plan.id} fuente={fuente ?? "web"} />
				<p className="text-meta text-[var(--color-fg-muted)]">
					Edición: {edicion}. Al enviar, recibirás las instrucciones de transferencia por correo.
				</p>
			</div>
		</main>
	);
}
```

- [ ] **Step 3: Verificar build de tipos**

`isConsultoriaPlanId` ya existe en `lib/oferta.ts` desde la Task 1 — no se redefine.

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Lint + commit**

```bash
pnpm check
git add app/checkout/layout.tsx app/checkout/page.tsx
git commit -m "feat(checkout): layout y pagina /checkout con plan resuelto"
```

---

### Task 10: Página de confirmación `/checkout/confirmacion`

**Files:**
- Create: `app/checkout/confirmacion/page.tsx`

*(Server Component que renderiza los datos de `getBankDetails()` (Task 6, ya testeado). Render delgado, sin test unitario propio.)*

- [ ] **Step 1: Crear la página de confirmación**

```tsx
// app/checkout/confirmacion/page.tsx
import { getBankDetails } from "@/lib/bank";

export default function ConfirmacionPage() {
	const bank = getBankDetails();
	const filas: [string, string][] = [
		["Banco", bank.banco],
		["Titular", bank.titular],
		["Tipo de cuenta", bank.tipoCuenta],
		["Número de cuenta", bank.numeroCuenta],
		["NIT", bank.nit],
	];

	return (
		<main id="main" className="container-brand py-16 md:py-24">
			<div className="flex flex-col gap-8 max-w-xl">
				<h1 className="text-headline">Recibimos tu solicitud</h1>
				<p className="text-body text-[var(--color-fg-muted)]">
					Te enviamos las instrucciones por correo. Realiza la transferencia a los siguientes
					datos y responde el correo con el comprobante; confirmamos manualmente.
				</p>
				<dl className="flex flex-col divide-y divide-[var(--color-divider)] border-y border-[var(--color-divider)]">
					{filas.map(([k, v]) => (
						<div key={k} className="flex justify-between gap-6 py-4">
							<dt className="text-meta uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
								{k}
							</dt>
							<dd className="text-body">{v}</dd>
						</div>
					))}
				</dl>
				<a href="/" className="text-meta uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
					Volver al inicio →
				</a>
			</div>
		</main>
	);
}
```

- [ ] **Step 2: Verificar tipos**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Lint + commit**

```bash
pnpm check
git add app/checkout/confirmacion/page.tsx
git commit -m "feat(checkout): pagina de confirmacion con datos de transferencia"
```

---

### Task 11: Botón discreto "Contratar" en `OfferLadderV3`

**Files:**
- Modify: `components/consultoria/OfferLadderV3.tsx` (dentro de `TierBlock`)
- Test: `tests/unit/OfferLadderV3-contratar.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
// tests/unit/OfferLadderV3-contratar.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OfferLadderV3 } from "@/components/consultoria/OfferLadderV3";

describe("OfferLadderV3 — enlaces a checkout", () => {
	it("cada tier enlaza a /checkout con su plan", () => {
		render(<OfferLadderV3 />);
		const enlaces = screen.getAllByRole("link", { name: /contratar/i });
		const hrefs = enlaces.map((a) => a.getAttribute("href"));
		expect(hrefs).toContain("/checkout?plan=inicial&fuente=consultoria-legal");
		expect(hrefs).toContain("/checkout?plan=completa&fuente=consultoria-legal");
	});
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm test tests/unit/OfferLadderV3-contratar.test.tsx`
Expected: FAIL — no hay links "Contratar".

- [ ] **Step 3: Añadir el enlace dentro de `TierBlock`**

En `components/consultoria/OfferLadderV3.tsx`, importar el id del plan y `Link`. Al inicio del archivo, junto a los imports existentes:

```tsx
import Link from "next/link";
```

Dentro de `TierBlock`, justo después del bloque de precios (el `<div className="flex flex-wrap items-end ...">...</div>`), antes de cerrar el `<article>`, añadir:

```tsx
			<Link
				href={`/checkout?plan=${PLAN_ID_BY_LABEL[option.label]}&fuente=consultoria-legal`}
				className="mt-2 inline-flex w-fit items-center gap-2 text-meta uppercase tracking-[0.18em] text-[var(--color-alabaster)]/70 transition-colors hover:text-[var(--color-gold)]"
			>
				Contratar
				<span aria-hidden="true">→</span>
			</Link>
```

Y añadir el mapa de ids cerca del tope del archivo (después de `SECTION_COPY`):

```tsx
const PLAN_ID_BY_LABEL: Record<string, "inicial" | "completa"> = {
	Inicial: "inicial",
	Completa: "completa",
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm test tests/unit/OfferLadderV3-contratar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Lint + commit**

```bash
pnpm check
git add components/consultoria/OfferLadderV3.tsx tests/unit/OfferLadderV3-contratar.test.tsx
git commit -m "feat(checkout): boton discreto Contratar en OfferLadderV3"
```

---

### Task 12: Gate de coherencia + `.env.example` + verificación final

**Files:**
- Test: `tests/unit/checkout-coherencia.test.ts`
- Create: `.env.example` (modify si ya existe)

- [ ] **Step 1: Escribir el gate de coherencia precio embudo == checkout**

```ts
// tests/unit/checkout-coherencia.test.ts
import { describe, expect, it } from "vitest";
import { getConsultoriaPlans, getEffectivePrice } from "@/lib/oferta";
import { STEPS } from "@/lib/oferta";

describe("coherencia de precios embudo ↔ checkout", () => {
	it("el precio efectivo del checkout coincide con el de STEPS (sin divergencia)", () => {
		const stepOptions = STEPS[1].options ?? [];
		for (const plan of getConsultoriaPlans()) {
			const origen = stepOptions.find((o) => o.label === plan.label)!;
			const eff = getEffectivePrice(plan);
			const esperado = origen.founderPrice ?? origen.price;
			expect(eff.precio).toBe(esperado);
		}
	});
});
```

- [ ] **Step 2: Correr el gate y verificar que pasa**

Run: `pnpm test tests/unit/checkout-coherencia.test.ts`
Expected: PASS.

- [ ] **Step 3: Documentar las variables de entorno en `.env.example`**

Añadir (sin valores reales):

```bash
# Email / MailerLite (Fase 1)
EMAIL_PROVIDER=mailerlite
MAILERLITE_API_KEY=
MAILERLITE_GROUP_INICIAL=
MAILERLITE_GROUP_COMPLETA=
MAILERLITE_GROUP_FUNDADOR=
MAILERLITE_GROUP_NOTIFY=
NOTIFICATION_EMAIL=admin@theolab.tech

# Datos de transferencia (server-side, NO NEXT_PUBLIC)
BANK_BANCO=
BANK_TITULAR=
BANK_TIPO_CUENTA=
BANK_NUMERO_CUENTA=
BANK_NIT=
```

- [ ] **Step 4: Verificación final completa**

```bash
pnpm check
pnpm typecheck
pnpm test
```
Expected: Biome limpio, tipos OK, **todos** los tests verdes.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/checkout-coherencia.test.ts .env.example
git commit -m "test(checkout): gate de coherencia de precios + .env.example"
```

---

### Task 13 (opcional): E2E del flujo con Playwright

**Files:**
- Test: `tests/e2e/checkout.spec.ts`

*(Cubre la resolución de plan y el render que las tareas 9-10 dejaron sin test unitario. Opcional porque requiere envs de MailerLite mockeadas o un stub del provider; ejecutar solo si hay tiempo.)*

- [ ] **Step 1: Escribir el e2e de navegación (sin enviar a MailerLite real)**

```ts
// tests/e2e/checkout.spec.ts
import { expect, test } from "@playwright/test";

test("plan inválido redirige a /consultoria-legal", async ({ page }) => {
	await page.goto("/checkout?plan=zzz");
	await expect(page).toHaveURL(/\/consultoria-legal/);
});

test("plan válido muestra el formulario", async ({ page }) => {
	await page.goto("/checkout?plan=inicial");
	await expect(page.getByLabel(/empresa/i)).toBeVisible();
	await expect(page.getByRole("button", { name: /contratar/i })).toBeVisible();
});
```

- [ ] **Step 2: Correr el e2e**

Run: `pnpm test:e2e tests/e2e/checkout.spec.ts`
Expected: PASS (requiere `pnpm dev`/build según `playwright.config.ts`).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/checkout.spec.ts
git commit -m "test(checkout): e2e de resolucion de plan y render"
```
