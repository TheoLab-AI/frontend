/**
 * Brand tokens — TheoLab Brand System v0.3
 * Source of truth: public/brand/Brand System v0.3 - TheoLab.pdf
 *
 * Two sub-palettes in tension:
 * - Obsidian Chrome (structure): Onyx, Slate, Alabaster
 * - Golden Hour (expression): Burgundy, Crimson, Gold
 *
 * Typography: Inter Variable — hierarchy lives in weight + scale, not family.
 */

export const colors = {
	obsidianChrome: {
		onyx: "#0A0A0A",
		slate: "#536878",
		alabaster: "#E5E4E2",
	},
	goldenHour: {
		burgundy: "#800020",
		crimson: "#FF4500",
		gold: "#FFD700",
	},
} as const;

export const typography = {
	display: { weight: 700, tracking: "-0.03em", family: "var(--font-inter-tight)" },
	headline: { weight: 600, tracking: "-0.02em", family: "var(--font-inter)" },
	body: { weight: 400, tracking: "0em", family: "var(--font-inter)" },
	ui: { weight: 500, tracking: "0.01em", family: "var(--font-inter)" },
} as const;

export const motion = {
	easeBrand: [0.16, 1, 0.3, 1] as const, // expo-out — sober, decisive
	easeEntry: [0.32, 0.72, 0, 1] as const,
	duration: {
		fast: 0.2,
		base: 0.4,
		slow: 0.8,
		hero: 1.2,
	},
} as const;

export const brand = {
	name: "TheoLab",
	tagline: "Tú sabes el qué — nosotros traemos el cómo.",
	subtitle: "Infraestructura, modelos y adopción de IA para empresas que ya saben dónde van.",
	domain: "theolab.tech",
	github: "https://github.com/TheoLab-AI",
	locale: "es-CO",
} as const;
