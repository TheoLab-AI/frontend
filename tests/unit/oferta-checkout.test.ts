import { describe, expect, it } from "vitest";
import {
	getConsultoriaPlan,
	getConsultoriaPlans,
	getEffectivePrice,
	isConsultoriaPlanId,
} from "@/lib/oferta";

describe("getConsultoriaPlans", () => {
	it("deriva los dos tiers desde STEPS con sus ids", () => {
		const plans = getConsultoriaPlans();
		expect(plans.map((p) => p.id)).toEqual(["inicial", "completa"]);
		expect(plans[0]?.precioRegular).toBe("$500.000");
		expect(plans[0]?.precioFundador).toBe("$200.000");
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
		// biome-ignore lint/style/noNonNullAssertion: plan existe por fixture, falla el test si no
		const plan = getConsultoriaPlan("inicial")!;
		const eff = getEffectivePrice(plan);
		// Con FOUNDER_SPOTS_LEFT=3 en el código actual:
		expect(eff).toEqual({ precio: "$200.000", edicion: "fundador", note: "Fundador · 10 cupos" });
	});
	it("usa precio regular cuando el plan no tiene precio fundador", () => {
		// biome-ignore lint/style/noNonNullAssertion: plan existe por fixture, falla el test si no
		const base = getConsultoriaPlan("inicial")!;
		const plan = { ...base, precioFundador: undefined, founderNote: undefined };
		expect(getEffectivePrice(plan)).toEqual({ precio: "$500.000", edicion: "regular" });
	});
});

describe("isConsultoriaPlanId", () => {
	it("acepta inicial y completa", () => {
		expect(isConsultoriaPlanId("inicial")).toBe(true);
		expect(isConsultoriaPlanId("completa")).toBe(true);
	});
	it("rechaza valores desconocidos y undefined", () => {
		expect(isConsultoriaPlanId("gratis")).toBe(false);
		expect(isConsultoriaPlanId(undefined)).toBe(false);
	});
});
