"use client";

import { motion } from "motion/react";
import type { ReactElement } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { Wordmark } from "@/components/ui/Wordmark";

/* =========================================================================
 * F09 · Footer (Consultoría)
 *
 * Cierre con wordmark + meta + hairline + legal + copyright. Copy literal
 * del prototipo HTML v3. Tema onyx para continuar con el CTA Final que
 * viene arriba.
 * ========================================================================= */

export function ConsultoriaFooter(): ReactElement {
	return (
		<footer className="bg-[var(--color-onyx)] text-[var(--color-alabaster)]">
			<div className="container-brand py-16 md:py-20">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
					variants={stagger(0.08)}
					className="flex flex-col gap-10"
				>
					{/* Wordmark */}
					<motion.div variants={fadeUp}>
						<Wordmark className="text-[var(--color-alabaster)]" size="lg" />
					</motion.div>

					{/* Meta */}
					<motion.p
						variants={fadeUp}
						className="text-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-alabaster)]/55"
					>
						Bogotá · Colombia · 2026
						<br />
						admin@theolab.tech
					</motion.p>

					{/* Hairline */}
					<motion.hr
						variants={fadeUp}
						className="border-0 border-t border-[var(--color-alabaster)]/15"
					/>

					{/* Legal + copyright */}
					<motion.div variants={fadeUp} className="flex flex-col gap-3">
						<p
							className="text-body text-[var(--color-alabaster)]/65 max-w-2xl"
							style={{ lineHeight: 1.6 }}
						>
							TheoLab opera bajo políticas de habeas data (Ley 1581) y respeto al secreto
							profesional.
						</p>
						<p className="text-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-alabaster)]/40">
							© 2026 TheoLab AI. Todos los derechos reservados.
							<br />
							theolab.tech
						</p>
					</motion.div>
				</motion.div>
			</div>
		</footer>
	);
}
