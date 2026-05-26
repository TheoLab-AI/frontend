"use client";

import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { SectionLabel } from "@/components/ui/SectionLabel";

const PRINCIPLES = [
	{
		idx: "P-1",
		title: "IA construye IA",
		body: "Cada herramienta nuestra produce, evalúa o despliega inteligencia. El laboratorio no diseña presentaciones — diseña sistemas.",
	},
	{
		idx: "P-2",
		title: "Evidencia antes que promesa",
		body: "Métricas medidas, repositorios públicos, tags reproducibles. La confianza es un subproducto del rigor, no de la narrativa.",
	},
	{
		idx: "P-3",
		title: "Zero-cost sostenible",
		body: "OSS + free tiers como restricción de diseño. La eficiencia económica es prueba de eficiencia técnica.",
	},
] as const;

export function Philosophy() {
	return (
		<section
			id="philosophy"
			aria-labelledby="philosophy-headline"
			className="border-b border-[var(--color-divider)]"
		>
			<div className="container-brand py-24 md:py-32">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
					variants={stagger(0.08)}
					className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16"
				>
					<motion.div variants={fadeUp} className="lg:col-span-5 flex flex-col gap-6">
						<SectionLabel index="04" label="Filosofía" />
						<h2
							id="philosophy-headline"
							className="text-headline text-[var(--color-fg)] [text-wrap:balance]"
						>
							El laboratorio detrás de la IA aplicada.
						</h2>
						<p className="text-body-lg text-[var(--color-fg-muted)] [text-wrap:pretty]">
							TheoLab opera bajo tres principios no negociables. Cada decisión técnica, comercial y
							operativa pasa por ellos.
						</p>
					</motion.div>

					<motion.ol variants={stagger(0.07)} className="lg:col-span-7 flex flex-col">
						{PRINCIPLES.map((p) => (
							<motion.li
								key={p.idx}
								variants={fadeUp}
								className="
									flex flex-col gap-3
									border-t border-[var(--color-divider)] py-8
									last:border-b
								"
							>
								<div className="flex items-baseline gap-4">
									<span className="text-mono text-[0.75rem] text-[var(--color-crimson)] font-medium">
										{p.idx}
									</span>
									<h3 className="text-title text-[var(--color-fg)]">{p.title}</h3>
								</div>
								<p className="text-body text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed pl-8">
									{p.body}
								</p>
							</motion.li>
						))}
					</motion.ol>
				</motion.div>
			</div>
		</section>
	);
}
