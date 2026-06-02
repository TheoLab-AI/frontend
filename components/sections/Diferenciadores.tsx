"use client";

import { motion } from "motion/react";
import type { ReactElement } from "react";
import { fadeUp, stagger } from "@/components/motion/variants";

/* =========================================================================
 * F05 · Diferenciadores
 *
 * Tres bloques numerados verticales: Vertical legal / Su firma dueña /
 * ROI medido. Copy literal del prototipo HTML v3. Tema alabaster, layout
 * lista editorial con regla mono entre número y título.
 * ========================================================================= */

interface Diferenciador {
	num: string;
	title: string;
	body: string;
}

const DIFERENCIADORES: readonly Diferenciador[] = [
	{
		num: "01",
		title: "Vertical legal específica",
		body: "Hablamos el lenguaje del socio fundador, no el del departamento de TI. Entendemos qué es un matter, por qué el secreto profesional no se negocia y dónde se pierde el margen de una firma legal colombiana. No somos generalistas que aprenden sobre la marcha.",
	},
	{
		num: "02",
		title: "Su firma es dueña de lo suyo",
		body: "Su entorno. Sus datos. Su configuración. El Diagnóstico y todo lo que documenta es de la firma desde el primer día. Nosotros operamos el motor bajo licencia — usted nunca queda atado a una persona ni a una caja negra que no controla.",
	},
	{
		num: "03",
		title: "ROI medido, no prometido",
		body: "La Consultoría estima las horas a recuperar con cifras sobre su firma, no con promedios genéricos. La Implementación entrega esas horas medidas en producción, contra la línea base que ya levantamos. Si no se mide, no lo decimos.",
	},
] as const;

export function Diferenciadores(): ReactElement {
	return (
		<section
			id="diferenciadores"
			aria-labelledby="diferenciadores-headline"
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
							<span>Diferenciadores</span>
						</div>
						<h2
							id="diferenciadores-headline"
							className="text-headline text-[var(--color-onyx)] [text-wrap:balance]"
						>
							Tres cosas. En este orden.
						</h2>
					</motion.div>

					{/* Lista vertical */}
					<motion.div
						variants={stagger(0.1)}
						className="flex flex-col divide-y divide-[var(--color-divider)]"
					>
						{DIFERENCIADORES.map((d) => (
							<motion.div
								key={d.num}
								variants={fadeUp}
								className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-12"
							>
								<div className="md:col-span-4 flex items-baseline gap-4">
									<span className="text-mono text-[0.85rem] tracking-[0.12em] text-[var(--color-crimson)]">
										{d.num}
									</span>
									<span
										aria-hidden="true"
										className="text-mono text-[0.65rem] tracking-[0.4em] text-[var(--color-slate)]/40"
									>
										————
									</span>
									<h3 className="text-title text-[var(--color-onyx)] [text-wrap:balance]">
										{d.title}
									</h3>
								</div>
								<p
									className="md:col-span-8 text-body-lg text-[var(--color-slate)] [text-wrap:pretty] max-w-2xl"
									style={{ lineHeight: 1.6 }}
								>
									{d.body}
								</p>
							</motion.div>
						))}
					</motion.div>

					{/* Cierre */}
					<motion.p
						variants={fadeUp}
						className="text-body-lg italic max-w-3xl text-[var(--color-slate)] [text-wrap:pretty]"
						style={{ lineHeight: 1.55 }}
					>
						No prometemos transformación. La Consultoría entrega criterio medible. Las horas las
						entrega la Implementación, cuando los agentes corren en producción.
					</motion.p>
				</motion.div>
			</div>
		</section>
	);
}
