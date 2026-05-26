import path from "node:path";
import { test } from "@playwright/test";

const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");

test.describe("v0.0.1 screenshots", () => {
	test("desktop home — full page", async ({ page }) => {
		test.skip(test.info().project.name !== "chromium-desktop", "desktop only");
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.waitForTimeout(800);
		// Scroll through page to trigger whileInView animations
		await page.evaluate(async () => {
			const sections = ["#services", "#evidence", "#philosophy"];
			for (const s of sections) {
				document.querySelector(s)?.scrollIntoView({ behavior: "instant" });
				await new Promise((r) => setTimeout(r, 400));
			}
			window.scrollTo({ top: 0, behavior: "instant" });
		});
		await page.waitForTimeout(800);
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, "v0.0.1-desktop-fullpage.png"),
			fullPage: true,
		});
	});

	test("desktop hero — above the fold", async ({ page }) => {
		test.skip(test.info().project.name !== "chromium-desktop", "desktop only");
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.waitForTimeout(1500);
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, "v0.0.1-desktop-hero.png"),
			fullPage: false,
		});
	});

	test("mobile home — full page", async ({ page }) => {
		test.skip(test.info().project.name !== "chromium-mobile", "mobile only");
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await page.waitForTimeout(800);
		await page.evaluate(async () => {
			const sections = ["#services", "#evidence", "#philosophy"];
			for (const s of sections) {
				document.querySelector(s)?.scrollIntoView({ behavior: "instant" });
				await new Promise((r) => setTimeout(r, 400));
			}
			window.scrollTo({ top: 0, behavior: "instant" });
		});
		await page.waitForTimeout(800);
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, "v0.0.1-mobile-fullpage.png"),
			fullPage: true,
		});
	});
});
