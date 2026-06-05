import { afterEach, describe, expect, it, vi } from "vitest";
import { isCheckoutEnabled } from "@/lib/flags";

describe("isCheckoutEnabled", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("off por defecto (env ausente)", () => {
		vi.stubEnv("NEXT_PUBLIC_CHECKOUT_ENABLED", "");
		expect(isCheckoutEnabled()).toBe(false);
	});

	it("off con cualquier valor distinto de '1'", () => {
		vi.stubEnv("NEXT_PUBLIC_CHECKOUT_ENABLED", "true");
		expect(isCheckoutEnabled()).toBe(false);
	});

	it("on solo con '1'", () => {
		vi.stubEnv("NEXT_PUBLIC_CHECKOUT_ENABLED", "1");
		expect(isCheckoutEnabled()).toBe(true);
	});
});
