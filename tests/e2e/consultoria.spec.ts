import { expect, test } from "@playwright/test";

test.describe("Landing /consultoria — smoke", () => {
	test("carga con hero + promesa + CTA", async ({ page }) => {
		await page.goto("/consultoria");
		await expect(page.locator("#consultoria-hero")).toBeVisible();
		await expect(page.getByText(/18 y 27|18–27/)).toBeVisible();
		await expect(
			page.getByRole("link", { name: /reunión de introducción|whatsapp/i }).first(),
		).toBeVisible();
	});

	test("presenta las secciones del embudo", async ({ page }) => {
		await page.goto("/consultoria");
		await expect(page.locator("#problema")).toBeVisible();
		await expect(page.locator("#valor")).toBeVisible();
		await expect(page.locator("#oferta")).toBeVisible();
		await expect(page.locator("#propiedad")).toBeVisible();
	});

	test("sin errores de consola", async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
		await page.goto("/consultoria");
		await page.waitForLoadState("networkidle");
		expect(errors, errors.join("\n")).toHaveLength(0);
	});
});
