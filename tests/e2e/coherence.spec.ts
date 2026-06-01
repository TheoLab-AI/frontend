import { expect, test } from "@playwright/test";

const FORBIDDEN_IN_CONSULTORIA = ["harness", "theolab.ai", "PL ·", "15–30", "15-30", "$200.000"];

test.describe("Coherencia del front", () => {
	test("/consultoria no filtra lenguaje técnico ni datos muertos", async ({ page }) => {
		await page.goto("/consultoria");
		const body = (await page.locator("body").textContent())?.toLowerCase() ?? "";
		for (const term of FORBIDDEN_IN_CONSULTORIA) {
			expect(body, `término prohibido en /consultoria: ${term}`).not.toContain(term.toLowerCase());
		}
	});

	test("/consultoria no muestra la navegación institucional", async ({ page }) => {
		await page.goto("/consultoria");
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

	test("/consultoria expone el CTA de WhatsApp correcto", async ({ page }) => {
		await page.goto("/consultoria");
		const wa = page.getByRole("link", { name: /whatsapp/i }).first();
		await expect(wa).toHaveAttribute("href", /wa\.me\/573182395252/);
	});
});
