import { describe, expect, it } from "vitest";
import { getConsultoriaPlans, getEffectivePrice, STEPS } from "@/lib/oferta";

describe("coherencia de precios embudo ↔ checkout", () => {
	it("el precio efectivo del checkout coincide con el de STEPS (sin divergencia)", () => {
		const stepOptions = STEPS[1]?.options ?? [];
		for (const plan of getConsultoriaPlans()) {
			// biome-ignore lint/style/noNonNullAssertion: el label proviene de getConsultoriaPlans, siempre existe en STEPS
			const origen = stepOptions.find((o) => o.label === plan.label)!;
			const eff = getEffectivePrice(plan);
			const esperado = origen.founderPrice ?? origen.price;
			expect(eff.precio).toBe(esperado);
		}
	});
});
