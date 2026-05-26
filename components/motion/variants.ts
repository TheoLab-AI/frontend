import type { Transition, Variants } from "motion/react";

const easeBrand: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.8, ease: easeBrand },
	},
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.6, ease: easeBrand },
	},
};

export const slideInLeft: Variants = {
	hidden: { opacity: 0, x: -32 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: easeBrand },
	},
};

export const stagger = (delay = 0.08): Variants => ({
	hidden: {},
	visible: {
		transition: { staggerChildren: delay, delayChildren: 0.1 },
	},
});

export const heroDisplayReveal: Variants = {
	hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 1.1, ease: easeBrand },
	},
};
