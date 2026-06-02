import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeCTA } from "@/components/institucional/HomeCTA";

describe("HomeCTA", () => {
	it("ofrece el CTA directo de WhatsApp", () => {
		render(<HomeCTA />);
		const wa = screen.getByRole("link", { name: /whatsapp/i });
		// El href lleva el prefill `?text=`; verificamos el destino con prefijo
		// (coherente con el e2e de Task 8: /wa\.me\/573182395252/).
		expect(wa.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/573182395252/);
	});
	it("ofrece el puente a /consultoria", () => {
		render(<HomeCTA />);
		const bridge = screen.getByRole("link", { name: /firma legal/i });
		expect(bridge).toHaveAttribute("href", "/consultoria");
	});
});
