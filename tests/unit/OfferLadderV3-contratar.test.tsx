import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OfferLadderV3 } from "@/components/consultoria/OfferLadderV3";

describe("OfferLadderV3 — enlaces a checkout", () => {
	it("cada tier enlaza a /checkout con su plan", () => {
		render(<OfferLadderV3 />);
		const enlaces = screen.getAllByRole("link", { name: /contratar/i });
		const hrefs = enlaces.map((a) => a.getAttribute("href"));
		expect(hrefs).toContain("/checkout?plan=inicial&fuente=consultoria-legal");
		expect(hrefs).toContain("/checkout?plan=completa&fuente=consultoria-legal");
	});
});
