import { describe, expect, it } from "vitest";
import { STEPS } from "@/lib/oferta";
import {
	consultoriaServiceJsonLd,
	ofertaJsonLd,
	organizationJsonLd,
	servicesJsonLd,
} from "@/lib/seo";
import { brand } from "@/lib/tokens";

describe("seo — organizationJsonLd", () => {
	it("emite @type Organization y @context schema.org", () => {
		const ld = organizationJsonLd();
		expect(ld["@type"]).toBe("Organization");
		expect(ld["@context"]).toBe("https://schema.org");
	});

	it("usa el nombre y dominio del brand token", () => {
		const ld = organizationJsonLd();
		expect(ld.name).toBe(brand.name);
		expect(ld.url).toBe(`https://${brand.domain}`);
	});

	it("el logo apunta al dominio correcto", () => {
		const ld = organizationJsonLd();
		expect(ld.logo).toContain(brand.domain);
		expect(ld.logo).toMatch(/^https:\/\//);
	});

	it("areaServed es CO (Colombia)", () => {
		const ld = organizationJsonLd();
		expect(ld.areaServed).toBe("CO");
	});

	it("incluye el repo GitHub como sameAs", () => {
		const ld = organizationJsonLd();
		expect(ld.sameAs).toContain(brand.github);
	});
});

describe("seo — servicesJsonLd", () => {
	it("devuelve exactamente cuatro servicios", () => {
		expect(servicesJsonLd()).toHaveLength(4);
	});

	it("cada servicio es @type Service con provider TheoLab y areaServed Colombia", () => {
		for (const s of servicesJsonLd()) {
			expect(s["@type"]).toBe("Service");
			expect(s.provider.name).toBe(brand.name);
			expect(s.areaServed["@type"]).toBe("Country");
			expect(s.areaServed.name).toBe("Colombia");
		}
	});

	it("cubre las cuatro líneas de trabajo del brand", () => {
		const names = servicesJsonLd().map((s) => s.name);
		expect(names).toContain("Infraestructura IA");
		expect(names).toContain("Adopción IA empresarial");
		expect(names).toContain("Automatización y agentes");
		expect(names).toContain("Tecnología jurídica");
	});
});

describe("seo — ofertaJsonLd", () => {
	it("emite @type Service con @context schema.org", () => {
		const ld = ofertaJsonLd();
		expect(ld["@type"]).toBe("Service");
		expect(ld["@context"]).toBe("https://schema.org");
	});

	it("serviceType refleja la audiencia institucional", () => {
		expect(ofertaJsonLd().serviceType).toBe("Adopción de IA empresarial");
	});

	it("los precios de Consultoría derivan de STEPS", () => {
		const consultoria = STEPS.find((s) => s.name === "Consultoría");
		const expected = (consultoria?.options ?? []).map((o) => o.price.replace(/[^0-9]/g, ""));
		expect(ofertaJsonLd().offers.map((o) => o.price)).toEqual(expected);
	});

	it("expone los precios públicos en COP", () => {
		const { offers } = ofertaJsonLd();
		const precios = offers.map((o) => o.price);
		expect(precios).toContain("500000");
		expect(precios).toContain("1500000");
		for (const o of offers) {
			expect(o.priceCurrency).toBe("COP");
		}
	});

	it("no expone el precio fundador interno", () => {
		expect(JSON.stringify(ofertaJsonLd())).not.toContain("200000");
	});
});

describe("seo — consultoriaServiceJsonLd", () => {
	it("emite @type Service con @context schema.org", () => {
		const ld = consultoriaServiceJsonLd();
		expect(ld["@type"]).toBe("Service");
		expect(ld["@context"]).toBe("https://schema.org");
	});

	it("serviceType identifica la audiencia de firmas legales", () => {
		expect(consultoriaServiceJsonLd().serviceType).toBe(
			"Consultoría de adopción de IA para firmas legales",
		);
	});

	it("emite exactamente dos offers (Inicial + Completa)", () => {
		expect(consultoriaServiceJsonLd().offers).toHaveLength(2);
	});

	it("los precios derivan de STEPS, no están hardcodeados", () => {
		const consultoria = STEPS.find((s) => s.name === "Consultoría");
		const expected = (consultoria?.options ?? []).map((o) => o.price.replace(/[^0-9]/g, ""));
		expect(consultoriaServiceJsonLd().offers.map((o) => o.price)).toEqual(expected);
	});

	// Gate de no-divergencia: si STEPS cambia, este test falla antes de que el SEO sirva datos viejos.
	it("los precios no divergen de ofertaJsonLd (gate de consistencia)", () => {
		const consultoriaPrecios = consultoriaServiceJsonLd().offers.map((o) => o.price);
		const ofertaPrecios = ofertaJsonLd().offers.map((o) => o.price);
		expect(consultoriaPrecios).toEqual(ofertaPrecios);
	});

	it("expone los precios públicos correctos en COP", () => {
		const { offers } = consultoriaServiceJsonLd();
		const precios = offers.map((o) => o.price);
		expect(precios).toContain("500000");
		expect(precios).toContain("1500000");
		for (const o of offers) {
			expect(o.priceCurrency).toBe("COP");
		}
	});

	it("no expone el precio fundador interno", () => {
		expect(JSON.stringify(consultoriaServiceJsonLd())).not.toContain("200000");
	});

	it("los nombres de offer derivan de los labels de STEPS", () => {
		const consultoria = STEPS.find((s) => s.name === "Consultoría");
		const expected = (consultoria?.options ?? []).map(
			(o) => `Consultoría ${o.label.toLowerCase()}`,
		);
		expect(consultoriaServiceJsonLd().offers.map((o) => o.name)).toEqual(expected);
	});

	it("el provider es TheoLab con área Colombia", () => {
		const ld = consultoriaServiceJsonLd();
		expect(ld.provider.name).toBe(brand.name);
		expect(ld.areaServed.name).toBe("Colombia");
	});
});
