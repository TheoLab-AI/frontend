import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfferLadderV3 } from "@/components/consultoria/OfferLadderV3";

describe("OfferLadderV3 — enlaces a checkout", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("con el flag activo, cada tier enlaza a /checkout con su plan", () => {
		vi.stubEnv("NEXT_PUBLIC_CHECKOUT_ENABLED", "1");
		render(<OfferLadderV3 />);
		const enlaces = screen.getAllByRole("link", { name: /contratar/i });
		const hrefs = enlaces.map((a) => a.getAttribute("href"));
		expect(hrefs).toContain("/checkout?plan=inicial&fuente=consultoria-legal");
		expect(hrefs).toContain("/checkout?plan=completa&fuente=consultoria-legal");
	});

	it("con el flag inactivo (default), no expone el botón Contratar", () => {
		render(<OfferLadderV3 />);
		expect(screen.queryAllByRole("link", { name: /contratar/i })).toHaveLength(0);
	});
});
