import { expect, test } from "@playwright/test";

test.describe("TheoLab home — smoke", () => {
	test("renders hero with wordmark + tagline", async ({ page }) => {
		await page.goto("/");

		// Wordmark accessible
		await expect(page.getByLabel("TheoLab").first()).toBeVisible();

		// Tagline includes the key phrase
		await expect(page.getByText("Tú sabes el")).toBeVisible();
		await expect(page.getByText("nosotros traemos el", { exact: false })).toBeVisible();

		// CTA primary
		await expect(page.getByRole("link", { name: /Conocer servicios/i })).toBeVisible();
	});

	test("renders all 5 sections", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("#hero")).toBeVisible();
		await expect(page.locator("#services")).toBeVisible();
		await expect(page.locator("#evidence")).toBeVisible();
		await expect(page.locator("#philosophy")).toBeVisible();
		await expect(page.getByRole("contentinfo")).toBeVisible();
	});

	test("exposes JSON-LD organization schema", async ({ page }) => {
		await page.goto("/");
		const orgScript = page.locator('script[type="application/ld+json"]').first();
		const content = await orgScript.textContent();
		expect(content).toContain("TheoLab");
		expect(content).toContain("Organization");
	});

	test("ofrece puente a la landing legal", async ({ page }) => {
		await page.goto("/");
		const bridge = page.getByRole("link", { name: /firma legal/i });
		await expect(bridge.first()).toBeVisible();
		await expect(bridge.first()).toHaveAttribute("href", "/consultoria");
	});

	test("muestra los planes con precios públicos", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("#oferta")).toBeVisible();
		const body = (await page.locator("body").textContent()) ?? "";
		expect(body).toContain("$500.000");
		expect(body).toContain("$1.500.000");
	});

	test("ofrece el CTA directo y la propiedad del cliente", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("#propiedad-cliente")).toBeVisible();
		await expect(page.locator("#home-cta")).toBeVisible();
		const wa = page.getByRole("link", { name: /whatsapp/i }).first();
		await expect(wa).toHaveAttribute("href", /wa\.me\/573182395252/);
	});

	test("no console errors on load", async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") errors.push(msg.text());
		});
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		expect(errors, errors.join("\n")).toHaveLength(0);
	});
});
