import { describe, expect, it } from "vitest";
import { FOUNDER_SPOTS_TOTAL, STEPS } from "@/lib/oferta";
import { ofertaJsonLd } from "@/lib/seo";

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
	it("Consultoría lleva los precios fundador en ambas opciones", () => {
		const consultoria = STEPS.find((s) => s.name === "Consultoría");
		const fundadores = consultoria?.options?.map((o) => o.founderPrice) ?? [];
		expect(fundadores).toContain("$200.000");
		expect(fundadores).toContain("$1.200.000");
	});
	it("FOUNDER_SPOTS_TOTAL son 10 cupos", () => {
		expect(FOUNDER_SPOTS_TOTAL).toBe(10);
	});
	it("ofertaJsonLd emite los Offer regular + fundador en COP desde la fuente única", () => {
		const ld = ofertaJsonLd();
		const precios = ld.offers.map((o) => o.price);
		expect(precios).toContain("500000");
		expect(precios).toContain("1500000");
		expect(precios).toContain("200000");
		expect(precios).toContain("1200000");
	});
});
