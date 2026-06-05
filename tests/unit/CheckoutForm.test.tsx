import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckoutForm } from "@/app/checkout/CheckoutForm";

describe("CheckoutForm", () => {
	it("renderiza los campos B2B y el plan oculto", () => {
		const { container } = render(<CheckoutForm plan="inicial" fuente="web" />);
		expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
		expect(container.querySelector('input[name="plan"]')).toHaveValue("inicial");
		expect(container.querySelector('input[name="fuente"]')).toHaveValue("web");
	});

	it("tiene un botón de envío", () => {
		render(<CheckoutForm plan="completa" fuente="linkedin" />);
		expect(screen.getByRole("button", { name: /contratar|enviar|confirmar/i })).toBeInTheDocument();
	});
});
