import { expect, test } from "@playwright/test";

// `$200.000` ya no está prohibido en /consultoria-legal — el rediseño v3 expone el
// split regular/fundador del embudo (PR4) y la edición fundadora es pública
// hasta que se llenen los 10 cupos.
const FORBIDDEN_IN_CONSULTORIA = ["harness", "theolab.ai", "PL ·", "15–30", "15-30"];

test.describe("Coherencia del front", () => {
	test("/consultoria-legal no filtra lenguaje técnico ni datos muertos", async ({ page }) => {
		await page.goto("/consultoria-legal");
		const body = (await page.locator("body").textContent())?.toLowerCase() ?? "";
		for (const term of FORBIDDEN_IN_CONSULTORIA) {
			expect(body, `término prohibido en /consultoria-legal: ${term}`).not.toContain(
				term.toLowerCase(),
			);
		}
	});

	test("/consultoria-legal no muestra la navegación institucional", async ({ page }) => {
		await page.goto("/consultoria-legal");
		await expect(page.getByRole("link", { name: "Servicios" })).toHaveCount(0);
		await expect(page.getByRole("link", { name: "Filosofía" })).toHaveCount(0);
	});

	test("la home no muestra datos muertos (caso no verificable ni sha del objeto-tag)", async ({
		page,
	}) => {
		await page.goto("/");
		const body = (await page.locator("body").textContent()) ?? "";
		expect(body).not.toContain("Gases de Occidente");
		expect(body).not.toContain("5681603"); // sha del objeto-tag; el commit de v0.1.0 es 7044c4f (H1)
	});

	test("la home expone el precio fundador (edición fundadora pública)", async ({ page }) => {
		await page.goto("/");
		const body = (await page.locator("body").textContent()) ?? "";
		expect(body).toContain("$200.000");
	});

	test("/consultoria-legal expone el CTA de WhatsApp correcto", async ({ page }) => {
		await page.goto("/consultoria-legal");
		const wa = page.getByRole("link", { name: /whatsapp/i }).first();
		await expect(wa).toHaveAttribute("href", /wa\.me\/573182395252/);
	});
});
