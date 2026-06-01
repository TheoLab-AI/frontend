"use client";

import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { ContactCTA } from "@/components/ui/ContactCTA";

export function ConsultoriaHero() {
	return (
		<section
			id="consultoria-hero"
			aria-labelledby="consultoria-hero-headline"
			className="relative isolate overflow-hidden border-b border-[var(--color-divider)]"
		>
			<HeroBackground />

			<div className="container-brand relative pt-28 pb-24 md:pt-36 md:pb-32">
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
						<span className="text-mono text-[0.7rem]">TL · FIRMAS LEGALES</span>
						<span aria-hidden="true">·</span>
						<span>Colombia · 2026</span>
					</motion.div>

					{/* Headline */}
					<motion.h1
						variants={fadeUp}
						id="consultoria-hero-headline"
						className="text-display max-w-4xl text-[var(--color-fg)] [text-wrap:balance]"
					>
						Recupere entre <span className="text-brand-gradient font-semibold">18 y 27</span> horas
						profesionales al mes.{" "}
						<span className="text-[var(--color-fg-muted)]">Medidas, no prometidas.</span>
					</motion.h1>

					{/* Subhead */}
					<motion.p
						variants={fadeUp}
						className="text-body-lg max-w-2xl text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed"
					>
						Inteligencia artificial aplicada a firmas legales colombianas: criterio sobre dónde
						recupera horas y baja riesgo.
					</motion.p>

					{/* CTA */}
					<motion.div variants={fadeUp} className="pt-2">
						<ContactCTA
							whatsappText="Hola, quiero agendar la reunión de introducción para mi firma."
							emailSubject="Reunión de introducción — TheoLab"
						/>
					</motion.div>
				</motion.div>
			</div>

			{/* Footer meta — editorial pagination */}
			<div className="container-brand relative flex items-end justify-between pb-8 text-meta text-[var(--color-fg-muted)]">
				<span className="text-mono text-[0.7rem]">— CONSULTORÍA · 01.0</span>
				<span className="text-mono text-[0.7rem]">2026 · THEOLAB</span>
			</div>
		</section>
	);
}

/**
 * Hero background — Golden Hour gradient bar at the bottom of the section,
 * matching the institutional Hero. No grain on UI (brand v0.3 rule).
 */
function HeroBackground() {
	return (
		<div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(120% 80% at 80% 0%, oklch(0.96 0.02 80 / 0.55) 0%, transparent 60%)",
				}}
			/>
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
