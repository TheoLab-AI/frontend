import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { OfferLadder } from "@/components/consultoria/OfferLadder";

// jsdom no implementa IntersectionObserver; Motion lo necesita para `whileInView`.
// Polyfill local (vitest aísla por archivo, no contamina otros tests).
beforeAll(() => {
	if (!("IntersectionObserver" in globalThis)) {
		class MockIntersectionObserver implements IntersectionObserver {
			readonly root = null;
			readonly rootMargin = "";
			readonly thresholds: ReadonlyArray<number> = [];
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
			takeRecords = vi.fn(() => []);
		}
		vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
	}
});

describe("OfferLadder", () => {
	it("muestra los precios públicos de la Consultoría", () => {
		const { container } = render(<OfferLadder />);
		expect(container.textContent).toContain("$500.000");
		expect(container.textContent).toContain("$1.500.000");
	});
	// Edición fundadora PÚBLICA (decisión de empresa 2026-06-03): el home muestra
	// el split regular/fundador anclado. Retiro = quitar founderPrice en lib/oferta.
	it("expone el split de la edición fundadora (regular tachado + fundador)", () => {
		const { container } = render(<OfferLadder />);
		expect(container.textContent).toContain("$200.000");
		expect(container.textContent).toContain("$1.200.000");
		expect(container.textContent).toContain("Fundador · 10 cupos");
	});
	it("presenta los tres peldaños", () => {
		const { container } = render(<OfferLadder />);
		expect(container.textContent).toContain("Reunión de introducción");
		expect(container.textContent).toContain("Consultoría");
		expect(container.textContent).toContain("Implementación");
	});
});
