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
	it("NO expone el precio fundador (interno)", () => {
		const { container } = render(<OfferLadder />);
		expect(container.textContent).not.toContain("$200.000");
	});
	it("presenta los tres peldaños", () => {
		const { container } = render(<OfferLadder />);
		expect(container.textContent).toContain("Reunión de introducción");
		expect(container.textContent).toContain("Consultoría");
		expect(container.textContent).toContain("Implementación");
	});
});
