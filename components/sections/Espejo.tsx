"use client";

import { motion } from "motion/react";
import type { ReactElement } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";

/* =========================================================================
 * F02 · El Espejo
 *
 * Tres síntomas numerados (01/02/03) que reflejan el problema que la firma
 * ya conoce. Copy literal del prototipo HTML v3. Tema alabaster con divider
 * top para conectar con el Hero onyx que viene arriba.
 * ========================================================================= */

interface Sintoma {
	num: string;
	title: string;
	body: string;
}

const SINTOMAS: readonly Sintoma[] = [
	{
		num: "01",
		title: "Horas perdidas en producción",
		body: "Sus abogados senior dedican tardes enteras a redactar lo que ya redactaron diez veces, a buscar en expedientes y a revisar formatos. El conocimiento está en sus cabezas — el tiempo se va en lo mecánico.",
	},
	{
		num: "02",
		title: "El junior que usa ChatGPT",
		body: "Alguien en su firma ya pega documentos de clientes en herramientas públicas, sin control y sin criterio. La adopción ya ocurre. La pregunta es si ocurre bajo su secreto profesional o en contra de él.",
	},
	{
		num: "03",
		title: "La propuesta perdida",
		body: "El cliente preguntó el martes y la propuesta salió el viernes. No por falta de talento — por falta de tiempo. Los asuntos que mejor paga su firma compiten con los que solo la ocupan.",
	},
] as const;

export function Espejo(): ReactElement {
	return (
		<section
			id="espejo"
			aria-labelledby="espejo-headline"
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
						<h2
							id="espejo-headline"
							className="text-headline text-[var(--color-onyx)] [text-wrap:balance]"
						>
							Tres síntomas que no son del mercado.
						</h2>
					</motion.div>

					{/* Síntomas grid */}
					<motion.div
						variants={stagger(0.1)}
						className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-divider)]"
					>
						{SINTOMAS.map((s) => (
							<motion.article
								key={s.num}
								variants={fadeUp}
								className="bg-[var(--color-alabaster)] p-8 md:p-10 flex flex-col gap-5 min-h-[280px]"
							>
								<span className="text-mono text-[0.85rem] tracking-[0.12em] text-[var(--color-crimson)]">
									{s.num}
								</span>
								<h3 className="text-title text-[var(--color-onyx)] [text-wrap:balance]">
									{s.title}
								</h3>
								<p className="text-body text-[var(--color-slate)]" style={{ lineHeight: 1.65 }}>
									{s.body}
								</p>
							</motion.article>
						))}
					</motion.div>

					{/* Cierre editorial */}
					<motion.p
						variants={fadeUp}
						className="text-body-lg italic max-w-3xl text-[var(--color-slate)] [text-wrap:pretty]"
						style={{ lineHeight: 1.55 }}
					>
						La pregunta correcta no es qué herramienta usar — es qué cambia en su firma con
						criterio.
					</motion.p>
				</motion.div>
			</div>
		</section>
	);
}
