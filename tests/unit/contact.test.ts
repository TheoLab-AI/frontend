import { describe, expect, it } from "vitest";
import { contact, mailtoUrl, whatsappUrl } from "@/lib/contact";

describe("contact", () => {
	it("expone el WhatsApp de Juan José sin separadores", () => {
		expect(contact.whatsapp.number).toBe("573182395252");
	});

	it("usa el correo operativo real", () => {
		expect(contact.email).toBe("admin@theolab.tech");
	});

	it("whatsappUrl arma el enlace wa.me y codifica el texto", () => {
		expect(whatsappUrl()).toBe("https://wa.me/573182395252");
		expect(whatsappUrl("Hola TheoLab")).toBe("https://wa.me/573182395252?text=Hola%20TheoLab");
	});

	it("mailtoUrl arma el mailto y codifica el asunto", () => {
		expect(mailtoUrl()).toBe("mailto:admin@theolab.tech");
		expect(mailtoUrl("Reunión")).toBe("mailto:admin@theolab.tech?subject=Reuni%C3%B3n");
	});
});
