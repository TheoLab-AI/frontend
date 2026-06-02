"use client";

import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { SectionLabel } from "@/components/ui/SectionLabel";

const SUPPORTS = [
	{
		idx: "C-1",
		title: "Confidencialidad",
		body: "La información de sus clientes está protegida por el secreto profesional. Como usted es dueño de su entorno y de sus datos, esa información permanece bajo su control y no sale de su dominio.",
	},
	{
		idx: "C-2",
		title: "Continuidad",
		body: "La capacidad queda instalada en su firma. Su entorno, la configuración de sus agentes y su Diagnóstico siguen siendo suyos y operativos: su trabajo no depende de nuestra permanencia.",
	},
] as const;

export function OwnershipSection() {
	return (
		<section
			id="propiedad"
			aria-labelledby="propiedad-headline"
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
					<motion.div variants={fadeUp} className="lg:col-span-6 flex flex-col gap-6">
						<SectionLabel index="03" label="Propiedad y confidencialidad" />
						<h2
							id="propiedad-headline"
							className="text-headline text-[var(--color-fg)] [text-wrap:balance]"
						>
							Usted es dueño de su entorno, sus datos, la configuración de sus agentes y su
							Diagnóstico —{" "}
							<span className="text-[var(--color-fg-muted)]">
								desde el primer día y al terminar.
							</span>
						</h2>
						<p className="text-body-lg text-[var(--color-fg-muted)] [text-wrap:pretty]">
							La propiedad no es una concesión al final del trabajo: es la condición desde el primer
							día. Eso resuelve dos cosas que un socio no puede dejar al azar.
						</p>
					</motion.div>

					<motion.dl variants={stagger(0.07)} className="lg:col-span-6 flex flex-col">
						{SUPPORTS.map((s) => (
							<motion.div
								key={s.idx}
								variants={fadeUp}
								className="
									flex flex-col gap-3
									border-t border-[var(--color-divider)] py-8
									last:border-b
								"
							>
								<div className="flex items-baseline gap-4">
									<span className="text-mono text-[0.75rem] text-[var(--color-crimson)] font-medium">
										{s.idx}
									</span>
									<dt className="text-title text-[var(--color-fg)]">{s.title}</dt>
								</div>
								<dd className="text-body text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed pl-8">
									{s.body}
								</dd>
							</motion.div>
						))}
					</motion.dl>
				</motion.div>
			</div>
		</section>
	);
}
