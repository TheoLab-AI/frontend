import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PropiedadCliente } from "@/components/institucional/PropiedadCliente";

describe("PropiedadCliente", () => {
	it("afirma la propiedad del cliente (D-4)", () => {
		render(<PropiedadCliente />);
		expect(screen.getByText(/dueño/i)).toBeInTheDocument();
		// El contenido exacto del plan nombra "Diagnóstico" dos veces (bajada + capa 1),
		// por lo que se relaja getByText -> getAllByText sin tocar el copy del producto.
		expect(screen.getAllByText(/Diagnóstico/i).length).toBeGreaterThan(0);
	});
	it("explica el modelo en capas (motor licenciado)", () => {
		const { container } = render(<PropiedadCliente />);
		expect(container.textContent?.toLowerCase()).toContain("licencia");
	});
});
