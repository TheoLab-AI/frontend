"use client";

import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactElement } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";

/* =========================================================================
 * F06 · Para Quién
 *
 * Split 2 columnas: a quién atendemos / a quién no atendemos. Copy literal
 * del prototipo HTML v3. Tema alabaster.
 * ========================================================================= */

const ATENDEMOS: readonly string[] = [
	"Operan en Colombia, con socio fundador involucrado en las decisiones.",
	"Tienen entre 5 y 50 abogados y práctica activa.",
	"Sienten alguno de los tres síntomas — y lo reconocen.",
	"Buscan implementar IA con criterio, no comprar una herramienta más.",
] as const;

const NO_ATENDEMOS: readonly string[] = [
	"Firmas contables — pronto, no hoy.",
	"Agencias o equipos de marketing fuera de nuestro foco.",
	"Firmas con equipo técnico interno que ya resuelve esto por su cuenta.",
] as const;

export function ParaQuien(): ReactElement {
	return (
		<section
			id="para-quien"
			aria-labelledby="paraquien-headline"
			className="border-b border-[var(--color-divider)] bg-[var(--color-alabaster)] text-[var(--color-onyx)]"
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
						<div className="flex items-center gap-3 text-meta uppercase tracking-[0.22em] text-[var(--color-slate)]">
							<span aria-hidden="true" className="text-[var(--color-crimson)]">
								●
							</span>
							<span>A quién servimos</span>
						</div>
						<h2
							id="paraquien-headline"
							className="text-headline text-[var(--color-onyx)] [text-wrap:balance]"
						>
							Firmas legales colombianas, 5 a 50 abogados, con práctica activa.
						</h2>
						<p
							className="text-body-lg text-[var(--color-slate)] [text-wrap:pretty] max-w-2xl"
							style={{ lineHeight: 1.6 }}
						>
							Trabajamos mejor con firmas que ya saben dónde van y necesitan el cómo. La honestidad
							sobre el encaje nos ahorra tiempo a los dos.
						</p>
					</motion.div>

					{/* Split 2-col */}
					<motion.div
						variants={stagger(0.12)}
						className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-divider)]"
					>
						{/* Atendemos */}
						<motion.div
							variants={fadeUp}
							className="bg-[var(--color-alabaster)] p-8 md:p-10 flex flex-col gap-6"
						>
							<p className="text-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-crimson)]">
								Atendemos firmas que
							</p>
							<ul className="flex flex-col gap-4">
								{ATENDEMOS.map((item) => (
									<li
										key={item}
										className="flex items-start gap-3 text-body text-[var(--color-onyx)]"
										style={{ lineHeight: 1.55 }}
									>
										<Check
											aria-hidden="true"
											className="h-4 w-4 mt-1 shrink-0 text-[var(--color-crimson)]"
											strokeWidth={2.4}
										/>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</motion.div>

						{/* No atendemos */}
						<motion.div
							variants={fadeUp}
							className="bg-[var(--color-alabaster)] p-8 md:p-10 flex flex-col gap-6"
						>
							<p className="text-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-slate)]">
								No atendemos (todavía)
							</p>
							<ul className="flex flex-col gap-4">
								{NO_ATENDEMOS.map((item) => (
									<li
										key={item}
										className="flex items-start gap-3 text-body text-[var(--color-slate)]"
										style={{ lineHeight: 1.55 }}
									>
										<X
											aria-hidden="true"
											className="h-4 w-4 mt-1 shrink-0 text-[var(--color-slate)]/60"
											strokeWidth={2.4}
										/>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
