"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { ReactElement } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";

/* =========================================================================
 * F07 · CTA final
 *
 * Cierre con dos canales: WhatsApp + correo. Copy literal del prototipo
 * HTML v3. Tema onyx para break contra las secciones alabaster previas y
 * cerrar con peso.
 * ========================================================================= */

interface CtaCard {
	label: string;
	value: string;
	cap: string;
	href: string;
	external: boolean;
}

const CTA_CARDS: readonly CtaCard[] = [
	{
		label: "Por WhatsApp",
		value: "+57 XXX XXX XXXX",
		cap: "Respuesta el mismo día.",
		href: "https://wa.me/57XXXXXXXXXX?text=Hola%2C%20quiero%20agendar%20la%20reuni%C3%B3n%20de%20introducci%C3%B3n%20para%20mi%20firma.",
		external: true,
	},
	{
		label: "Por correo",
		value: "admin@theolab.tech",
		cap: "Respuesta en menos de 24 horas.",
		href: "mailto:admin@theolab.tech?subject=Reuni%C3%B3n%20de%20introducci%C3%B3n%20%E2%80%94%20TheoLab",
		external: false,
	},
] as const;

export function CTAFinal(): ReactElement {
	return (
		<section
			id="cta"
			aria-labelledby="cta-headline"
			className="border-b border-[var(--color-divider)] bg-[var(--color-onyx)] text-[var(--color-alabaster)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.08)}
					className="flex flex-col gap-14 md:gap-16"
				>
					{/* Header */}
					<motion.div variants={fadeUp} className="flex flex-col gap-5 max-w-3xl">
						<div className="flex items-center gap-3 text-meta uppercase tracking-[0.22em] text-[var(--color-alabaster)]/60">
							<span aria-hidden="true" className="text-[var(--color-gold)]">
								●
							</span>
							<span>Siguiente paso</span>
						</div>
						<h2
							id="cta-headline"
							className="text-headline text-[var(--color-alabaster)] [text-wrap:balance]"
						>
							Veinte minutos. Sin compromiso. En su agenda.
						</h2>
						<p
							className="text-body-lg text-[var(--color-alabaster)]/70 [text-wrap:pretty] max-w-2xl"
							style={{ lineHeight: 1.6 }}
						>
							La reunión de introducción es gratis y dura veinte minutos. Conversamos, le contamos
							cómo trabajamos, y usted decide. Sin presentación de ventas.
						</p>
					</motion.div>

					{/* CTA cards */}
					<motion.div
						variants={stagger(0.1)}
						className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-alabaster)]/12"
					>
						{CTA_CARDS.map((c) => (
							<motion.a
								key={c.label}
								href={c.href}
								target={c.external ? "_blank" : undefined}
								rel={c.external ? "noopener noreferrer" : undefined}
								variants={fadeUp}
								className="group relative bg-[var(--color-onyx)] p-8 md:p-10 flex flex-col gap-5 min-h-[200px] transition-colors duration-300 hover:bg-[color-mix(in_oklab,var(--color-onyx)_85%,var(--color-alabaster))]"
							>
								<p className="text-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-gold)]">
									{c.label}
								</p>
								<p className="text-display [font-family:var(--font-display)] text-[var(--color-alabaster)] leading-none break-all">
									{c.value}
								</p>
								<p className="text-body text-[var(--color-alabaster)]/65 mt-auto">{c.cap}</p>
								<ArrowUpRight
									aria-hidden="true"
									className="absolute top-8 right-8 md:top-10 md:right-10 h-5 w-5 text-[var(--color-alabaster)]/40 transition-all duration-300 group-hover:text-[var(--color-gold)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								/>
							</motion.a>
						))}
					</motion.div>

					{/* Post mono */}
					<motion.p
						variants={fadeUp}
						className="text-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-alabaster)]/45"
					>
						THEOLAB · BOGOTÁ · COLOMBIA
						<br />
						admin@theolab.tech
					</motion.p>
				</motion.div>
			</div>
		</section>
	);
}
