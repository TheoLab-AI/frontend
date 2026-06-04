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
	nombre: "Ana",
	email: "ana@firma.co",
	empresa: "Firma SAS",
	telefono: "3000000000",
	plan: "inicial",
	fuente: "linkedin",
};

describe("validateCheckout", () => {
	it("sin errores con datos válidos", () => {
		expect(validateCheckout({ ...validInput, plan: "inicial" })).toEqual({});
	});
	it("marca email inválido y campos vacíos", () => {
		const e = validateCheckout({
			nombre: "",
			email: "x",
			empresa: "",
			telefono: "",
			plan: "inicial",
		});
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
		// biome-ignore lint/style/noNonNullAssertion: test index access
		const arg = (email.registrarLead as ReturnType<typeof vi.fn>).mock.calls[0]![0];
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

	it("si enviarTransaccional falla tras registrarLead exitoso, no silencia: ok:false y el lead sí se registró", async () => {
		const email = fakeEmail({
			enviarTransaccional: vi.fn(async () => {
				throw new Error("smtp down");
			}),
		});
		const res = await procesarCheckout(validInput, email);
		expect(res.ok).toBe(false);
		expect(res).toMatchObject({ message: expect.stringContaining("WhatsApp") });
		expect(email.registrarLead).toHaveBeenCalledTimes(1);
	});

	it("usa fuente 'web' por defecto si no viene", async () => {
		const email = fakeEmail();
		await procesarCheckout({ ...validInput, fuente: "" }, email);
		// biome-ignore lint/style/noNonNullAssertion: test index access
		const arg = (email.registrarLead as ReturnType<typeof vi.fn>).mock.calls[0]![0];
		expect(arg.fuenteLead).toBe("web");
	});
});
