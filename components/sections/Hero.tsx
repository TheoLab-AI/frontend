"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { fadeUp, heroDisplayReveal, stagger } from "@/components/motion/variants";
import { Button } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/icons/GithubIcon";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand } from "@/lib/tokens";

export function Hero() {
	return (
		<section
			id="hero"
			aria-labelledby="hero-headline"
			className="relative isolate overflow-hidden border-b border-[var(--color-divider)]"
		>
			<HeroBackground />

			<div className="container-brand relative pt-28 pb-24 md:pt-40 md:pb-32">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={stagger(0.12)}
					className="flex flex-col gap-10"
				>
					{/* Editorial top-line */}
					<motion.div
						variants={fadeUp}
						className="flex flex-wrap items-center gap-x-4 gap-y-2 text-meta text-[var(--color-fg-muted)]"
					>
						<span className="text-mono text-[0.7rem]">PL · 01 / 04</span>
						<span aria-hidden="true">·</span>
						<span>Inteligencia artificial aplicada</span>
						<span aria-hidden="true">·</span>
						<span>Colombia · 2026</span>
					</motion.div>

					{/* Wordmark */}
					<motion.div variants={heroDisplayReveal}>
						<Wordmark as="h1" size="xl" className="leading-[0.92]" />
					</motion.div>

					{/* Tagline */}
					<motion.div variants={fadeUp} id="hero-headline" className="max-w-4xl">
						<p className="text-headline text-[var(--color-fg)] [text-wrap:balance]">
							Tú sabes el <em className="italic text-[var(--color-fg-muted)]">qué</em>
							{" — "}
							nosotros traemos el <span className="text-brand-gradient font-semibold">cómo</span>.
						</p>
					</motion.div>

					{/* Subtitle */}
					<motion.p
						variants={fadeUp}
						className="text-body-lg max-w-2xl text-[var(--color-fg-muted)] [text-wrap:pretty]"
					>
						{brand.subtitle}
					</motion.p>

					{/* CTAs */}
					<motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
						<Button size="lg" variant="solid" asChild>
							<Link href="#services">
								Conocer servicios
								<ArrowRight aria-hidden="true" />
							</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<a href={brand.github} target="_blank" rel="noreferrer noopener">
								<GithubIcon className="h-4 w-4" aria-hidden="true" />
								GitHub
							</a>
						</Button>
					</motion.div>
				</motion.div>
			</div>

			{/* Footer meta — editorial pagination */}
			<div className="container-brand relative flex items-end justify-between pb-8 text-meta text-[var(--color-fg-muted)]">
				<span className="text-mono text-[0.7rem]">— HERO · 01.0</span>
				<span className="text-mono text-[0.7rem]">2026 · CONFIDENTIAL</span>
			</div>
		</section>
	);
}

/**
 * Hero background — Golden Hour gradient bar at the bottom of the section,
 * referencing the brand wordmark "Lab" painted gradient.
 * No grain on UI (brand v0.3 rule).
 */
function HeroBackground() {
	return (
		<div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
			{/* Subtle radial highlight */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(120% 80% at 80% 0%, oklch(0.96 0.02 80 / 0.55) 0%, transparent 60%)",
				}}
			/>
			{/* Bottom flame ribbon — brand crimson → gold */}
			<div
				className="absolute bottom-0 left-0 h-[2px] w-full"
				style={{
					background:
						"linear-gradient(90deg, transparent 0%, var(--color-burgundy) 12%, var(--color-crimson) 50%, var(--color-gold) 88%, transparent 100%)",
				}}
			/>
		</div>
	);
}
