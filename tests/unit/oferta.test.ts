import { describe, expect, it } from "vitest";
import { STEPS } from "@/lib/oferta";

describe("oferta", () => {
	it("expone los tres peldaños del embudo", () => {
		expect(STEPS.map((s) => s.name)).toEqual([
			"Reunión de introducción",
			"Consultoría",
			"Implementación",
		]);
	});
	it("Consultoría lleva los precios públicos regulares", () => {
		const consultoria = STEPS.find((s) => s.name === "Consultoría");
		const precios = consultoria?.options?.map((o) => o.price) ?? [];
		expect(precios).toContain("$500.000");
		expect(precios).toContain("$1.500.000");
	});
	it("NO incluye el precio fundador en ningún lado", () => {
		expect(JSON.stringify(STEPS)).not.toContain("$200.000");
	});
});
