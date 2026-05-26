import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./tests/unit/setup.ts"],
		include: ["tests/unit/**/*.test.{ts,tsx}"],
		exclude: ["node_modules", ".next", "tests/e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			exclude: ["node_modules/", "tests/", ".next/", "**/*.config.*"],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
});
