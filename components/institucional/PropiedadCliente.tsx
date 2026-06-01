"use client";

import { motion } from "motion/react";
import { fadeUp, stagger } from "@/components/motion/variants";
import { SectionLabel } from "@/components/ui/SectionLabel";

const LAYERS = [
	{
		idx: "Lo suyo",
		title: "Lo suyo es suyo",
		body: "El entorno, los datos, la configuración y el Diagnóstico viven en su infraestructura. No los concentramos.",
	},
	{
		idx: "El motor",
		title: "El motor es nuestro, operado por usted sin fricción",
		body: "La plataforma que lo hace posible es licencia de TheoLab, que operamos remotamente. Usted obtiene el resultado sin heredar complejidad técnica ni quedar atado a un proveedor.",
	},
] as const;

export function PropiedadCliente() {
	return (
		<section
			id="propiedad-cliente"
			aria-labelledby="propiedad-cliente-headline"
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
						<SectionLabel index="03" label="Propiedad del cliente" />
						<h2
							id="propiedad-cliente-headline"
							className="text-headline text-[var(--color-fg)] [text-wrap:balance]"
						>
							Usted es dueño de lo que construimos para usted.
						</h2>
						<p className="text-body-lg text-[var(--color-fg-muted)] [text-wrap:pretty]">
							Su entorno, sus datos, la configuración de sus agentes y su Diagnóstico son suyos —{" "}
							<span className="text-[var(--color-fg)]">desde el primer día y al terminar.</span>
						</p>
					</motion.div>

					<motion.dl variants={stagger(0.07)} className="lg:col-span-6 flex flex-col">
						{LAYERS.map((layer) => (
							<motion.div
								key={layer.title}
								variants={fadeUp}
								className="
									flex flex-col gap-3
									border-t border-[var(--color-divider)] py-8
									last:border-b
								"
							>
								<div className="flex items-baseline gap-4">
									<span className="text-mono text-[0.7rem] text-[var(--color-crimson)] font-medium">
										{layer.idx}
									</span>
									<dt className="text-title text-[var(--color-fg)] [text-wrap:balance]">
										{layer.title}
									</dt>
								</div>
								<dd className="text-body text-[var(--color-fg-muted)] [text-wrap:pretty] leading-relaxed pl-8">
									{layer.body}
								</dd>
							</motion.div>
						))}
					</motion.dl>
				</motion.div>
			</div>
		</section>
	);
}
