import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
	cleanup();
});

// jsdom no implementa IntersectionObserver; Motion lo necesita para `whileInView`.
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
