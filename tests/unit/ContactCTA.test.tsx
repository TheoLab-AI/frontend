import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactCTA } from "@/components/ui/ContactCTA";

describe("ContactCTA", () => {
	it("enlaza al WhatsApp de Juan José", () => {
		render(<ContactCTA />);
		const wa = screen.getByRole("link", { name: /whatsapp/i });
		expect(wa).toHaveAttribute("href", "https://wa.me/573182395252");
	});

	it("enlaza al correo operativo", () => {
		render(<ContactCTA />);
		const mail = screen.getByRole("link", { name: /correo|email/i });
		expect(mail).toHaveAttribute("href", "mailto:admin@theolab.tech");
	});

	it("codifica el texto del WhatsApp cuando se pasa", () => {
		render(<ContactCTA whatsappText="Quiero la reunión de introducción" />);
		const wa = screen.getByRole("link", { name: /whatsapp/i });
		expect(wa.getAttribute("href")).toContain("?text=");
	});
});
