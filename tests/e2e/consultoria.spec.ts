import { expect, test } from "@playwright/test";

test.describe("Landing /consultoria — smoke", () => {
	test("carga con header, hero, secciones v3 y footer", async ({ page }) => {
		await page.goto("/consultoria");
		// Header con navegación + CTA del header (no Header viejo de Alexis)
		await expect(page.getByRole("link", { name: /agendar reunión/i })).toBeVisible();
		// Hero: la copy editorial "Usted sabe el qué. Nosotros, el cómo."
		// queda visible (Hero Splite carga el Spline en lg+ pero la copy es
		// estática en todos los breakpoints).
		await expect(page.getByText(/Usted sabe el qué/i)).toBeVisible();
		// Footer wordmark
		await expect(page.locator("footer")).toBeVisible();
	});

	test("presenta las secciones del rediseño v3", async ({ page }) => {
		await page.goto("/consultoria");
		await expect(page.locator("#espejo")).toBeVisible();
		// F03 / F04 son placeholders hasta PR4 / PR5
		await expect(page.locator("#como")).toBeVisible();
		await expect(page.locator("#diagnostico")).toBeVisible();
		await expect(page.locator("#diferenciadores")).toBeVisible();
		await expect(page.locator("#para-quien")).toBeVisible();
		await expect(page.locator("#cta")).toBeVisible();
		await expect(page.locator("#faq")).toBeVisible();
	});

	test("CTA Final apunta al WhatsApp correcto", async ({ page }) => {
		await page.goto("/consultoria");
		const wa = page
			.locator("#cta")
			.getByRole("link", { name: /whatsapp/i })
			.first();
		await expect(wa).toHaveAttribute("href", /wa\.me\/573182395252/);
	});

	test("FAQ acordeón abre/cierra preguntas", async ({ page }) => {
		await page.goto("/consultoria");
		// Q1 abierto por default (mostrar la respuesta).
		const q1Btn = page.getByRole("button", {
			name: /¿Cuánto tarda ver resultados\?/i,
		});
		await expect(q1Btn).toHaveAttribute("aria-expanded", "true");
		// Click cerrar Q1
		await q1Btn.click();
		await expect(q1Btn).toHaveAttribute("aria-expanded", "false");
	});
});
