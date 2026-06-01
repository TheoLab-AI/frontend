import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConsultoriaHero } from "@/components/consultoria/ConsultoriaHero";

describe("ConsultoriaHero", () => {
	it("muestra la promesa canónica 18–27", () => {
		render(<ConsultoriaHero />);
		expect(screen.getByText(/18/)).toBeInTheDocument();
		expect(screen.getByText(/27/)).toBeInTheDocument();
	});
	it("no nombra el harness ni modelos", () => {
		const { container } = render(<ConsultoriaHero />);
		expect(container.textContent?.toLowerCase()).not.toContain("harness");
	});
});
